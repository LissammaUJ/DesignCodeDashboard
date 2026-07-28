using System.Data;
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
    public async Task<IReadOnlyList<DesignListItemDto>> GetDesignsAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var sales = await ExecuteCustomerSalesAsync(filter, cancellationToken).ConfigureAwait(false);
            if (sales.Count == 0)
            {
                logger.LogInformation(
                    "Design sales SP returned 0 rows for AccountId={AccountId} Start={Start} End={End}",
                    filter.CustomerAccountId, filter.StartDate, filter.EndDate);
                return [];
            }

            var designIds = sales.Select(s => s.DesignId).Distinct().ToArray();

            string? customerName = null;
            try
            {
                customerName = await GetAccountNameAsync(filter.CustomerAccountId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
            {
                logger.LogWarning(ex, "Design account enrichment failed; returning sales rows without customer name");
            }

            var productNames = await GetProductNamesAsync(designIds, cancellationToken).ConfigureAwait(false);
            var thumbs = await DesignThumbnailLoader.LoadDataUrlsAsync(
                connectionFactory, designIds, logger, cancellationToken).ConfigureAwait(false);

            logger.LogInformation(
                "Design sales SP returned {Count} rows for AccountId={AccountId} ({WithImages} thumbnails)",
                sales.Count, filter.CustomerAccountId, thumbs.Count);

            return [.. sales.Select(s => new DesignListItemDto
            {
                DesignId = s.DesignId,
                DesignCode = s.DesignCode?.Trim() ?? string.Empty,
                DesignName = s.DesignName?.Trim() ?? string.Empty,
                ProductName = productNames.GetValueOrDefault(s.DesignId, string.Empty),
                CustomerName = customerName ?? string.Empty,
                ImageThumbnail = thumbs.GetValueOrDefault(s.DesignId),
                SalesQty = s.TotalSalesQty,
                SalesValue = s.TotalSalesAmount,
                PendingOrders = s.PendingOrder,
                PendingProcess = s.PendingProcess
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
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var design = await QueryDesignHeaderAsync(connection, designId, cancellationToken)
                .ConfigureAwait(false);
            if (design is null)
            {
                return null;
            }

            var (accountId, startDate, endDate) = BuildDesignFilterParams(designId, filter);

            var sales = await QueryCustomerSalesByDesignIdAsync(
                connection, designId, accountId, startDate, endDate, cancellationToken).ConfigureAwait(false);
            var products = await QueryProductsAsync(connection, designId, cancellationToken).ConfigureAwait(false);
            var orders = await QueryOrdersAsync(
                connection, designId, accountId, startDate, endDate, cancellationToken).ConfigureAwait(false);
            var monthly = await QueryMonthlySalesAsync(
                connection, designId, accountId, startDate, endDate, cancellationToken).ConfigureAwait(false);
            var yearly = await QueryYearlySalesAsync(
                connection, designId, accountId, startDate, endDate, cancellationToken).ConfigureAwait(false);
            var lastSold = await QueryLastSoldDateAsync(
                connection, designId, accountId, startDate, endDate, cancellationToken).ConfigureAwait(false);

            IReadOnlyList<DesignProductionDto> production = [];
            IReadOnlyList<DesignInventoryDto> inventory = [];
            try
            {
                production = await QueryProductionAsync(connection, designId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
            {
                logger.LogWarning(ex, "Embedded production query failed for DesignId={DesignId}", designId);
            }

            try
            {
                var inv = await QueryInventoryAsync(connection, designId, cancellationToken)
                    .ConfigureAwait(false);
                inventory = [inv];
            }
            catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
            {
                logger.LogWarning(ex, "Embedded inventory query failed for DesignId={DesignId}", designId);
            }

            var resolvedAccountId = filter?.CustomerAccountId > 0
                ? filter.CustomerAccountId
                : design.AccountId;

            AccountRow? account = null;
            if (resolvedAccountId is > 0)
            {
                account = await QueryAccountDetailsAsync(connection, resolvedAccountId.Value, cancellationToken)
                    .ConfigureAwait(false);
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
                Inventory = inventory
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetDesignByIdAsync failed for DesignId={DesignId}", designId);
            throw;
        }
    }

    public async Task<DesignProductionDto> GetProductionByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var fromProdSlip = await QueryProductionSummaryAsync(connection, designId, cancellationToken)
                .ConfigureAwait(false);
            if (fromProdSlip.ProductionQuantity != 0
                || fromProdSlip.CompletedQuantity != 0
                || fromProdSlip.PendingQuantity != 0
                || fromProdSlip.RejectedQuantity != 0
                || fromProdSlip.ProductionDate.HasValue)
            {
                return fromProdSlip;
            }

            // Fallback: ItemDesign → Product → Bo_trn → Bo_mas (booking quantities / dates).
            return await QueryProductionFromBoAsync(connection, designId, cancellationToken)
                .ConfigureAwait(false);
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
    // List helpers
    // -------------------------------------------------------------------------

    private async Task<IReadOnlyList<CustomerSalesResult>> ExecuteCustomerSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var accountId = filter.CustomerAccountId;
        var startDate = DateHelper.StartOfDay(filter.StartDate);
        var endDate = DateHelper.EndOfDay(filter.EndDate);

        logger.LogInformation(
            "Design sales SP AccountId={AccountId} Start={StartDate} End={EndDate}",
            accountId, startDate, endDate);

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetDesignList);
        DesignDashboardSp.AddOptionalInt(command, "@AccountId", accountId);
        DesignDashboardSp.AddOptionalDateTime(command, "@StartDate", startDate);
        DesignDashboardSp.AddOptionalDateTime(command, "@EndDate", endDate);

        var list = new List<CustomerSalesResult>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            list.Add(new CustomerSalesResult
            {
                DesignId = reader.GetInt32(reader.GetOrdinal("DesignId")),
                DesignCode = GetString(reader, "DesignCode"),
                DesignName = GetString(reader, "DesignName"),
                TotalSalesQty = GetDecimal(reader, "TotalSalesQty"),
                TotalSalesAmount = GetDecimal(reader, "TotalSalesAmount"),
                PendingOrder = GetDecimal(reader, "PendingOrder"),
                PendingProcess = GetDecimal(reader, "PendingProcess")
            });
        }

        return list;
    }

    private async Task<string?> GetAccountNameAsync(int accountId, CancellationToken cancellationToken)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetAccountName);
        DesignDashboardSp.AddOptionalInt(command, "@AccountId", accountId);

        var result = await command.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
        return result is string name ? name : result?.ToString();
    }

    private async Task<Dictionary<int, string>> GetProductNamesAsync(
        int[] designIds,
        CancellationToken cancellationToken)
    {
        if (designIds.Length == 0)
        {
            return new Dictionary<int, string>();
        }

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetProductNames, commandTimeout: 60);
        AdoNetHelper.AddIntIdListParameter(command, "@DesignIds", designIds);

        var lookup = new Dictionary<int, string>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            lookup[reader.GetInt32(reader.GetOrdinal("DesignId"))] =
                GetString(reader, "ProductName");
        }

        return lookup;
    }

    // -------------------------------------------------------------------------
    // Detail helpers
    // -------------------------------------------------------------------------

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
            CustomerName = GetStringOrNull(reader, "CustomerName"),
            CategoryName = GetStringOrNull(reader, "CategoryName")
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
        var summary = await QueryProductionSummaryAsync(connection, designId, cancellationToken)
            .ConfigureAwait(false);
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
        SqlConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetProduction);
        DesignDashboardSp.AddOptionalInt(command, "@DesignId", designId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            return DesignProductionDto.Empty;
        }

        // SUM over empty set returns one row of NULLs — treat as empty.
        if (reader.IsDBNull(reader.GetOrdinal("ProductionQuantity"))
            && reader.IsDBNull(reader.GetOrdinal("ProductionDate")))
        {
            return DesignProductionDto.Empty;
        }

        return new DesignProductionDto
        {
            ProductionQuantity = GetDecimal(reader, "ProductionQuantity"),
            CompletedQuantity = GetDecimal(reader, "CompletedQuantity"),
            PendingQuantity = GetDecimal(reader, "PendingQuantity"),
            RejectedQuantity = GetDecimal(reader, "RejectedQuantity"),
            ProductionDate = GetNullableDateTime(reader, "ProductionDate"),
            Department = GetString(reader, "Department"),
            Supervisor = GetString(reader, "Supervisor")
        };
    }

    private static async Task<DesignProductionDto> QueryProductionFromBoAsync(
        SqlConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        try
        {
            await using var command = DesignDashboardSp.Create(
                connection, DesignDashboardSp.Actions.GetProductionFromBo);
            DesignDashboardSp.AddOptionalInt(command, "@DesignId", designId);

            await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
            if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
            {
                return DesignProductionDto.Empty;
            }

            var qty = GetDecimal(reader, "ProductionQuantity");
            var date = GetNullableDateTime(reader, "ProductionDate");
            if (qty == 0 && date is null)
            {
                return DesignProductionDto.Empty;
            }

            return new DesignProductionDto
            {
                ProductionQuantity = qty,
                CompletedQuantity = 0,
                PendingQuantity = 0,
                RejectedQuantity = 0,
                ProductionDate = date,
                Department = string.Empty,
                Supervisor = string.Empty
            };
        }
        catch
        {
            return DesignProductionDto.Empty;
        }
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
        int designId,
        DesignFilterRequest? filter)
    {
        _ = designId;
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
        return reader.IsDBNull(ord) ? string.Empty : reader.GetString(ord).Trim();
    }

    private static string? GetStringOrNull(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        return reader.IsDBNull(ord) ? null : reader.GetString(ord);
    }

    private static decimal GetDecimal(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        return reader.IsDBNull(ord) ? 0m : reader.GetDecimal(ord);
    }

    private static decimal? GetNullableDecimal(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        return reader.IsDBNull(ord) ? null : reader.GetDecimal(ord);
    }

    private static int? GetNullableInt(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        return reader.IsDBNull(ord) ? null : reader.GetInt32(ord);
    }

    private static DateTime? GetNullableDateTime(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        return reader.IsDBNull(ord) ? null : reader.GetDateTime(ord);
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
