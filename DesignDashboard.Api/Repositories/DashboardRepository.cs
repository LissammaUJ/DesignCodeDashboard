using System.Data;
using System.Diagnostics;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Dashboard KPI summary + charts — dbo.usp_DesignDashboard only.
/// </summary>
public sealed class DashboardRepository(
    ISqlConnectionFactory connectionFactory,
    ILogger<DashboardRepository> logger) : IDashboardRepository
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var sales = await ExecuteCustomerwiseSalesAsync(filter, cancellationToken).ConfigureAwait(false);

        return new DashboardSummaryDto
        {
            TotalDesigns = sales.Select(s => s.DesignId).Distinct().Count(),
            TotalOrderQty = sales.Sum(s => s.TotalOrderQty),
            TotalOrderSalesValue = sales.Sum(s => s.TotalOrderAmount),
            TotalSalesQty = sales.Sum(s => s.TotalSalesQty),
            TotalSalesValue = sales.Sum(s => s.TotalSalesAmount),
            PendingOrderValue = sales.Sum(s => s.PendingOrderValue),
            PendingOrders = sales.Sum(s => s.PendingOrder),
            InProcessing = sales.Sum(s => s.PendingProcess),
            CompletedOrders = sales.Sum(s => s.CompletedOrderQty)
        };
    }

    public async Task<DashboardChartsDto> GetChartsAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var start = DateHelper.StartOfDay(filter.StartDate);
        var end = DateHelper.EndOfDay(filter.EndDate);
        var accountId = filter.CustomerAccountId;

        var salesTrendTask = GetSalesTrendAsync(accountId, start, end, cancellationToken);
        var topCustomersTask = GetTopCustomersAsync(start, end, cancellationToken);
        var topCategoriesTask = GetTopCategoriesAsync(accountId, start, end, cancellationToken);

        await Task.WhenAll(salesTrendTask, topCustomersTask, topCategoriesTask).ConfigureAwait(false);

        return new DashboardChartsDto
        {
            SalesTrend = await salesTrendTask.ConfigureAwait(false),
            TopCustomers = await topCustomersTask.ConfigureAwait(false),
            TopCategories = await topCategoriesTask.ConfigureAwait(false)
        };
    }

    private async Task<IReadOnlyList<DashboardSummarySalesRow>> ExecuteCustomerwiseSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        var accountId = filter.CustomerAccountId;
        var startDate = DateHelper.StartOfDay(filter.StartDate);
        var endDate = DateHelper.EndOfDay(filter.EndDate);

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetSummary);

        DesignDashboardSp.AddOptionalInt(command, "@AccountId", accountId);
        DesignDashboardSp.AddOptionalDateTime(command, "@StartDate", startDate);
        DesignDashboardSp.AddOptionalDateTime(command, "@EndDate", endDate);

        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        var list = new List<DashboardSummarySalesRow>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            list.Add(new DashboardSummarySalesRow
            {
                DesignId = reader.GetInt32(reader.GetOrdinal("DesignId")),
                DesignCode = reader.GetString(reader.GetOrdinal("DesignCode")),
                DesignName = reader.GetString(reader.GetOrdinal("DesignName")),
                TotalSalesQty = reader.GetDecimal(reader.GetOrdinal("TotalSalesQty")),
                TotalSalesAmount = reader.GetDecimal(reader.GetOrdinal("TotalSalesAmount")),
                PendingOrder = reader.GetDecimal(reader.GetOrdinal("PendingOrder")),
                PendingProcess = reader.GetDecimal(reader.GetOrdinal("PendingProcess")),
                TotalOrderQty = reader.GetDecimal(reader.GetOrdinal("TotalOrderQty")),
                TotalOrderAmount = reader.GetDecimal(reader.GetOrdinal("TotalOrderAmount")),
                PendingOrderValue = reader.GetDecimal(reader.GetOrdinal("PendingOrderValue")),
                CompletedOrderQty = reader.GetDecimal(reader.GetOrdinal("CompletedOrderQty"))
            });
        }

        sw.Stop();
        logger.LogInformation(
            "{Proc} Action={Action} returned {Count} rows in {ElapsedMs}ms for AccountId={AccountId}",
            DesignDashboardSp.Name,
            DesignDashboardSp.Actions.GetSummary,
            list.Count,
            sw.ElapsedMilliseconds,
            accountId);

        return list;
    }

    private async Task<IReadOnlyList<ChartDataPointDto>> GetSalesTrendAsync(
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetSalesTrend);

        DesignDashboardSp.AddOptionalInt(command, "@AccountId", accountId);
        DesignDashboardSp.AddOptionalDateTime(command, "@StartDate", startDate);
        DesignDashboardSp.AddOptionalDateTime(command, "@EndDate", endDate);

        return await ReadChartPointsAsync(connection, command, cancellationToken).ConfigureAwait(false);
    }

    private async Task<IReadOnlyList<ChartDataPointDto>> GetTopCustomersAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetTopCustomers);

        DesignDashboardSp.AddOptionalDateTime(command, "@StartDate", startDate);
        DesignDashboardSp.AddOptionalDateTime(command, "@EndDate", endDate);

        return await ReadChartPointsAsync(connection, command, cancellationToken).ConfigureAwait(false);
    }

    private async Task<IReadOnlyList<ChartDataPointDto>> GetTopCategoriesAsync(
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetTopCategories);

        DesignDashboardSp.AddOptionalInt(command, "@AccountId", accountId);
        DesignDashboardSp.AddOptionalDateTime(command, "@StartDate", startDate);
        DesignDashboardSp.AddOptionalDateTime(command, "@EndDate", endDate);

        return await ReadChartPointsAsync(connection, command, cancellationToken).ConfigureAwait(false);
    }

    private static async Task<IReadOnlyList<ChartDataPointDto>> ReadChartPointsAsync(
        SqlConnection connection,
        SqlCommand command,
        CancellationToken cancellationToken)
    {
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        var list = new List<ChartDataPointDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        var labelOrd = reader.GetOrdinal("Label");
        var valueOrd = reader.GetOrdinal("Value");

        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            list.Add(new ChartDataPointDto
            {
                Label = reader.IsDBNull(labelOrd)
                    ? string.Empty
                    : reader.GetString(labelOrd).Trim(),
                Value = reader.IsDBNull(valueOrd) ? 0 : reader.GetDecimal(valueOrd)
            });
        }

        return list;
    }

    private sealed class DashboardSummarySalesRow
    {
        public int DesignId { get; set; }
        public string DesignCode { get; set; } = string.Empty;
        public string DesignName { get; set; } = string.Empty;
        public decimal TotalSalesQty { get; set; }
        public decimal TotalSalesAmount { get; set; }
        public decimal PendingOrder { get; set; }
        public decimal PendingProcess { get; set; }
        public decimal TotalOrderQty { get; set; }
        public decimal TotalOrderAmount { get; set; }
        public decimal PendingOrderValue { get; set; }
        public decimal CompletedOrderQty { get; set; }
    }
}
