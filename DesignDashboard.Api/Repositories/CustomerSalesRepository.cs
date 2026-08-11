using System.Diagnostics;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Dashboard cards — dbo.Usp_DesignDashboard_New (@Action = GetCustomerSales).
/// SP adapter: private result row → stable <see cref="CustomerSalesDto"/>.
/// Grain: ONE ROW PER PRODUCT (never regroup by DesignId).
/// Product universe matches GetSummary TotalProducts (orders by AccountId/BoDate/CoId);
/// sales may be zero. ProductId from SP when present; else GetProductsByDesign (DesignId + ProductName).
/// </summary>
public sealed class CustomerSalesRepository(
    ISqlConnectionFactory connectionFactory,
    IHttpContextAccessor httpContextAccessor,
    ILogger<CustomerSalesRepository> logger) : ICustomerSalesRepository
{
    /// <summary>Private SP-shaped row. Extra columns ignored; ProductId may be 0/absent.</summary>
    private sealed class CustomerSalesRow
    {
        public int DesignId { get; set; }
        public int ProductId { get; set; }
        public string DesignCode { get; set; } = string.Empty;
        public string DesignName { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public decimal? TotalSalesQty { get; set; }
        public decimal? TotalSalesAmount { get; set; }
        public decimal? PendingOrder { get; set; }
        public decimal? PendingProcess { get; set; }
        public byte[]? ImgThumbData { get; set; }
    }

    public async Task<IReadOnlyList<CustomerSalesDto>> GetCustomerSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var accountId = filter.CustomerAccountId;
        var startDate = DateHelper.StartOfDay(filter.StartDate);
        var endDate = DateHelper.EndOfDay(filter.EndDate);
        var coId = CompanyContext.GetRequiredCoId(httpContextAccessor);
        var sw = Stopwatch.StartNew();

        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var salesParams = SpCallHelper.Params(DesignDashboardSp.Actions.GetCustomerSales);
            SpCallHelper.AddInt(salesParams, "@AccountId", accountId);
            SpCallHelper.AddDateTime(salesParams, "@StartDate", startDate);
            SpCallHelper.AddDateTime(salesParams, "@EndDate", endDate);
            SpCallHelper.AddInt(salesParams, "@CoId", coId);

            logger.LogInformation(
                "[SP] Action={Action} Params=@AccountId={AccountId},@CoId={CoId},@StartDate,@EndDate",
                DesignDashboardSp.Actions.GetCustomerSales, accountId, coId);

            var salesRows = (await SpCallHelper.QueryAsync<CustomerSalesRow>(
                    connection,
                    logger,
                    DesignDashboardSp.Actions.GetCustomerSales,
                    salesParams,
                    incomingId: null,
                    productId: null,
                    designId: null,
                    cancellationToken)
                .ConfigureAwait(false)).ToList();

            logger.LogInformation(
                "[SP] Action={Action} Rows={Rows}",
                DesignDashboardSp.Actions.GetCustomerSales, salesRows.Count);

            if (salesRows.Any(r => r.ProductId <= 0))
            {
                await ApplyProductIdsFromProductsByDesignAsync(
                        connection, salesRows, cancellationToken)
                    .ConfigureAwait(false);
            }

            // One card per ProductId (SP should already be unique; guard against fan-out).
            var result = salesRows
                .Where(r => r.ProductId > 0)
                .GroupBy(r => r.ProductId)
                .Select(g => MapToDto(g.First()))
                .ToList();

            var dropped = salesRows.Count - result.Count;
            if (dropped > 0)
            {
                logger.LogWarning(
                    "[CustomerSales] Dropped {Dropped} rows (unresolved ProductId or duplicate ProductId)",
                    dropped);
            }

            sw.Stop();
            logger.LogInformation(
                "[CustomerSales] complete Rows={Rows} ElapsedMs={ElapsedMs} Sample={Sample}",
                result.Count,
                sw.ElapsedMilliseconds,
                string.Join(",", result.Take(5).Select(r => $"D{r.DesignId}:P{r.ProductId}")));

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            logger.LogError(ex, "[CustomerSales] failed AccountId={AccountId}", accountId);
            throw;
        }
    }

    /// <summary>SP row → stable public card DTO (renames / NULL / image conversion stay here).</summary>
    private static CustomerSalesDto MapToDto(CustomerSalesRow r) =>
        new()
        {
            DesignId = r.DesignId,
            DesignCode = r.DesignCode?.Trim() ?? string.Empty,
            DesignName = r.DesignName?.Trim() ?? string.Empty,
            ProductId = r.ProductId,
            ProductName = SpValueHelper.CleanTextOrEmpty(r.ProductName),
            TotalSalesQty = SpValueHelper.NonNegative(r.TotalSalesQty),
            TotalSalesAmount = SpValueHelper.NonNegative(r.TotalSalesAmount),
            PendingOrder = SpValueHelper.NonNegative(r.PendingOrder),
            PendingProcess = SpValueHelper.NonNegative(r.PendingProcess),
            ImageThumbnail = r.ImgThumbData is { Length: > 0 }
                ? ImageHelper.ToBase64DataUrl(r.ImgThumbData)
                : null
        };

    /// <summary>
    /// GetCustomerSales SELECT omits ProductId. Resolve via existing GetProductsByDesign:
    /// DesignId + ProductName → ProductId. Never GetSummary.
    /// </summary>
    private async Task ApplyProductIdsFromProductsByDesignAsync(
        SqlConnection connection,
        List<CustomerSalesRow> rows,
        CancellationToken cancellationToken)
    {
        var cache = new Dictionary<int, IReadOnlyList<ProductRow>>();

        foreach (var row in rows.Where(r => r.ProductId <= 0 && r.DesignId > 0))
        {
            if (!cache.TryGetValue(row.DesignId, out var products))
            {
                products = await LoadProductsByDesignAsync(connection, row.DesignId, cancellationToken)
                    .ConfigureAwait(false);
                cache[row.DesignId] = products;
            }

            var salesName = NormalizeProductName(row.ProductName);
            var match = products.FirstOrDefault(p =>
                p.ProductId > 0
                && string.Equals(
                    NormalizeProductName(p.ProductName),
                    salesName,
                    StringComparison.OrdinalIgnoreCase));

            if (match is not null)
            {
                row.ProductId = match.ProductId;
            }
            else
            {
                logger.LogWarning(
                    "[CustomerSales] ProductId unresolved DesignId={DesignId} ProductName={ProductName}",
                    row.DesignId,
                    row.ProductName);
            }
        }
    }

    private async Task<IReadOnlyList<ProductRow>> LoadProductsByDesignAsync(
        SqlConnection connection,
        int designId,
        CancellationToken cancellationToken)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetProductsByDesign);
        SpCallHelper.AddInt(p, "@DesignId", designId);

        logger.LogInformation(
            "[SP] Action={Action} DesignId={DesignId} Params=@DesignId={DesignId} (ProductId resolve)",
            DesignDashboardSp.Actions.GetProductsByDesign, designId, designId);

        var rows = await SpCallHelper.QueryAsync<ProductRow>(
                connection,
                logger,
                DesignDashboardSp.Actions.GetProductsByDesign,
                p,
                incomingId: null,
                productId: null,
                designId: designId,
                cancellationToken)
            .ConfigureAwait(false);

        return rows.Where(r => r.ProductId > 0).ToList();
    }

    private static string NormalizeProductName(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var t = value.Trim();
        return t is "-" or "—" ? string.Empty : t;
    }
}
