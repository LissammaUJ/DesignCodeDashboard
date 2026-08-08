using System.Diagnostics;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Dashboard cards — one row per GetCustomerSales product row.
/// ProductId: SP SELECT omits ProductId; filled from GetSummary (same grain) when missing.
/// Image: GetCustomerSales.ImgThumbData only (never another design).
/// </summary>
public sealed class CustomerSalesRepository(
    ISqlConnectionFactory connectionFactory,
    ILogger<CustomerSalesRepository> logger) : ICustomerSalesRepository
{
    private sealed class CustomerSalesRow
    {
        public int DesignId { get; set; }
        public int ProductId { get; set; }
        public string DesignCode { get; set; } = string.Empty;
        public string DesignName { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public decimal TotalSalesQty { get; set; }
        public decimal TotalSalesAmount { get; set; }
        public decimal PendingOrder { get; set; }
        public decimal PendingProcess { get; set; }
        public byte[]? ImgThumbData { get; set; }
    }

    private sealed class SummaryProductRow
    {
        public int DesignId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal TotalSalesQty { get; set; }
        public decimal TotalSalesAmount { get; set; }
    }

    public async Task<IReadOnlyList<CustomerSalesDto>> GetCustomerSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var accountId = filter.CustomerAccountId;
        var startDate = DateHelper.StartOfDay(filter.StartDate);
        var endDate = DateHelper.EndOfDay(filter.EndDate);
        var sw = Stopwatch.StartNew();

        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var salesParams = SpCallHelper.Params(DesignDashboardSp.Actions.GetCustomerSales);
            SpCallHelper.AddInt(salesParams, "@AccountId", accountId);
            SpCallHelper.AddDateTime(salesParams, "@StartDate", startDate);
            SpCallHelper.AddDateTime(salesParams, "@EndDate", endDate);

            logger.LogInformation(
                "[SP] Action={Action} Params=@AccountId={AccountId},@StartDate,@EndDate",
                DesignDashboardSp.Actions.GetCustomerSales, accountId);

            var salesRows = await SpCallHelper.QueryAsync<CustomerSalesRow>(
                    connection,
                    logger,
                    DesignDashboardSp.Actions.GetCustomerSales,
                    salesParams,
                    incomingId: null,
                    productId: null,
                    designId: null,
                    cancellationToken)
                .ConfigureAwait(false);

            // One DTO per GetCustomerSales row — never regroup by DesignId.
            var result = salesRows.Select(r => new CustomerSalesDto
            {
                DesignId = r.DesignId,
                DesignCode = r.DesignCode?.Trim() ?? string.Empty,
                DesignName = r.DesignName?.Trim() ?? string.Empty,
                ProductId = r.ProductId,
                ProductName = SpText(r.ProductName) ?? string.Empty,
                TotalSalesQty = r.TotalSalesQty,
                TotalSalesAmount = r.TotalSalesAmount,
                PendingOrder = r.PendingOrder,
                PendingProcess = r.PendingProcess,
                ImageThumbnail = r.ImgThumbData is { Length: > 0 }
                    ? ImageHelper.ToBase64DataUrl(r.ImgThumbData)
                    : null
            }).ToList();

            logger.LogInformation(
                "[SP] Action={Action} Rows={Rows}",
                DesignDashboardSp.Actions.GetCustomerSales, result.Count);

            if (result.Any(r => r.ProductId <= 0))
            {
                await ApplyProductIdsFromSummaryAsync(
                        connection, result, accountId, startDate, endDate, cancellationToken)
                    .ConfigureAwait(false);
            }

            // Drop rows that still lack ProductId (cannot open detail without it).
            result.RemoveAll(r => r.ProductId <= 0);

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

    /// <summary>
    /// GetCustomerSales SELECT omits ProductId; GetSummary SELECT includes it (same grain).
    /// </summary>
    private async Task ApplyProductIdsFromSummaryAsync(
        SqlConnection connection,
        List<CustomerSalesDto> rows,
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetSummary);
        SpCallHelper.AddInt(p, "@AccountId", accountId);
        SpCallHelper.AddDateTime(p, "@StartDate", startDate);
        SpCallHelper.AddDateTime(p, "@EndDate", endDate);

        logger.LogInformation(
            "[SP] Action={Action} Params=@AccountId={AccountId} (ProductId backfill)",
            DesignDashboardSp.Actions.GetSummary, accountId);

        var summary = await SpCallHelper.QueryAsync<SummaryProductRow>(
                connection,
                logger,
                DesignDashboardSp.Actions.GetSummary,
                p,
                incomingId: null,
                productId: null,
                designId: null,
                cancellationToken)
            .ConfigureAwait(false);

        logger.LogInformation(
            "[SP] Action={Action} Rows={Rows}",
            DesignDashboardSp.Actions.GetSummary, summary.Count);

        foreach (var row in rows.Where(r => r.ProductId <= 0))
        {
            var match = summary.FirstOrDefault(s =>
                s.ProductId > 0
                && s.DesignId == row.DesignId
                && s.TotalSalesQty == row.TotalSalesQty
                && s.TotalSalesAmount == row.TotalSalesAmount
                && string.Equals(
                    (s.ProductName ?? string.Empty).Trim(),
                    (row.ProductName ?? string.Empty).Trim(),
                    StringComparison.OrdinalIgnoreCase));

            if (match is not null)
            {
                row.ProductId = match.ProductId;
            }
        }
    }

    private static string? SpText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var t = value.Trim();
        return t is "-" or "—" ? null : t;
    }
}
