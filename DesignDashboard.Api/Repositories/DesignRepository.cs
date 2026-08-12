using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Thin wrapper over dbo.Usp_DesignDashboard_New.
/// Incoming route id is ProductId only. DesignId comes only from GetProductHeader.
/// </summary>
public sealed class DesignRepository(
    ISqlConnectionFactory connectionFactory,
    ILogger<DesignRepository> logger) : IDesignRepository
{
    public async Task<DesignDetailDto?> GetDesignByIdAsync(
        int designId,
        DesignFilterRequest? filter = null,
        CancellationToken cancellationToken = default)
    {
        var productId = designId;

        if (productId <= 0)
        {
            logger.LogWarning("[Detail] Rejected IncomingProductId={ProductId}", productId);
            return null;
        }

        logger.LogInformation("[Detail] Start IncomingProductId={ProductId}", productId);

        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            // 1) GetProductHeader(@ProductId, @DesignId = ProductId gate). No ResolveIds.
            var header = await CallProductHeaderAsync(connection, productId, productId, cancellationToken)
                .ConfigureAwait(false);

            if (header is null)
            {
                logger.LogWarning(
                    "[Detail] NotFound Action=GetProductHeader IncomingProductId={ProductId} Rows=0",
                    productId);
                return null;
            }

            var resolvedDesignId = header.DesignId;
            if (resolvedDesignId <= 0)
            {
                logger.LogWarning(
                    "[Detail] NotFound GetProductHeader DesignId<=0 IncomingProductId={ProductId}",
                    productId);
                return null;
            }

            logger.LogInformation(
                "[Detail] IncomingProductId={ProductId} ResolvedDesignId={DesignId} HeaderProductName={ProductName} ImageBytes={ImageBytes}",
                productId,
                resolvedDesignId,
                header.ProductName,
                header.ImgThumbData?.Length ?? 0);

            var (accountFilter, startDate, endDate) = FilterParams(filter);
            var accountIdForDetails = header.AccountId is > 0 ? header.AccountId.Value : 0;

            // Parallel SP reads — await ALL before mapping.
            var salesTask = OnNewConnectionAsync(
                c => CallProductSalesAsync(c, productId, accountFilter, startDate, endDate, cancellationToken),
                cancellationToken);
            var productsTask = OnNewConnectionAsync(
                c => CallProductsByDesignAsync(c, productId, resolvedDesignId, cancellationToken),
                cancellationToken);
            var ordersTask = OnNewConnectionAsync(
                c => CallOrdersByProductAsync(c, productId, accountFilter, startDate, endDate, cancellationToken),
                cancellationToken);
            var monthlyTask = OnNewConnectionAsync(
                c => CallMonthlySalesAsync(c, productId, resolvedDesignId, accountFilter, startDate, endDate, cancellationToken),
                cancellationToken);
            var yearlyTask = OnNewConnectionAsync(
                c => CallYearlySalesAsync(c, productId, resolvedDesignId, accountFilter, startDate, endDate, cancellationToken),
                cancellationToken);
            var lastSoldTask = OnNewConnectionAsync(
                c => CallLastSoldAsync(c, productId, resolvedDesignId, accountFilter, startDate, endDate, cancellationToken),
                cancellationToken);
            var productionTask = OnNewConnectionAsync(
                c => CallProductionAsync(c, productId, resolvedDesignId, cancellationToken),
                cancellationToken);
            var inventoryTask = OnNewConnectionAsync(
                c => CallInventoryAsync(c, productId, resolvedDesignId, cancellationToken),
                cancellationToken);
            var accountTask = accountIdForDetails > 0
                ? OnNewConnectionAsync(
                    c => CallAccountDetailsAsync(c, productId, resolvedDesignId, accountIdForDetails, cancellationToken),
                    cancellationToken)
                : Task.FromResult<AccountRow?>(null);

            await Task.WhenAll(
                    salesTask, productsTask, ordersTask, monthlyTask, yearlyTask,
                    lastSoldTask, productionTask, inventoryTask, accountTask)
                .ConfigureAwait(false);

            var sales = await salesTask.ConfigureAwait(false);
            var productDetails = await productsTask.ConfigureAwait(false);
            var orders = await ordersTask.ConfigureAwait(false);
            var monthly = await monthlyTask.ConfigureAwait(false);
            var yearly = await yearlyTask.ConfigureAwait(false);
            var lastSold = await lastSoldTask.ConfigureAwait(false);
            var production = await productionTask.ConfigureAwait(false);
            var inventory = await inventoryTask.ConfigureAwait(false);
            var account = await accountTask.ConfigureAwait(false);

            WarnBadProductDetails(productId, resolvedDesignId, productDetails);

            var imageThumbnail = ImageHelper.ToBase64DataUrl(header.ImgThumbData);

            logger.LogInformation(
                "[Detail] Mapped IncomingProductId={ProductId} MappedDesignId={DesignId} ImageBytes={ImageBytes} SalesQty={SalesQty} ProductDetails={Products} Orders={Orders} Production={Production} Inventory={Inventory}",
                productId,
                resolvedDesignId,
                header.ImgThumbData?.Length ?? 0,
                sales?.TotalSalesQty,
                productDetails.Count,
                orders.Count,
                production.Count,
                inventory.Count);

            // General + image from GetProductHeader only — never overwrite with "-", null, or fabricated zeros.
            return new DesignDetailDto
            {
                ProductId = productId,
                DesignId = resolvedDesignId,
                DesignCode = TrimOrEmpty(header.DesignCode),
                DesignName = TrimOrEmpty(header.DesignName),
                CustomerName = TrimOrEmpty(account?.AccountName),
                ImageThumbnail = imageThumbnail,
                ProductName = HeaderText(header.ProductName),
                CategoryName = HeaderText(header.ProductCategory),
                Material = HeaderText(header.Material),
                NetWeight = header.NetWeight,
                CurrentQuantity = header.CurrentQuantity,
                SalesQty = sales?.TotalSalesQty ?? 0,
                SalesValue = sales?.TotalSalesAmount ?? 0,
                PendingOrders = sales?.PendingOrder ?? 0,
                PendingProcess = sales?.PendingProcess ?? 0,
                LastSoldDate = lastSold,
                AverageSellingPrice = 0,
                ProductDetails = productDetails,
                AccountDetails = MapAccount(account),
                Orders = orders,
                MonthlySales = monthly,
                YearlySales = yearly,
                Production = production,
                Inventory = inventory
            };
        }
        catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
        {
            logger.LogError(ex, "[Detail] failed IncomingProductId={ProductId}", productId);
            throw;
        }
    }

    public async Task<IReadOnlyList<DesignProductionDto>> GetProductionByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        var productId = designId;
        if (productId <= 0)
        {
            throw new ArgumentException("productId must be greater than zero.", nameof(designId));
        }

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        var header = await CallProductHeaderAsync(connection, productId, productId, cancellationToken)
            .ConfigureAwait(false);
        if (header is null || header.DesignId <= 0)
        {
            throw new KeyNotFoundException(
                $"GetProductHeader returned no row for ProductId={productId}.");
        }

        return await CallProductionAsync(connection, productId, header.DesignId, cancellationToken)
            .ConfigureAwait(false);
    }

    public async Task<DesignInventoryDto> GetInventoryByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        var productId = designId;
        if (productId <= 0)
        {
            throw new ArgumentException("productId must be greater than zero.", nameof(designId));
        }

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        var header = await CallProductHeaderAsync(connection, productId, productId, cancellationToken)
            .ConfigureAwait(false);
        if (header is null || header.DesignId <= 0)
        {
            throw new KeyNotFoundException(
                $"GetProductHeader returned no row for ProductId={productId}.");
        }

        var rows = await CallInventoryAsync(connection, productId, header.DesignId, cancellationToken)
            .ConfigureAwait(false);
        // SP row only — do not fabricate CurrentStock=0 via Empty when GetInventory returns no row.
        if (rows.Count == 0)
        {
            throw new KeyNotFoundException(
                $"GetInventory returned no row for ProductId={productId}, DesignId={header.DesignId}.");
        }

        return rows[0];
    }

    public async Task<IReadOnlyList<AccountDetailDto>> GetOtherCustomersByProductIdAsync(
        int designId,
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var productId = designId;
        if (productId <= 0)
        {
            throw new ArgumentException("productId must be greater than zero.", nameof(designId));
        }

        if (accountId <= 0)
        {
            throw new ArgumentException("accountId must be greater than zero.", nameof(accountId));
        }

        if (endDate.Date < startDate.Date)
        {
            throw new ArgumentException("endDate cannot be less than startDate.", nameof(endDate));
        }

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        return await CallOtherCustomersAsync(
                connection,
                productId,
                accountId,
                DateHelper.StartOfDay(startDate),
                DateHelper.EndOfDay(endDate),
                cancellationToken)
            .ConfigureAwait(false);
    }

    // ─── SP callers ────────────────────────────────────────────────────────

    private async Task<DesignHeaderRow?> CallProductHeaderAsync(
        SqlConnection connection, int productId, int designIdGate, CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetProductHeader);
        SpCallHelper.AddInt(p, "@ProductId", productId);
        SpCallHelper.AddInt(p, "@DesignId", designIdGate);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Params=@ProductId={ProductId},@DesignId={DesignId}",
            DesignDashboardSp.Actions.GetProductHeader, productId, designIdGate, productId, designIdGate);

        var row = await SpCallHelper.QueryFirstOrDefaultAsync<DesignHeaderRow>(
            connection, logger, DesignDashboardSp.Actions.GetProductHeader, p,
            productId, productId, designIdGate, ct, commandTimeout: 120).ConfigureAwait(false);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} ProductName={ProductName} ImageBytes={ImageBytes} Rows={Rows}",
            DesignDashboardSp.Actions.GetProductHeader,
            productId,
            row?.DesignId,
            row?.ProductName,
            row?.ImgThumbData?.Length ?? 0,
            row is null ? 0 : 1);

        return row;
    }

    private async Task<CustomerSalesResult?> CallProductSalesAsync(
        SqlConnection connection, int productId, int? accountId, DateTime? start, DateTime? end,
        CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetProductSales);
        SpCallHelper.AddInt(p, "@ProductId", productId);
        SpCallHelper.AddOptionalInt(p, "@AccountId", accountId);
        SpCallHelper.AddOptionalDateTime(p, "@StartDate", start);
        SpCallHelper.AddOptionalDateTime(p, "@EndDate", end);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId= Params=@ProductId={ProductId},@AccountId={AccountId},@StartDate={Start},@EndDate={End}",
            DesignDashboardSp.Actions.GetProductSales, productId, productId, accountId, start, end);

        var row = await SpCallHelper.QueryFirstOrDefaultAsync<CustomerSalesResult>(
            connection, logger, DesignDashboardSp.Actions.GetProductSales, p,
            productId, productId, designId: null, ct).ConfigureAwait(false);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} SalesQty={SalesQty} Rows={Rows}",
            DesignDashboardSp.Actions.GetProductSales,
            productId,
            row?.DesignId,
            row?.TotalSalesQty,
            row is null ? 0 : 1);

        return row;
    }

    private async Task<IReadOnlyList<ProductDetailDto>> CallProductsByDesignAsync(
        SqlConnection connection, int productId, int designId, CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetProductsByDesign);
        SpCallHelper.AddInt(p, "@DesignId", designId);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Params=@DesignId={DesignId}",
            DesignDashboardSp.Actions.GetProductsByDesign, productId, designId, designId);

        var rows = await SpCallHelper.QueryAsync<ProductRow>(
            connection, logger, DesignDashboardSp.Actions.GetProductsByDesign, p,
            productId, productId, designId, ct).ConfigureAwait(false);

        // SP rows only — never fabricate ProductId=0 / ProductName="-" rows.
        var mapped = rows
            .Where(r => r.ProductId > 0)
            .Select(r => new ProductDetailDto
            {
                ProductId = r.ProductId,
                ProductName = TrimOrEmpty(r.ProductName),
                BarCode = TrimOrNull(r.BarCode),
                NetWt = r.NetWt,
                Composition = TrimOrNull(r.Composition),
                Active = r.Active == 1
            })
            .ToList();

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Rows={Rows}",
            DesignDashboardSp.Actions.GetProductsByDesign, productId, designId, mapped.Count);

        return mapped;
    }

    private async Task<IReadOnlyList<DesignOrderDto>> CallOrdersByProductAsync(
        SqlConnection connection, int productId, int? accountId, DateTime? start, DateTime? end,
        CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetOrdersByProduct);
        SpCallHelper.AddInt(p, "@ProductId", productId);
        SpCallHelper.AddOptionalInt(p, "@AccountId", accountId);
        SpCallHelper.AddOptionalDateTime(p, "@StartDate", start);
        SpCallHelper.AddOptionalDateTime(p, "@EndDate", end);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId= Params=@ProductId={ProductId},@AccountId={AccountId}",
            DesignDashboardSp.Actions.GetOrdersByProduct, productId, productId, accountId);

        var rows = await SpCallHelper.QueryAsync<DesignOrderRow>(
            connection, logger, DesignDashboardSp.Actions.GetOrdersByProduct, p,
            productId, productId, designId: null, ct).ConfigureAwait(false);

        var mapped = rows.Select(r => new DesignOrderDto
        {
            OrderNo = TrimOrEmpty(r.OrderNo),
            Customer = TrimOrEmpty(r.Customer),
            OrderDate = r.OrderDate,
            Quantity = r.Quantity,
            Amount = r.Amount
        }).ToList();

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId= Rows={Rows}",
            DesignDashboardSp.Actions.GetOrdersByProduct, productId, mapped.Count);

        return mapped;
    }

    private async Task<IReadOnlyList<DesignSalesPointDto>> CallMonthlySalesAsync(
        SqlConnection connection, int productId, int designId, int? accountId, DateTime? start, DateTime? end,
        CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetMonthlySales);
        SpCallHelper.AddInt(p, "@DesignId", designId);
        SpCallHelper.AddOptionalInt(p, "@AccountId", accountId);
        SpCallHelper.AddOptionalDateTime(p, "@StartDate", start);
        SpCallHelper.AddOptionalDateTime(p, "@EndDate", end);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Params=@DesignId={DesignId}",
            DesignDashboardSp.Actions.GetMonthlySales, productId, designId, designId);

        var rows = await SpCallHelper.QueryAsync<DesignSalesPointRow>(
            connection, logger, DesignDashboardSp.Actions.GetMonthlySales, p,
            productId, productId, designId, ct).ConfigureAwait(false);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Rows={Rows}",
            DesignDashboardSp.Actions.GetMonthlySales, productId, designId, rows.Count);

        return MapSalesPoints(rows);
    }

    private async Task<IReadOnlyList<DesignSalesPointDto>> CallYearlySalesAsync(
        SqlConnection connection, int productId, int designId, int? accountId, DateTime? start, DateTime? end,
        CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetYearlySales);
        SpCallHelper.AddInt(p, "@DesignId", designId);
        SpCallHelper.AddOptionalInt(p, "@AccountId", accountId);
        SpCallHelper.AddOptionalDateTime(p, "@StartDate", start);
        SpCallHelper.AddOptionalDateTime(p, "@EndDate", end);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Params=@DesignId={DesignId}",
            DesignDashboardSp.Actions.GetYearlySales, productId, designId, designId);

        var rows = await SpCallHelper.QueryAsync<DesignSalesPointRow>(
            connection, logger, DesignDashboardSp.Actions.GetYearlySales, p,
            productId, productId, designId, ct).ConfigureAwait(false);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Rows={Rows}",
            DesignDashboardSp.Actions.GetYearlySales, productId, designId, rows.Count);

        return MapSalesPoints(rows);
    }

    private async Task<DateTime?> CallLastSoldAsync(
        SqlConnection connection, int productId, int designId, int? accountId, DateTime? start, DateTime? end,
        CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetLastSold);
        SpCallHelper.AddInt(p, "@DesignId", designId);
        SpCallHelper.AddOptionalInt(p, "@AccountId", accountId);
        SpCallHelper.AddOptionalDateTime(p, "@StartDate", start);
        SpCallHelper.AddOptionalDateTime(p, "@EndDate", end);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Params=@DesignId={DesignId}",
            DesignDashboardSp.Actions.GetLastSold, productId, designId, designId);

        var row = await SpCallHelper.QueryFirstOrDefaultAsync<LastSoldRow>(
            connection, logger, DesignDashboardSp.Actions.GetLastSold, p,
            productId, productId, designId, ct).ConfigureAwait(false);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Rows={Rows}",
            DesignDashboardSp.Actions.GetLastSold,
            productId,
            designId,
            row?.LastSoldDate is null ? 0 : 1);

        return row?.LastSoldDate;
    }

    private async Task<IReadOnlyList<DesignProductionDto>> CallProductionAsync(
        SqlConnection connection, int productId, int designId, CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetProduction);
        SpCallHelper.AddInt(p, "@ProductId", productId);
        SpCallHelper.AddInt(p, "@DesignId", designId);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Params=@ProductId={ProductId},@DesignId={DesignId}",
            DesignDashboardSp.Actions.GetProduction, productId, designId, productId, designId);

        var rows = await SpCallHelper.QueryAsync<DesignProductionRow>(
            connection, logger, DesignDashboardSp.Actions.GetProduction, p,
            productId, productId, designId, ct, commandTimeout: 180).ConfigureAwait(false);

        // Drop SP placeholder only; otherwise return every SP row. Never fabricate.
        var mapped = rows
            .Where(r => !IsProductionPlaceholder(r))
            .Select(r => new DesignProductionDto
            {
                ProductionDate = r.ProductionDate,
                Location = TrimOrEmpty(r.Location),
                ProducedQuantity = r.ProducedQuantity,
                RequiredQuantity = r.RequiredQuantity
            })
            .ToList();

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} SpRows={SpRows} MappedRows={MappedRows}",
            DesignDashboardSp.Actions.GetProduction, productId, designId, rows.Count, mapped.Count);

        return mapped;
    }

    private async Task<IReadOnlyList<DesignInventoryDto>> CallInventoryAsync(
        SqlConnection connection, int productId, int designId, CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetInventory);
        SpCallHelper.AddInt(p, "@DesignId", designId);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Params=@DesignId={DesignId}",
            DesignDashboardSp.Actions.GetInventory, productId, designId, designId);

        var row = await SpCallHelper.QueryFirstOrDefaultAsync<DesignInventoryRow>(
            connection, logger, DesignDashboardSp.Actions.GetInventory, p,
            productId, productId, designId, ct).ConfigureAwait(false);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} CurrentStock={Stock} Rows={Rows}",
            DesignDashboardSp.Actions.GetInventory,
            productId,
            designId,
            row?.CurrentStock,
            row is null ? 0 : 1);

        // Never fabricate inventory rows.
        return row is null
            ? Array.Empty<DesignInventoryDto>()
            : [new DesignInventoryDto { CurrentStock = row.CurrentStock }];
    }

    private async Task<AccountRow?> CallAccountDetailsAsync(
        SqlConnection connection, int productId, int designId, int accountId, CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetAccountDetails);
        SpCallHelper.AddInt(p, "@AccountId", accountId);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Params=@AccountId={AccountId}",
            DesignDashboardSp.Actions.GetAccountDetails, productId, designId, accountId);

        var row = await SpCallHelper.QueryFirstOrDefaultAsync<AccountRow>(
            connection, logger, DesignDashboardSp.Actions.GetAccountDetails, p,
            productId, productId, designId, ct).ConfigureAwait(false);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} DesignId={DesignId} Rows={Rows}",
            DesignDashboardSp.Actions.GetAccountDetails, productId, designId, row is null ? 0 : 1);

        return row;
    }

    private async Task<IReadOnlyList<AccountDetailDto>> CallOtherCustomersAsync(
        SqlConnection connection,
        int productId,
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken ct)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetOtherCustomers);
        SpCallHelper.AddInt(p, "@ProductId", productId);
        SpCallHelper.AddInt(p, "@AccountId", accountId);
        SpCallHelper.AddDateTime(p, "@StartDate", startDate);
        SpCallHelper.AddDateTime(p, "@EndDate", endDate);

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} Params=@ProductId={ProductId},@AccountId={AccountId},@StartDate,@EndDate",
            DesignDashboardSp.Actions.GetOtherCustomers, productId, productId, accountId);

        var rows = await SpCallHelper.QueryAsync<AccountRow>(
            connection, logger, DesignDashboardSp.Actions.GetOtherCustomers, p,
            productId, productId, null, ct).ConfigureAwait(false);

        var mapped = rows
            .Where(r => r.AccountId > 0)
            .Select(r => new AccountDetailDto
            {
                AccountId = r.AccountId,
                AccountName = TrimOrEmpty(r.AccountName),
                AccountCode = TrimOrNull(r.AccountCode),
                Address = TrimOrNull(r.Address),
                Email = TrimOrNull(r.Email),
                TelNo = TrimOrNull(r.TelNo),
                GstNo = TrimOrNull(r.GstNo)
            })
            .ToList();

        logger.LogInformation(
            "[SP] Action={Action} ProductId={ProductId} AccountId={AccountId} SpRows={SpRows} MappedRows={MappedRows}",
            DesignDashboardSp.Actions.GetOtherCustomers, productId, accountId, rows.Count, mapped.Count);

        return mapped;
    }

    private void WarnBadProductDetails(
        int productId, int designId, IReadOnlyList<ProductDetailDto> products)
    {
        if (products.Any(p => p.ProductId <= 0))
        {
            logger.LogWarning(
                "[Detail] ProductDetails contains ProductId=0 IncomingProductId={ProductId} ResolvedDesignId={DesignId}",
                productId, designId);
        }

        if (products.Any(p => string.Equals(p.ProductName?.Trim(), "-", StringComparison.Ordinal)))
        {
            logger.LogWarning(
                "[Detail] ProductDetails contains ProductName='-' IncomingProductId={ProductId} ResolvedDesignId={DesignId}",
                productId, designId);
        }
    }

    private static AccountDetailDto? MapAccount(AccountRow? account)
    {
        if (account is null)
        {
            return null;
        }

        return new AccountDetailDto
        {
            AccountId = account.AccountId,
            AccountName = TrimOrEmpty(account.AccountName),
            AccountCode = TrimOrNull(account.AccountCode),
            Address = TrimOrNull(account.Address),
            Email = TrimOrNull(account.Email),
            TelNo = TrimOrNull(account.TelNo),
            GstNo = TrimOrNull(account.GstNo)
        };
    }

    private static IReadOnlyList<DesignSalesPointDto> MapSalesPoints(IReadOnlyList<DesignSalesPointRow> rows) =>
        rows.Select(r => new DesignSalesPointDto
        {
            Label = TrimOrEmpty(r.Label),
            Quantity = r.Quantity,
            Value = r.Value
        }).ToList();

    private static bool IsProductionPlaceholder(DesignProductionRow r) =>
        (string.IsNullOrWhiteSpace(r.Location) || r.Location.Trim() is "-" or "—")
        && r.ProducedQuantity == 0
        && r.RequiredQuantity == 0;

    /// <summary>Header text: keep SP value; treat only sentinel "-" as absent (not a fabricated overwrite of valid data).</summary>
    private static string? HeaderText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var t = value.Trim();
        return t is "-" or "—" ? null : t;
    }

    private static string TrimOrEmpty(string? value) => value?.Trim() ?? string.Empty;

    private static string? TrimOrNull(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var t = value.Trim();
        return t is "-" or "—" ? null : t;
    }

    private async Task<T> OnNewConnectionAsync<T>(Func<SqlConnection, Task<T>> work, CancellationToken ct)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(ct).ConfigureAwait(false);
        return await work(connection).ConfigureAwait(false);
    }

    private static (int? AccountId, DateTime? Start, DateTime? End) FilterParams(DesignFilterRequest? filter)
    {
        if (filter is null)
        {
            return (null, null, null);
        }

        int? accountId = filter.CustomerAccountId > 0 ? filter.CustomerAccountId : null;
        DateTime? start = filter.StartDate == default ? null : DateHelper.StartOfDay(filter.StartDate);
        DateTime? end = filter.EndDate == default ? null : DateHelper.EndOfDay(filter.EndDate);
        return (accountId, start, end);
    }

    private sealed class LastSoldRow
    {
        public DateTime? LastSoldDate { get; set; }
    }
}
