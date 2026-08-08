using System.Data;
using System.Diagnostics;
using Dapper;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Dashboard KPI summary (9 cards) — dbo.Usp_DesignDashboard_New (@Action = GetSummary).
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

        // Product-wise KPIs (one row per ProductId from GetSummary). Never count by DesignId only.
        static decimal NonNeg(decimal v) => v < 0 ? 0 : v;

        return new DashboardSummaryDto
        {
            TotalProducts = sales.Select(s => s.ProductId).Distinct().Count(),
            TotalOrderQty = sales.Sum(s => NonNeg(s.TotalOrderQty)),
            TotalOrderSalesValue = sales.Sum(s => NonNeg(s.TotalOrderAmount)),
            TotalSalesQty = sales.Sum(s => NonNeg(s.TotalSalesQty)),
            TotalSalesValue = sales.Sum(s => NonNeg(s.TotalSalesAmount)),
            PendingOrderValue = sales.Sum(s => NonNeg(s.PendingOrderValue)),
            PendingOrders = sales.Sum(s => NonNeg(s.PendingOrder)),
            InProcessing = sales.Sum(s => NonNeg(s.PendingProcess)),
            CompletedOrders = sales.Sum(s => NonNeg(s.CompletedOrderQty))
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
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        var parameters = DesignDashboardSp.CreateParameters(DesignDashboardSp.Actions.GetSummary);
        DesignDashboardSp.AddInt(parameters, "@AccountId", accountId);
        DesignDashboardSp.AddDateTime(parameters, "@StartDate", startDate);
        DesignDashboardSp.AddDateTime(parameters, "@EndDate", endDate);

        var list = (await connection.QueryAsync<DashboardSummarySalesRow>(
                new CommandDefinition(
                    DesignDashboardSp.Name,
                    parameters,
                    commandType: CommandType.StoredProcedure,
                    cancellationToken: cancellationToken))
            .ConfigureAwait(false)).ToList();

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

    private sealed class DashboardSummarySalesRow
    {
        public int DesignId { get; set; }
        public int ProductId { get; set; }
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
