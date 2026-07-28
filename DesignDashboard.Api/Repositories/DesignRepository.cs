using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Design list + detail — dbo.usp_DesignDashboard only.
/// Controllers / DTOs / Services / Angular unchanged.
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
        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var design = await QueryDesignHeaderAsync(connection, designId, cancellationToken)
                .ConfigureAwait(false);
            if (design is null)
            {
                return null;
            }

            var (accountId, startDate, endDate) = BuildDesignFilterParams(filter);

            var resolvedAccountId = filter?.CustomerAccountId > 0
                ? filter.CustomerAccountId
                : design.AccountId;

            // Parallel detail queries on separate connections — faster popup open.
            var salesTask = QueryOnNewConnectionAsync(
                connectionFactory,
                c => QueryCustomerSalesByDesignIdAsync(c, designId, accountId, startDate, endDate, cancellationToken),
                cancellationToken);
            var productsTask = QueryOnNewConnectionAsync(
                connectionFactory,
                c => QueryProductsAsync(c, designId, cancellationToken),
                cancellationToken);
            var ordersTask = QueryOnNewConnectionAsync(
                connectionFactory,
                c => QueryOrdersAsync(c, designId, accountId, startDate, endDate, cancellationToken),
                cancellationToken);
            var monthlyTask = QueryOnNewConnectionAsync(
                connectionFactory,
                c => QueryMonthlySalesAsync(c, designId, accountId, startDate, endDate, cancellationToken),
                cancellationToken);
            var yearlyTask = QueryOnNewConnectionAsync(
                connectionFactory,
                c => QueryYearlySalesAsync(c, designId, accountId, startDate, endDate, cancellationToken),
                cancellationToken);
            var lastSoldTask = QueryOnNewConnectionAsync(
                connectionFactory,
                c => QueryLastSoldDateAsync(c, designId, accountId, startDate, endDate, cancellationToken),
                cancellationToken);
            var accountTask = resolvedAccountId is > 0
                ? QueryOnNewConnectionAsync(
                    connectionFactory,
                    c => QueryAccountDetailsAsync(c, resolvedAccountId.Value, cancellationToken),
                    cancellationToken)
                : Task.FromResult<AccountRow?>(null);

            await Task.WhenAll(
                    salesTask,
                    productsTask,
                    ordersTask,
                    monthlyTask,
                    yearlyTask,
                    lastSoldTask,
                    accountTask)
                .ConfigureAwait(false);

            var sales = await salesTask.ConfigureAwait(false);
            IReadOnlyList<ProductDetailDto> products = await productsTask.ConfigureAwait(false);
            var orders = await ordersTask.ConfigureAwait(false);
            var monthly = await monthlyTask.ConfigureAwait(false);
            var yearly = await yearlyTask.ConfigureAwait(false);
            var lastSold = await lastSoldTask.ConfigureAwait(false);
            var account = await accountTask.ConfigureAwait(false);

            // Production is loaded on-demand via GET /api/designs/{id}/production (faster popup open).
            // General Information stock: CurrentQuantity from GetDesignHeader.
            IReadOnlyList<DesignInventoryDto> inventory =
            [
                new DesignInventoryDto { CurrentStock = design.CurrentQuantity }
            ];

            products = AlignProductDetailsWithHeader(products, design);

            return new DesignDetailDto
            {
                DesignId = design.DesignId,
                DesignCode = design.DesignCode?.Trim() ?? string.Empty,
                DesignName = design.DesignName?.Trim() ?? string.Empty,
                CustomerName = string.IsNullOrWhiteSpace(account?.AccountName) ? "-" : account!.AccountName.Trim(),
                ImageThumbnail = ImageHelper.ToBase64DataUrl(design.ImgThumbData),
                CategoryName = string.IsNullOrWhiteSpace(design.ProductCategory)
                    ? "-"
                    : design.ProductCategory.Trim(),
                SalesQty = sales?.TotalSalesQty ?? 0,
                SalesValue = sales?.TotalSalesAmount ?? 0,
                PendingOrders = sales?.PendingOrder ?? 0,
                PendingProcess = sales?.PendingProcess ?? 0,
                LastSoldDate = lastSold,
                AverageSellingPrice = 0,
                ProductDetails = products,
                AccountDetails = account is null
                    ? null
                    : new AccountDetailDto
                    {
                        AccountId = account.AccountId,
                        AccountName = string.IsNullOrWhiteSpace(account.AccountName) ? "-" : account.AccountName,
                        AccountCode = string.IsNullOrWhiteSpace(account.AccountCode) ? "-" : account.AccountCode,
                        Address = string.IsNullOrWhiteSpace(account.Address) ? "-" : account.Address,
                        Email = string.IsNullOrWhiteSpace(account.Email) ? "-" : account.Email,
                        TelNo = string.IsNullOrWhiteSpace(account.TelNo) ? "-" : account.TelNo,
                        GstNo = string.IsNullOrWhiteSpace(account.GstNo) ? "-" : account.GstNo
                    },
                Orders = orders,
                MonthlySales = monthly,
                YearlySales = yearly,
                Production = [],
                Inventory = inventory
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetDesignByIdAsync failed for DesignId={DesignId}", designId);
            throw;
        }
    }

    public async Task<IReadOnlyList<DesignProductionDto>> GetProductionByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var rows = await QueryProductionAsync(connection, designId, cancellationToken)
                .ConfigureAwait(false);

            logger.LogInformation(
                "GetProduction returned {Count} rows for DesignId={DesignId}",
                rows.Count,
                designId);

            // Never return an empty list — UI always has a renderable row.
            if (rows.Count == 0)
            {
                return
                [
                    new DesignProductionDto
                    {
                        ProductionDate = null,
                        Location = "-",
                        ProducedQuantity = 0,
                        RequiredQuantity = 0
                    }
                ];
            }

            return rows;
        }
        catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
        {
            // Do not throw — return a safe default row so the Production grid always renders.
            logger.LogError(ex, "Production query failed for DesignId={DesignId}", designId);
            return
            [
                new DesignProductionDto
                {
                    ProductionDate = null,
                    Location = "-",
                    ProducedQuantity = 0,
                    RequiredQuantity = 0
                }
            ];
        }
    }

    public async Task<DesignInventoryDto> GetInventoryByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            return await QueryInventoryAsync(connection, designId, cancellationToken).ConfigureAwait(false);
        }
        catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
        {
            logger.LogWarning(ex, "Inventory query failed for DesignId={DesignId}; returning empty defaults", designId);
            return DesignInventoryDto.Empty;
        }
    }

    // -------------------------------------------------------------------------
    // Detail helpers
    // -------------------------------------------------------------------------

    private static async Task<T> QueryOnNewConnectionAsync<T>(
        ISqlConnectionFactory connectionFactory,
        Func<SqlConnection, Task<T>> work,
        CancellationToken cancellationToken)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        return await work(connection).ConfigureAwait(false);
    }

    private static async Task<DesignHeaderRow?> QueryDesignHeaderAsync(
        SqlConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetDesignHeader);
        DesignDashboardSp.AddOptionalInt(command, "@DesignId", designId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            return null;
        }

        var thumbOrd = reader.GetOrdinal("ImgThumbData");
        return new DesignHeaderRow
        {
            DesignId = reader.GetInt32(reader.GetOrdinal("DesignId")),
            DesignCode = GetStringOrNull(reader, "DesignCode"),
            DesignName = GetStringOrNull(reader, "DesignName"),
            ImgThumbData = reader.IsDBNull(thumbOrd) ? null : (byte[])reader[thumbOrd],
            AccountId = GetNullableInt(reader, "AccountId"),
            ProductName = GetStringOrNull(reader, "ProductName"),
            ProductCategory = GetStringOrNull(reader, "ProductCategory"),
            Material = GetStringOrNull(reader, "Material"),
            NetWeight = GetNullableDecimal(reader, "NetWeight"),
            Status = GetStringOrNull(reader, "Status"),
            CurrentQuantity = GetDecimal(reader, "CurrentQuantity")
        };
    }

    private static async Task<CustomerSalesResult?> QueryCustomerSalesByDesignIdAsync(
        SqlConnection connection,
        int designId,
        int? accountId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken)
    {
        await using var command = CreateFilteredDesignCommand(
            DesignDashboardSp.Actions.GetDesignSales, connection, designId, accountId, startDate, endDate);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            return null;
        }

        return new CustomerSalesResult
        {
            DesignId = reader.GetInt32(reader.GetOrdinal("DesignId")),
            DesignCode = GetString(reader, "DesignCode"),
            DesignName = GetString(reader, "DesignName"),
            TotalSalesQty = GetDecimal(reader, "TotalSalesQty"),
            TotalSalesAmount = GetDecimal(reader, "TotalSalesAmount"),
            PendingOrder = GetDecimal(reader, "PendingOrder"),
            PendingProcess = GetDecimal(reader, "PendingProcess")
        };
    }

    private static async Task<IReadOnlyList<ProductDetailDto>> QueryProductsAsync(
        SqlConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetProductsByDesign);
        DesignDashboardSp.AddOptionalInt(command, "@DesignId", designId);

        var list = new List<ProductDetailDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            list.Add(new ProductDetailDto
            {
                ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
                ProductName = GetString(reader, "ProductName"),
                BarCode = GetStringOrNull(reader, "BarCode"),
                NetWt = GetNullableDecimal(reader, "NetWt"),
                Composition = GetStringOrNull(reader, "Composition"),
                Active = GetByte(reader, "Active") == 1
            });
        }

        return list;
    }

    /// <summary>
    /// Align ProductDetails with GetDesignHeader general-info fields (ProductName, Material, NetWeight, Status).
    /// </summary>
    private static IReadOnlyList<ProductDetailDto> AlignProductDetailsWithHeader(
        IReadOnlyList<ProductDetailDto> products,
        DesignHeaderRow design)
    {
        var headerActive = string.Equals(design.Status, "Approved", StringComparison.OrdinalIgnoreCase);

        if (products.Count == 0)
        {
            if (string.IsNullOrWhiteSpace(design.ProductName)
                && string.IsNullOrWhiteSpace(design.Material)
                && design.NetWeight is null)
            {
                return products;
            }

            return
            [
                new ProductDetailDto
                {
                    ProductId = 0,
                    ProductName = design.ProductName?.Trim() ?? string.Empty,
                    BarCode = null,
                    NetWt = design.NetWeight,
                    Composition = design.Material,
                    Active = headerActive
                }
            ];
        }

        var first = products[0];
        return
        [
            new ProductDetailDto
            {
                ProductId = first.ProductId,
                ProductName = string.IsNullOrWhiteSpace(design.ProductName)
                    ? first.ProductName
                    : design.ProductName.Trim(),
                BarCode = null,
                NetWt = design.NetWeight ?? first.NetWt,
                Composition = string.IsNullOrWhiteSpace(design.Material)
                    ? first.Composition
                    : design.Material,
                Active = string.IsNullOrWhiteSpace(design.Status) ? first.Active : headerActive
            },
            .. products.Skip(1)
        ];
    }

    private static async Task<IReadOnlyList<DesignOrderDto>> QueryOrdersAsync(
        SqlConnection connection,
        int designId,
        int? accountId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken)
    {
        await using var command = CreateFilteredDesignCommand(
            DesignDashboardSp.Actions.GetOrdersByDesign, connection, designId, accountId, startDate, endDate);

        var list = new List<DesignOrderDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            list.Add(new DesignOrderDto
            {
                OrderNo = GetString(reader, "OrderNo"),
                Customer = GetString(reader, "Customer"),
                OrderDate = GetNullableDateTime(reader, "OrderDate"),
                DeliveryDate = null,
                Quantity = GetDecimal(reader, "Quantity"),
                PendingQuantity = 0,
                Amount = GetDecimal(reader, "Amount"),
                Status = "Billed",
                ProcessingStage = "Completed"
            });
        }

        return list;
    }

    private static async Task<IReadOnlyList<DesignSalesPointDto>> QueryMonthlySalesAsync(
        SqlConnection connection,
        int designId,
        int? accountId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken)
    {
        await using var command = CreateFilteredDesignCommand(
            DesignDashboardSp.Actions.GetMonthlySales, connection, designId, accountId, startDate, endDate);

        return await ReadSalesPointsAsync(command, cancellationToken).ConfigureAwait(false);
    }

    private static async Task<IReadOnlyList<DesignSalesPointDto>> QueryYearlySalesAsync(
        SqlConnection connection,
        int designId,
        int? accountId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken)
    {
        await using var command = CreateFilteredDesignCommand(
            DesignDashboardSp.Actions.GetYearlySales, connection, designId, accountId, startDate, endDate);

        return await ReadSalesPointsAsync(command, cancellationToken).ConfigureAwait(false);
    }

    private static async Task<IReadOnlyList<DesignSalesPointDto>> ReadSalesPointsAsync(
        SqlCommand command,
        CancellationToken cancellationToken)
    {
        var list = new List<DesignSalesPointDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            list.Add(new DesignSalesPointDto
            {
                Label = GetString(reader, "Label"),
                Quantity = GetDecimal(reader, "Quantity"),
                Value = GetDecimal(reader, "Value")
            });
        }

        return list;
    }

    private static async Task<DateTime?> QueryLastSoldDateAsync(
        SqlConnection connection,
        int designId,
        int? accountId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken)
    {
        await using var command = CreateFilteredDesignCommand(
            DesignDashboardSp.Actions.GetLastSold, connection, designId, accountId, startDate, endDate);

        var result = await command.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
        if (result is null or DBNull)
        {
            return null;
        }

        return Convert.ToDateTime(result);
    }

    private static async Task<IReadOnlyList<DesignProductionDto>> QueryProductionAsync(
        SqlConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetProduction, commandTimeout: 180);
        DesignDashboardSp.AddOptionalInt(command, "@DesignId", designId);
        DesignDashboardSp.AddOptionalInt(command, "@AccountId", null);
        DesignDashboardSp.AddOptionalDateTime(command, "@StartDate", null);
        DesignDashboardSp.AddOptionalDateTime(command, "@EndDate", null);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        var rows = new List<DesignProductionDto>();

        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            rows.Add(new DesignProductionDto
            {
                ProductionDate = GetNullableDateTime(reader, "ProductionDate"),
                Location = string.IsNullOrWhiteSpace(GetString(reader, "Location"))
                    ? "-"
                    : GetString(reader, "Location"),
                ProducedQuantity = GetDecimal(reader, "ProducedQuantity"),
                RequiredQuantity = GetDecimal(reader, "RequiredQuantity")
            });
        }

        return rows;
    }

    private static async Task<DesignInventoryDto> QueryInventoryAsync(
        SqlConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetInventory);
        DesignDashboardSp.AddOptionalInt(command, "@DesignId", designId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            return DesignInventoryDto.Empty;
        }

        return new DesignInventoryDto
        {
            CurrentStock = GetDecimal(reader, "CurrentStock")
        };
    }

    private static async Task<AccountRow?> QueryAccountDetailsAsync(
        SqlConnection connection,
        int accountId,
        CancellationToken cancellationToken)
    {
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetAccountDetails);
        DesignDashboardSp.AddOptionalInt(command, "@AccountId", accountId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            return null;
        }

        return new AccountRow
        {
            AccountId = reader.GetInt32(reader.GetOrdinal("AccountId")),
            AccountName = GetString(reader, "AccountName"),
            AccountCode = GetStringOrNull(reader, "AccountCode"),
            Address = GetStringOrNull(reader, "Address"),
            Email = GetStringOrNull(reader, "Email"),
            TelNo = GetStringOrNull(reader, "TelNo"),
            GstNo = GetStringOrNull(reader, "GstNo")
        };
    }

    // -------------------------------------------------------------------------
    // Shared parameter / reader helpers
    // -------------------------------------------------------------------------

    private static (int? AccountId, DateTime? StartDate, DateTime? EndDate) BuildDesignFilterParams(
        DesignFilterRequest? filter)
    {
        if (filter is { CustomerAccountId: > 0 })
        {
            return (
                filter.CustomerAccountId,
                DateHelper.StartOfDay(filter.StartDate),
                DateHelper.EndOfDay(filter.EndDate));
        }

        return (null, null, null);
    }

    private static SqlCommand CreateFilteredDesignCommand(
        string action,
        SqlConnection connection,
        int designId,
        int? accountId,
        DateTime? startDate,
        DateTime? endDate)
    {
        var command = DesignDashboardSp.Create(connection, action);
        DesignDashboardSp.AddOptionalInt(command, "@DesignId", designId);
        DesignDashboardSp.AddOptionalInt(command, "@AccountId", accountId);
        DesignDashboardSp.AddOptionalDateTime(command, "@StartDate", startDate);
        DesignDashboardSp.AddOptionalDateTime(command, "@EndDate", endDate);
        return command;
    }

    private static string GetString(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        if (reader.IsDBNull(ord))
        {
            return string.Empty;
        }

        return Convert.ToString(reader.GetValue(ord))?.Trim() ?? string.Empty;
    }

    private static string? GetStringOrNull(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        if (reader.IsDBNull(ord))
        {
            return null;
        }

        var text = Convert.ToString(reader.GetValue(ord))?.Trim();
        return string.IsNullOrEmpty(text) ? null : text;
    }

    private static decimal GetDecimal(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        if (reader.IsDBNull(ord))
        {
            return 0m;
        }

        return Convert.ToDecimal(reader.GetValue(ord));
    }

    private static decimal? GetNullableDecimal(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        if (reader.IsDBNull(ord))
        {
            return null;
        }

        return Convert.ToDecimal(reader.GetValue(ord));
    }

    private static int? GetNullableInt(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        if (reader.IsDBNull(ord))
        {
            return null;
        }

        return Convert.ToInt32(reader.GetValue(ord));
    }

    private static DateTime? GetNullableDateTime(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        if (reader.IsDBNull(ord))
        {
            return null;
        }

        return Convert.ToDateTime(reader.GetValue(ord));
    }

    private static byte GetByte(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        if (reader.IsDBNull(ord))
        {
            return 0;
        }

        var value = reader.GetValue(ord);
        return value switch
        {
            byte b => b,
            bool flag => flag ? (byte)1 : (byte)0,
            _ => Convert.ToByte(value)
        };
    }
}
