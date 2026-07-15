using System.Data;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;
using Dapper;

namespace DesignDashboard.Api.Repositories;

public sealed class DesignRepository(
    ISqlConnectionFactory connectionFactory,
    ILogger<DesignRepository> logger) : IDesignRepository
{
    public async Task<IReadOnlyList<DesignListItemDto>> GetDesignsAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var sales = await ExecuteCustomerSalesSqlAsync(filter, cancellationToken);
            if (sales.Count == 0)
            {
                logger.LogInformation(
                    "Design sales SQL returned 0 rows for AccountId={AccountId} Start={Start} End={End}",
                    filter.CustomerAccountId, filter.StartDate, filter.EndDate);
                return [];
            }

            var designIds = sales.Select(s => s.DesignId).Distinct().ToArray();

            // Images are best-effort: never fail the whole designs list if ImgThumbData load fails.
            IReadOnlyList<DesignImageRow> imageRows = [];
            string? customerName = null;
            try
            {
                var imagesTask = GetDesignImagesAsync(designIds, cancellationToken);
                var customerNameTask = GetAccountNameAsync(filter.CustomerAccountId, cancellationToken);
                await Task.WhenAll(imagesTask, customerNameTask);
                imageRows = await imagesTask;
                customerName = await customerNameTask;
            }
            catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
            {
                logger.LogWarning(ex, "Design image/account enrichment failed; returning sales rows without thumbnails");
                customerName ??= await GetAccountNameAsync(filter.CustomerAccountId, cancellationToken);
            }

            var imageLookup = imageRows
                .GroupBy(x => x.DesignId)
                .ToDictionary(g => g.Key, g => g.First());

            logger.LogInformation(
                "Design sales SQL returned {Count} rows for AccountId={AccountId}",
                sales.Count, filter.CustomerAccountId);

            return [.. sales.Select(s =>
            {
                imageLookup.TryGetValue(s.DesignId, out var imageRow);
                return new DesignListItemDto
                {
                    DesignId = s.DesignId,
                    DesignCode = s.DesignCode?.Trim() ?? string.Empty,
                    DesignName = s.DesignName?.Trim() ?? string.Empty,
                    CustomerName = customerName
                        ?? imageRow?.CustomerName?.Trim()
                        ?? string.Empty,
                    ImageThumbnail = ImageHelper.ToBase64DataUrl(imageRow?.ImgThumbData),
                    SalesQty = s.TotalSalesQty,
                    SalesValue = s.TotalSalesAmount,
                    PendingOrders = s.PendingOrder,
                    PendingProcess = s.PendingProcess
                };
            })];
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetDesignsAsync failed for AccountId={AccountId}", filter.CustomerAccountId);
            throw;
        }
    }

    public async Task<DesignDetailDto?> GetDesignByIdAsync(
        int designId,
        DesignFilterRequest? filter = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            const string designSql = """
                SELECT
                    d.DesignId,
                    d.DesignCode,
                    d.DesignName,
                    d.ImgThumbData,
                    CAST(d.AccountId AS INT) AS AccountId,
                    a.AccountName AS CustomerName,
                    dc.DesCatName AS CategoryName
                FROM ItemDesign d
                LEFT JOIN Account a ON a.AccountId = d.AccountId
                LEFT JOIN DesignCat dc ON dc.DesCatId = d.DesCatId
                WHERE d.DesignId = @DesignId;
                """;

            using var connection = connectionFactory.CreateConnection();
            if (connection.State != ConnectionState.Open)
            {
                connection.Open();
            }

            var design = await connection.QuerySingleOrDefaultAsync<DesignHeaderRow>(
                new CommandDefinition(designSql, new { DesignId = designId }, cancellationToken: cancellationToken));

            if (design is null)
            {
                return null;
            }

            var filterParams = BuildDesignFilterParams(designId, filter);

            var sales = await connection.QuerySingleOrDefaultAsync<CustomerSalesResult>(
                new CommandDefinition(CustomerSalesSql.ByDesignId, filterParams, cancellationToken: cancellationToken));

            var products = await QueryProductsAsync(connection, designId, cancellationToken);
            var orders = await QueryOrdersAsync(connection, filterParams, cancellationToken);
            var monthly = await QueryMonthlySalesAsync(connection, filterParams, cancellationToken);
            var yearly = await QueryYearlySalesAsync(connection, filterParams, cancellationToken);
            var lastSold = await QueryLastSoldDateAsync(connection, filterParams, cancellationToken);
            var production = await QueryProductionAsync(connection, designId, cancellationToken);
            var inventory = await QueryInventoryAsync(connection, designId, cancellationToken);
            var activityTimeline = await QueryActivityTimelineAsync(connection, designId, cancellationToken);

            var accountId = filter?.CustomerAccountId > 0
                ? filter.CustomerAccountId
                : design.AccountId;

            AccountRow? account = null;
            if (accountId is > 0)
            {
                account = await QueryAccountDetailsAsync(connection, accountId.Value, cancellationToken);
            }

            var salesQty = sales?.TotalSalesQty ?? 0;
            var salesValue = sales?.TotalSalesAmount ?? 0;

            return new DesignDetailDto
            {
                DesignId = design.DesignId,
                DesignCode = design.DesignCode?.Trim() ?? string.Empty,
                DesignName = design.DesignName?.Trim() ?? string.Empty,
                CustomerName = account?.AccountName
                    ?? design.CustomerName?.Trim()
                    ?? string.Empty,
                ImageThumbnail = ImageHelper.ToBase64DataUrl(design.ImgThumbData),
                CategoryName = design.CategoryName?.Trim(),
                SalesQty = salesQty,
                SalesValue = salesValue,
                PendingOrders = sales?.PendingOrder ?? 0,
                PendingProcess = sales?.PendingProcess ?? 0,
                LastSoldDate = lastSold,
                AverageSellingPrice = salesQty > 0 ? Math.Round(salesValue / salesQty, 2) : 0,
                ProductDetails = products,
                AccountDetails = account is null
                    ? null
                    : new AccountDetailDto
                    {
                        AccountId = account.AccountId,
                        AccountName = account.AccountName,
                        AccountCode = account.AccountCode,
                        Address = account.Address,
                        Email = account.Email,
                        TelNo = account.TelNo,
                        GstNo = account.GstNo
                    },
                Orders = orders,
                MonthlySales = monthly,
                YearlySales = yearly,
                Production = production,
                Inventory = inventory,
                ActivityTimeline = activityTimeline
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetDesignByIdAsync failed for DesignId={DesignId}", designId);
            throw;
        }
    }

    private async Task<IReadOnlyList<CustomerSalesResult>> ExecuteCustomerSalesSqlAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var accountId = filter.CustomerAccountId;
        var startDate = DateHelper.StartOfDay(filter.StartDate);
        var endDate = DateHelper.EndOfDay(filter.EndDate);

        logger.LogInformation(
            "Design sales SQL AccountId={AccountId} Start={StartDate} End={EndDate}",
            accountId, startDate, endDate);

        using var connection = connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<CustomerSalesResult>(
            new CommandDefinition(
                CustomerSalesSql.ByAccountAndDateRange,
                new { AccountId = accountId, StartDate = startDate, EndDate = endDate },
                cancellationToken: cancellationToken,
                commandTimeout: 120));

        return [.. rows];
    }

    private async Task<IReadOnlyList<DesignImageRow>> GetDesignImagesAsync(
        int[] designIds,
        CancellationToken cancellationToken)
    {
        if (designIds.Length == 0)
        {
            return [];
        }

        const string sql = """
            SELECT
                d.DesignId,
                d.ImgThumbData,
                CAST(d.AccountId AS INT) AS AccountId,
                a.AccountName AS CustomerName
            FROM ItemDesign d
            LEFT JOIN Account a ON a.AccountId = d.AccountId
            WHERE d.DesignId IN @DesignIds;
            """;

        using var connection = connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<DesignImageRow>(
            new CommandDefinition(
                sql,
                new { DesignIds = designIds },
                cancellationToken: cancellationToken,
                commandTimeout: 120));
        return [.. rows];
    }

    private async Task<string?> GetAccountNameAsync(int accountId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT AccountName
            FROM Account
            WHERE AccountId = @AccountId;
            """;

        using var connection = connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<string>(
            new CommandDefinition(sql, new { AccountId = accountId }, cancellationToken: cancellationToken));
    }

    private static async Task<IReadOnlyList<ProductDetailDto>> QueryProductsAsync(
        IDbConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                p.ProductId,
                p.ProductName,
                p.BarCode,
                p.NetWt,
                p.Composition,
                p.Active
            FROM Product p
            WHERE p.DesignId = @DesignId
            ORDER BY p.ProductName;
            """;

        var rows = await connection.QueryAsync<ProductRow>(
            new CommandDefinition(sql, new { DesignId = designId }, cancellationToken: cancellationToken));

        return [.. rows.Select(p => new ProductDetailDto
        {
            ProductId = p.ProductId,
            ProductName = p.ProductName?.Trim() ?? string.Empty,
            BarCode = p.BarCode,
            NetWt = p.NetWt,
            Composition = p.Composition,
            Active = p.Active == 1
        })];
    }

    private static async Task<IReadOnlyList<DesignOrderDto>> QueryOrdersAsync(
        IDbConnection connection,
        object filterParams,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                CAST(bm.BillId AS NVARCHAR(50)) AS OrderNo,
                ISNULL(a.AccountName, '') AS Customer,
                bm.BillDate AS OrderDate,
                bet.Quantity AS Quantity,
                (bet.Amount * bm.ExchRate) AS Amount
            FROM Bill_mas bm
            INNER JOIN Bill_Exp_trn bet ON bm.BillId = bet.BillId
            INNER JOIN Bo_trn bo ON bet.BoSl = bo.BoSl
            INNER JOIN Product p ON bo.ProductId = p.ProductId
            LEFT JOIN Account a ON a.AccountId = bm.AccountId
            WHERE p.DesignId = @DesignId
              AND (@AccountId IS NULL OR bm.AccountId = @AccountId)
              AND (@StartDate IS NULL OR bm.BillDate >= @StartDate)
              AND (@EndDate IS NULL OR bm.BillDate <= @EndDate)
            ORDER BY bm.BillDate DESC;
            """;

        var rows = await connection.QueryAsync<DesignOrderRow>(
            new CommandDefinition(sql, filterParams, cancellationToken: cancellationToken));

        return [.. rows.Select(r => new DesignOrderDto
        {
            OrderNo = r.OrderNo,
            Customer = r.Customer?.Trim() ?? string.Empty,
            OrderDate = r.OrderDate,
            DeliveryDate = null,
            Quantity = r.Quantity,
            PendingQuantity = 0,
            Amount = r.Amount,
            Status = "Billed",
            ProcessingStage = "Completed"
        })];
    }

    private static async Task<IReadOnlyList<DesignSalesPointDto>> QueryMonthlySalesAsync(
        IDbConnection connection,
        object filterParams,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                FORMAT(bm.BillDate, 'yyyy-MM') AS Label,
                SUM(bet.Quantity) AS Quantity,
                SUM(bet.Amount * bm.ExchRate) AS Value
            FROM Bill_mas bm
            INNER JOIN Bill_Exp_trn bet ON bm.BillId = bet.BillId
            INNER JOIN Bo_trn bo ON bet.BoSl = bo.BoSl
            INNER JOIN Product p ON bo.ProductId = p.ProductId
            WHERE p.DesignId = @DesignId
              AND (@AccountId IS NULL OR bm.AccountId = @AccountId)
              AND (@StartDate IS NULL OR bm.BillDate >= @StartDate)
              AND (@EndDate IS NULL OR bm.BillDate <= @EndDate)
            GROUP BY FORMAT(bm.BillDate, 'yyyy-MM')
            ORDER BY Label;
            """;

        var rows = await connection.QueryAsync<DesignSalesPointRow>(
            new CommandDefinition(sql, filterParams, cancellationToken: cancellationToken));

        return [.. rows.Select(r => new DesignSalesPointDto
        {
            Label = r.Label,
            Quantity = r.Quantity,
            Value = r.Value
        })];
    }

    private static async Task<IReadOnlyList<DesignSalesPointDto>> QueryYearlySalesAsync(
        IDbConnection connection,
        object filterParams,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                CAST(YEAR(bm.BillDate) AS NVARCHAR(10)) AS Label,
                SUM(bet.Quantity) AS Quantity,
                SUM(bet.Amount * bm.ExchRate) AS Value
            FROM Bill_mas bm
            INNER JOIN Bill_Exp_trn bet ON bm.BillId = bet.BillId
            INNER JOIN Bo_trn bo ON bet.BoSl = bo.BoSl
            INNER JOIN Product p ON bo.ProductId = p.ProductId
            WHERE p.DesignId = @DesignId
              AND (@AccountId IS NULL OR bm.AccountId = @AccountId)
              AND (@StartDate IS NULL OR bm.BillDate >= @StartDate)
              AND (@EndDate IS NULL OR bm.BillDate <= @EndDate)
            GROUP BY YEAR(bm.BillDate)
            ORDER BY YEAR(bm.BillDate);
            """;

        var rows = await connection.QueryAsync<DesignSalesPointRow>(
            new CommandDefinition(sql, filterParams, cancellationToken: cancellationToken));

        return [.. rows.Select(r => new DesignSalesPointDto
        {
            Label = r.Label,
            Quantity = r.Quantity,
            Value = r.Value
        })];
    }

    private static Task<DateTime?> QueryLastSoldDateAsync(
        IDbConnection connection,
        object filterParams,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT MAX(bm.BillDate) AS LastSoldDate
            FROM Bill_mas bm
            INNER JOIN Bill_Exp_trn bet ON bm.BillId = bet.BillId
            INNER JOIN Bo_trn bo ON bet.BoSl = bo.BoSl
            INNER JOIN Product p ON bo.ProductId = p.ProductId
            WHERE p.DesignId = @DesignId
              AND (@AccountId IS NULL OR bm.AccountId = @AccountId)
              AND (@StartDate IS NULL OR bm.BillDate >= @StartDate)
              AND (@EndDate IS NULL OR bm.BillDate <= @EndDate);
            """;

        return connection.QuerySingleOrDefaultAsync<DateTime?>(
            new CommandDefinition(sql, filterParams, cancellationToken: cancellationToken));
    }

    private static async Task<IReadOnlyList<DesignProductionDto>> QueryProductionAsync(
        IDbConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                SUM(pt.Quantity) AS ProductionQuantity,
                SUM(CASE WHEN ISNULL(pm.Closed, 0) = 1 THEN pt.Quantity ELSE 0 END) AS CompletedQuantity,
                SUM(CASE WHEN ISNULL(pm.Closed, 0) = 0 THEN pt.Quantity ELSE 0 END) AS PendingQuantity,
                SUM(ISNULL(pt.RejQty, 0)) AS RejectedQuantity,
                ISNULL(MAX(m.MachineName), '') AS Machine,
                ISNULL(MAX(pr.ProcessName), '') AS Department,
                ISNULL(MAX(e.EmplName), '') AS Supervisor
            FROM ProdSlip_trn pt
            INNER JOIN ProdSlip_mas pm ON pm.ProdSlipId = pt.ProdSlipId
            LEFT JOIN Process pr ON pr.ProcessId = COALESCE(pt.ProcessId, pm.ProcessId)
            LEFT JOIN Machine m ON m.MachineId = pt.MachineId
            LEFT JOIN Employee e ON e.EmplId = COALESCE(pm.InspEmplId, pm.Saved_Emp)
            WHERE pt.DesignId = @DesignId
            GROUP BY
                ISNULL(m.MachineName, ''),
                ISNULL(pr.ProcessName, ''),
                ISNULL(e.EmplName, '')
            HAVING SUM(pt.Quantity) <> 0 OR SUM(ISNULL(pt.RejQty, 0)) <> 0
            ORDER BY SUM(pt.Quantity) DESC;
            """;

        var rows = await connection.QueryAsync<DesignProductionRow>(
            new CommandDefinition(sql, new { DesignId = designId }, cancellationToken: cancellationToken));

        return [.. rows.Select(r => new DesignProductionDto
        {
            ProductionQuantity = r.ProductionQuantity,
            CompletedQuantity = r.CompletedQuantity,
            PendingQuantity = r.PendingQuantity,
            RejectedQuantity = r.RejectedQuantity,
            Machine = r.Machine?.Trim() ?? string.Empty,
            Department = r.Department?.Trim() ?? string.Empty,
            Supervisor = r.Supervisor?.Trim() ?? string.Empty
        })];
    }

    private static async Task<IReadOnlyList<DesignInventoryDto>> QueryInventoryAsync(
        IDbConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                SUM(ISNULL(sd.RecQty, 0) - ISNULL(sd.IssQty, 0)) AS CurrentStock,
                ISNULL(MAX(reserved.ReservedQty), 0) AS ReservedStock,
                SUM(ISNULL(sd.RecQty, 0) - ISNULL(sd.IssQty, 0))
                    - ISNULL(MAX(reserved.ReservedQty), 0) AS AvailableStock,
                CAST(0 AS DECIMAL(18, 3)) AS PendingStock,
                ISNULL(MAX(a.AccountName), '') AS Warehouse,
                ISNULL(MAX(r.RackName), '') AS Rack,
                ISNULL(CAST(sd.ShelfId AS VARCHAR(20)), '') AS Location,
                ISNULL(MAX(b.BatchName), ISNULL(CAST(MAX(b.BatchNumber) AS VARCHAR(50)), '')) AS BatchNumber
            FROM StockDet sd
            LEFT JOIN Rack r ON r.RackId = sd.RackId
            LEFT JOIN Batch b ON b.BatchId = sd.BatchId
            LEFT JOIN Account a ON a.AccountId = sd.AccountId
            LEFT JOIN (
                SELECT
                    sd2.DesignId,
                    sd2.RackId,
                    sd2.ShelfId,
                    sd2.BatchId,
                    sd2.AccountId,
                    SUM(ISNULL(ba.AllocatedQty, 0)) AS ReservedQty
                FROM StockDet sd2
                INNER JOIN BatchAllocate ba ON ba.BatchId = sd2.BatchId
                    AND (ba.RackId IS NULL OR ba.RackId = sd2.RackId)
                    AND (ba.ShelfId IS NULL OR ba.ShelfId = sd2.ShelfId)
                WHERE sd2.DesignId = @DesignId
                  AND sd2.BatchId IS NOT NULL
                GROUP BY sd2.DesignId, sd2.RackId, sd2.ShelfId, sd2.BatchId, sd2.AccountId
            ) reserved ON reserved.DesignId = sd.DesignId
                AND ISNULL(reserved.RackId, -1) = ISNULL(sd.RackId, -1)
                AND ISNULL(reserved.ShelfId, -1) = ISNULL(sd.ShelfId, -1)
                AND ISNULL(reserved.BatchId, -1) = ISNULL(sd.BatchId, -1)
                AND ISNULL(reserved.AccountId, -1) = ISNULL(sd.AccountId, -1)
            WHERE sd.DesignId = @DesignId
            GROUP BY
                sd.AccountId,
                sd.RackId,
                sd.ShelfId,
                sd.BatchId
            HAVING SUM(ISNULL(sd.RecQty, 0) - ISNULL(sd.IssQty, 0)) <> 0
                OR ISNULL(MAX(reserved.ReservedQty), 0) <> 0
            ORDER BY SUM(ISNULL(sd.RecQty, 0) - ISNULL(sd.IssQty, 0)) DESC;
            """;

        var rows = await connection.QueryAsync<DesignInventoryRow>(
            new CommandDefinition(sql, new { DesignId = designId }, cancellationToken: cancellationToken));

        return [.. rows.Select(r => new DesignInventoryDto
        {
            CurrentStock = r.CurrentStock,
            ReservedStock = r.ReservedStock,
            AvailableStock = r.AvailableStock,
            PendingStock = r.PendingStock,
            Warehouse = r.Warehouse?.Trim() ?? string.Empty,
            Rack = r.Rack?.Trim() ?? string.Empty,
            Location = r.Location?.Trim() ?? string.Empty,
            BatchNumber = r.BatchNumber?.Trim() ?? string.Empty
        })];
    }

    private static async Task<IReadOnlyList<DesignActivityTimelineDto>> QueryActivityTimelineAsync(
        IDbConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT TOP 50
                Type,
                Title,
                Description,
                Date,
                Icon,
                Color
            FROM (
                SELECT
                    'production' AS Type,
                    'Production Slip' AS Title,
                    CONCAT(
                        'Slip #', pm.ProdSlipNumber,
                        ' · Qty ', CAST(SUM(pt.Quantity) AS VARCHAR(40)),
                        ' · Rej ', CAST(SUM(ISNULL(pt.RejQty, 0)) AS VARCHAR(40)),
                        CASE WHEN MAX(pr.ProcessName) IS NULL THEN '' ELSE CONCAT(' · ', MAX(pr.ProcessName)) END
                    ) AS Description,
                    CAST(pm.ProdSlipDate AS DATETIME) AS Date,
                    'pi pi-cog' AS Icon,
                    '#2563eb' AS Color
                FROM ProdSlip_trn pt
                INNER JOIN ProdSlip_mas pm ON pm.ProdSlipId = pt.ProdSlipId
                LEFT JOIN Process pr ON pr.ProcessId = COALESCE(pt.ProcessId, pm.ProcessId)
                WHERE pt.DesignId = @DesignId
                GROUP BY pm.ProdSlipId, pm.ProdSlipNumber, pm.ProdSlipDate

                UNION ALL

                SELECT
                    CASE
                        WHEN ISNULL(sl.RecQty, 0) > 0 AND ISNULL(sl.IssQty, 0) = 0 THEN 'receipt'
                        WHEN ISNULL(sl.IssQty, 0) > 0 AND ISNULL(sl.RecQty, 0) = 0 THEN 'issue'
                        ELSE 'stock'
                    END AS Type,
                    CASE
                        WHEN ISNULL(sl.RecQty, 0) > 0 AND ISNULL(sl.IssQty, 0) = 0 THEN 'Stock Receipt'
                        WHEN ISNULL(sl.IssQty, 0) > 0 AND ISNULL(sl.RecQty, 0) = 0 THEN 'Stock Issue'
                        ELSE 'Stock Movement'
                    END AS Title,
                    CONCAT(
                        ISNULL(NULLIF(LTRIM(RTRIM(sl.Details)), ''), 'Stock movement'),
                        ' · Rec ', CAST(ISNULL(sl.RecQty, 0) AS VARCHAR(40)),
                        ' · Iss ', CAST(ISNULL(sl.IssQty, 0) AS VARCHAR(40))
                    ) AS Description,
                    CAST(ISNULL(sl.Saved_Time, sl.DocDate) AS DATETIME) AS Date,
                    CASE
                        WHEN ISNULL(sl.RecQty, 0) > 0 AND ISNULL(sl.IssQty, 0) = 0 THEN 'pi pi-download'
                        WHEN ISNULL(sl.IssQty, 0) > 0 AND ISNULL(sl.RecQty, 0) = 0 THEN 'pi pi-upload'
                        ELSE 'pi pi-box'
                    END AS Icon,
                    CASE
                        WHEN ISNULL(sl.RecQty, 0) > 0 AND ISNULL(sl.IssQty, 0) = 0 THEN '#16a34a'
                        WHEN ISNULL(sl.IssQty, 0) > 0 AND ISNULL(sl.RecQty, 0) = 0 THEN '#d97706'
                        ELSE '#64748b'
                    END AS Color
                FROM StockDet_Log sl
                WHERE sl.DesignId = @DesignId
            ) activity
            WHERE Date IS NOT NULL
            ORDER BY Date DESC;
            """;

        var rows = await connection.QueryAsync<DesignActivityRow>(
            new CommandDefinition(sql, new { DesignId = designId }, cancellationToken: cancellationToken));

        return [.. rows.Select(r => new DesignActivityTimelineDto
        {
            Type = r.Type?.Trim() ?? string.Empty,
            Title = r.Title?.Trim() ?? string.Empty,
            Description = r.Description?.Trim() ?? string.Empty,
            Date = r.Date,
            Icon = r.Icon?.Trim() ?? "pi pi-circle",
            Color = r.Color?.Trim() ?? "#64748b"
        })];
    }

    private static Task<AccountRow?> QueryAccountDetailsAsync(
        IDbConnection connection,
        int accountId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                CAST(AccountId AS INT) AS AccountId,
                AccountName,
                AccountCode,
                Address,
                Email,
                TelNo,
                GstNo
            FROM Account
            WHERE AccountId = @AccountId;
            """;

        return connection.QuerySingleOrDefaultAsync<AccountRow>(
            new CommandDefinition(sql, new { AccountId = accountId }, cancellationToken: cancellationToken));
    }

    private static object BuildDesignFilterParams(int designId, DesignFilterRequest? filter) =>
        filter is { CustomerAccountId: > 0 }
            ? new
            {
                DesignId = designId,
                AccountId = (int?)filter.CustomerAccountId,
                StartDate = (DateTime?)DateHelper.StartOfDay(filter.StartDate),
                EndDate = (DateTime?)DateHelper.EndOfDay(filter.EndDate)
            }
            : new
            {
                DesignId = designId,
                AccountId = (int?)null,
                StartDate = (DateTime?)null,
                EndDate = (DateTime?)null
            };
}
