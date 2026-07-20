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

            IReadOnlyList<DesignProductionDto> production = [];
            IReadOnlyList<DesignInventoryDto> inventory = [];
            IReadOnlyList<DesignActivityTimelineDto> activityTimeline = [];
            try
            {
                production = await QueryProductionAsync(connection, designId, cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
            {
                logger.LogWarning(ex, "Embedded production query failed for DesignId={DesignId}", designId);
            }

            try
            {
                inventory = await QueryInventoryAsync(connection, designId, cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
            {
                logger.LogWarning(ex, "Embedded inventory query failed for DesignId={DesignId}", designId);
            }

            try
            {
                activityTimeline = await QueryActivityTimelineAsync(connection, designId, cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
            {
                logger.LogWarning(ex, "Embedded activity timeline query failed for DesignId={DesignId}", designId);
            }

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

    public async Task<DesignProductionDto> GetProductionByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = connectionFactory.CreateConnection();
            if (connection.State != ConnectionState.Open)
            {
                connection.Open();
            }

            var fromProdSlip = await QueryProductionSummaryAsync(connection, designId, cancellationToken);
            if (fromProdSlip.ProductionQuantity != 0
                || fromProdSlip.CompletedQuantity != 0
                || fromProdSlip.PendingQuantity != 0
                || fromProdSlip.RejectedQuantity != 0
                || fromProdSlip.ProductionDate.HasValue)
            {
                return fromProdSlip;
            }

            // Fallback: ItemDesign → Product → Bo_trn → Bo_mas (booking quantities / dates).
            return await QueryProductionFromBoAsync(connection, designId, cancellationToken);
        }
        catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
        {
            logger.LogWarning(ex, "Production query failed for DesignId={DesignId}; returning empty defaults", designId);
            return DesignProductionDto.Empty;
        }
    }

    public async Task<DesignInventoryDto> GetInventoryByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = connectionFactory.CreateConnection();
            if (connection.State != ConnectionState.Open)
            {
                connection.Open();
            }

            var rows = await QueryInventoryAsync(connection, designId, cancellationToken);
            if (rows.Count == 0)
            {
                return DesignInventoryDto.Empty;
            }

            // Single summary for the tab UI: totals + location of the largest stock row.
            var primary = rows[0];
            return new DesignInventoryDto
            {
                CurrentStock = rows.Sum(r => r.CurrentStock),
                ReservedStock = rows.Sum(r => r.ReservedStock),
                AvailableStock = rows.Sum(r => r.AvailableStock),
                PendingStock = rows.Sum(r => r.PendingStock),
                Warehouse = primary.Warehouse,
                Rack = primary.Rack,
                Location = primary.Location,
                BatchNumber = primary.BatchNumber
            };
        }
        catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
        {
            logger.LogWarning(ex, "Inventory query failed for DesignId={DesignId}; returning empty defaults", designId);
            return DesignInventoryDto.Empty;
        }
    }

    public async Task<IReadOnlyList<DesignActivityItemDto>> GetActivityTimelineByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = connectionFactory.CreateConnection();
            if (connection.State != ConnectionState.Open)
            {
                connection.Open();
            }

            var rows = await QueryActivityTimelineAsync(connection, designId, cancellationToken);
            return [.. rows.Select(r => new DesignActivityItemDto
            {
                Title = r.Title,
                Description = r.Description,
                // ISO-like local timestamp for the existing timeline UI
                ActivityDate = r.Date?.ToString("yyyy-MM-dd'T'HH:mm:ss") ?? string.Empty,
                Icon = string.IsNullOrWhiteSpace(r.Icon) ? "pi pi-circle" : r.Icon,
                Color = string.IsNullOrWhiteSpace(r.Color) ? "#64748b" : r.Color
            })];
        }
        catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
        {
            logger.LogWarning(ex, "Activity timeline query failed for DesignId={DesignId}; returning empty list", designId);
            return [];
        }
    }

    private static async Task<IReadOnlyList<DesignProductionDto>> QueryProductionAsync(
        IDbConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        var summary = await QueryProductionSummaryAsync(connection, designId, cancellationToken);
        if (summary.ProductionQuantity == 0
            && summary.CompletedQuantity == 0
            && summary.PendingQuantity == 0
            && summary.RejectedQuantity == 0
            && summary.ProductionDate is null)
        {
            return [];
        }

        return [summary];
    }

    private static async Task<DesignProductionDto> QueryProductionSummaryAsync(
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
                MAX(pm.ProdSlipDate) AS ProductionDate,
                ISNULL(MAX(m.MachineName), '') AS Machine,
                ISNULL(MAX(pr.ProcessName), '') AS Department,
                ISNULL(MAX(e.EmplName), '') AS Supervisor
            FROM ProdSlip_trn pt
            INNER JOIN ProdSlip_mas pm ON pm.ProdSlipId = pt.ProdSlipId
            LEFT JOIN Process pr ON pr.ProcessId = COALESCE(pt.ProcessId, pm.ProcessId)
            LEFT JOIN Machine m ON m.MachineId = pt.MachineId
            LEFT JOIN Employee e ON e.EmplId = COALESCE(pm.InspEmplId, pm.Saved_Emp)
            WHERE pt.DesignId = @DesignId;
            """;

        var row = await connection.QuerySingleOrDefaultAsync<DesignProductionRow>(
            new CommandDefinition(sql, new { DesignId = designId }, cancellationToken: cancellationToken));

        if (row is null)
        {
            return DesignProductionDto.Empty;
        }

        return new DesignProductionDto
        {
            ProductionQuantity = row.ProductionQuantity,
            CompletedQuantity = row.CompletedQuantity,
            PendingQuantity = row.PendingQuantity,
            RejectedQuantity = row.RejectedQuantity,
            ProductionDate = row.ProductionDate,
            Machine = row.Machine?.Trim() ?? string.Empty,
            Department = row.Department?.Trim() ?? string.Empty,
            Supervisor = row.Supervisor?.Trim() ?? string.Empty
        };
    }

    private static async Task<DesignProductionDto> QueryProductionFromBoAsync(
        IDbConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                SUM(bt.Quantity) AS ProductionQuantity,
                CAST(0 AS DECIMAL(18, 3)) AS CompletedQuantity,
                CAST(0 AS DECIMAL(18, 3)) AS PendingQuantity,
                CAST(0 AS DECIMAL(18, 3)) AS RejectedQuantity,
                MAX(bm.BoDate) AS ProductionDate,
                CAST('' AS NVARCHAR(100)) AS Machine,
                CAST('' AS NVARCHAR(100)) AS Department,
                CAST('' AS NVARCHAR(100)) AS Supervisor
            FROM ItemDesign d
            INNER JOIN Product p ON d.DesignId = p.DesignId
            INNER JOIN Bo_trn bt ON p.ProductId = bt.ProductId
            INNER JOIN Bo_mas bm ON bt.BoId = bm.BoId
            WHERE d.DesignId = @DesignId;
            """;

        try
        {
            var row = await connection.QuerySingleOrDefaultAsync<DesignProductionRow>(
                new CommandDefinition(sql, new { DesignId = designId }, cancellationToken: cancellationToken));

            if (row is null || row.ProductionQuantity == 0 && row.ProductionDate is null)
            {
                return DesignProductionDto.Empty;
            }

            return new DesignProductionDto
            {
                ProductionQuantity = row.ProductionQuantity,
                CompletedQuantity = 0,
                PendingQuantity = 0,
                RejectedQuantity = 0,
                ProductionDate = row.ProductionDate,
                Machine = string.Empty,
                Department = string.Empty,
                Supervisor = string.Empty
            };
        }
        catch
        {
            return DesignProductionDto.Empty;
        }
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

    /// <summary>
    /// Builds timeline events from existing SQL tables only.
    /// Icons/colors match the original demo timeline markers.
    /// Each source is isolated so a missing table never fails the whole response.
    /// </summary>
    private static async Task<IReadOnlyList<DesignActivityTimelineDto>> QueryActivityTimelineAsync(
        IDbConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        var events = new List<DesignActivityTimelineDto>();

        await TryAddActivityRowsAsync(connection, designId, cancellationToken, events, """
            SELECT TOP 1
                'created' AS Type,
                'Created' AS Title,
                CONCAT('Design ', ISNULL(NULLIF(LTRIM(RTRIM(d.DesignCode)), ''), CAST(d.DesignId AS VARCHAR(20))), ' created') AS Description,
                CAST(COALESCE(d.Saved_Time, d.DesignDate, d.CreatedDate) AS DATETIME) AS Date,
                'pi pi-plus-circle' AS Icon,
                '#2563eb' AS Color
            FROM ItemDesign d
            WHERE d.DesignId = @DesignId
              AND COALESCE(d.Saved_Time, d.DesignDate, d.CreatedDate) IS NOT NULL;
            """);

        await TryAddActivityRowsAsync(connection, designId, cancellationToken, events, """
            SELECT TOP 20
                CASE WHEN ISNULL(pm.Closed, 0) = 1 THEN 'production-completed' ELSE 'production-started' END AS Type,
                CASE WHEN ISNULL(pm.Closed, 0) = 1 THEN 'Production Completed' ELSE 'Production Started' END AS Title,
                CONCAT(
                    'Slip #', pm.ProdSlipNumber,
                    ' · Qty ', CAST(SUM(pt.Quantity) AS VARCHAR(40)),
                    CASE WHEN MAX(pr.ProcessName) IS NULL THEN '' ELSE CONCAT(' · ', MAX(pr.ProcessName)) END
                ) AS Description,
                CAST(pm.ProdSlipDate AS DATETIME) AS Date,
                CASE WHEN ISNULL(pm.Closed, 0) = 1 THEN 'pi pi-check-circle' ELSE 'pi pi-play' END AS Icon,
                CASE WHEN ISNULL(pm.Closed, 0) = 1 THEN '#16a34a' ELSE '#2563eb' END AS Color
            FROM ProdSlip_trn pt
            INNER JOIN ProdSlip_mas pm ON pm.ProdSlipId = pt.ProdSlipId
            LEFT JOIN Process pr ON pr.ProcessId = COALESCE(pt.ProcessId, pm.ProcessId)
            WHERE pt.DesignId = @DesignId
            GROUP BY pm.ProdSlipId, pm.ProdSlipNumber, pm.ProdSlipDate, pm.Closed
            HAVING SUM(pt.Quantity) <> 0 OR SUM(ISNULL(pt.RejQty, 0)) <> 0
            ORDER BY pm.ProdSlipDate DESC;
            """);

        await TryAddActivityRowsAsync(connection, designId, cancellationToken, events, """
            SELECT TOP 20
                CASE
                    WHEN ISNULL(sl.RecQty, 0) > 0 AND ISNULL(sl.IssQty, 0) = 0 THEN 'downloaded'
                    WHEN ISNULL(sl.IssQty, 0) > 0 AND ISNULL(sl.RecQty, 0) = 0 THEN 'updated'
                    ELSE 'updated'
                END AS Type,
                CASE
                    WHEN ISNULL(sl.RecQty, 0) > 0 AND ISNULL(sl.IssQty, 0) = 0 THEN 'Downloaded'
                    WHEN ISNULL(sl.IssQty, 0) > 0 AND ISNULL(sl.RecQty, 0) = 0 THEN 'Updated'
                    ELSE 'Updated'
                END AS Title,
                CONCAT(
                    ISNULL(NULLIF(LTRIM(RTRIM(sl.Details)), ''), 'Stock movement'),
                    ' · Rec ', CAST(ISNULL(sl.RecQty, 0) AS VARCHAR(40)),
                    ' · Iss ', CAST(ISNULL(sl.IssQty, 0) AS VARCHAR(40))
                ) AS Description,
                CAST(ISNULL(sl.Saved_Time, sl.DocDate) AS DATETIME) AS Date,
                CASE
                    WHEN ISNULL(sl.RecQty, 0) > 0 AND ISNULL(sl.IssQty, 0) = 0 THEN 'pi pi-download'
                    WHEN ISNULL(sl.IssQty, 0) > 0 AND ISNULL(sl.RecQty, 0) = 0 THEN 'pi pi-pencil'
                    ELSE 'pi pi-pencil'
                END AS Icon,
                CASE
                    WHEN ISNULL(sl.RecQty, 0) > 0 AND ISNULL(sl.IssQty, 0) = 0 THEN '#0891b2'
                    WHEN ISNULL(sl.IssQty, 0) > 0 AND ISNULL(sl.RecQty, 0) = 0 THEN '#7c3aed'
                    ELSE '#7c3aed'
                END AS Color
            FROM StockDet_Log sl
            WHERE sl.DesignId = @DesignId
              AND ISNULL(sl.Saved_Time, sl.DocDate) IS NOT NULL
            ORDER BY ISNULL(sl.Saved_Time, sl.DocDate) DESC;
            """);

        // Bo_mas / Bo_trn booking activity (try BoId then BoSl join keys).
        await TryAddActivityRowsAsync(connection, designId, cancellationToken, events, """
            SELECT TOP 20
                'created' AS Type,
                'Created' AS Title,
                CONCAT('Booking #', ISNULL(CAST(bm.BoNumber AS VARCHAR(40)), CAST(bm.BoId AS VARCHAR(40))), ' · Qty ', CAST(SUM(bt.Quantity) AS VARCHAR(40))) AS Description,
                CAST(bm.BoDate AS DATETIME) AS Date,
                'pi pi-plus-circle' AS Icon,
                '#2563eb' AS Color
            FROM ItemDesign d
            INNER JOIN Product p ON p.DesignId = d.DesignId
            INNER JOIN Bo_trn bt ON bt.ProductId = p.ProductId
            INNER JOIN Bo_mas bm ON bm.BoId = bt.BoId
            WHERE d.DesignId = @DesignId
              AND bm.BoDate IS NOT NULL
            GROUP BY bm.BoId, bm.BoNumber, bm.BoDate
            ORDER BY bm.BoDate DESC;
            """);

        await TryAddActivityRowsAsync(connection, designId, cancellationToken, events, """
            SELECT TOP 20
                'created' AS Type,
                'Created' AS Title,
                CONCAT('Booking · Qty ', CAST(SUM(bt.Quantity) AS VARCHAR(40))) AS Description,
                CAST(bm.BoDate AS DATETIME) AS Date,
                'pi pi-plus-circle' AS Icon,
                '#2563eb' AS Color
            FROM ItemDesign d
            INNER JOIN Product p ON p.DesignId = d.DesignId
            INNER JOIN Bo_trn bt ON bt.ProductId = p.ProductId
            INNER JOIN Bo_mas bm ON bm.BoSl = bt.BoSl
            WHERE d.DesignId = @DesignId
              AND bm.BoDate IS NOT NULL
            GROUP BY bm.BoSl, bm.BoDate
            ORDER BY bm.BoDate DESC;
            """);

        return [.. events
            .Where(e => e.Date.HasValue)
            .OrderByDescending(e => e.Date)
            .Take(50)];
    }

    private static async Task TryAddActivityRowsAsync(
        IDbConnection connection,
        int designId,
        CancellationToken cancellationToken,
        List<DesignActivityTimelineDto> target,
        string sql)
    {
        try
        {
            var rows = await connection.QueryAsync<DesignActivityRow>(
                new CommandDefinition(sql, new { DesignId = designId }, cancellationToken: cancellationToken));

            foreach (var r in rows)
            {
                if (r.Date is null)
                {
                    continue;
                }

                target.Add(new DesignActivityTimelineDto
                {
                    Type = r.Type?.Trim() ?? string.Empty,
                    Title = r.Title?.Trim() ?? string.Empty,
                    Description = r.Description?.Trim() ?? string.Empty,
                    Date = r.Date,
                    Icon = string.IsNullOrWhiteSpace(r.Icon) ? "pi pi-circle" : r.Icon.Trim(),
                    Color = string.IsNullOrWhiteSpace(r.Color) ? "#64748b" : r.Color.Trim()
                });
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
        {
            // Missing table/column for this source — skip and continue with other sources.
        }
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
