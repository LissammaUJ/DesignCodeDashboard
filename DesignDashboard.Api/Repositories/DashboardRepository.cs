using System.Data;
using System.Diagnostics;
using Dapper;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Dashboard KPI summary — dbo.Usp_DesignDashboard_New (@Action = GetSummary).
/// SP adapter: private result row → stable <see cref="DashboardSummaryDto"/>.
/// Grain: ONE summary row (do not Distinct/Sum product rows).
/// </summary>
public sealed class DashboardRepository(
    ISqlConnectionFactory connectionFactory,
    IHttpContextAccessor httpContextAccessor,
    ILogger<DashboardRepository> logger) : IDashboardRepository
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var row = await ExecuteSummaryAsync(filter, cancellationToken).ConfigureAwait(false);
        return MapToDto(row);
    }

    /// <summary>
    /// Isolates SP column names and NULL handling from the public API contract.
    /// CompletedOrders stays 0 — GetSummary does not return CompletedOrderQty.
    /// </summary>
    private static DashboardSummaryDto MapToDto(DashboardSummarySpRow? row) =>
        new()
        {
            TotalProducts = SpValueHelper.NonNegativeInt(row?.TotalProducts),
            TotalOrderQty = SpValueHelper.NonNegative(row?.TotalOrderQty),
            TotalOrderSalesValue = SpValueHelper.NonNegative(row?.TotalOrderAmount),
            TotalSalesQty = SpValueHelper.NonNegative(row?.TotalSalesQty),
            TotalSalesValue = SpValueHelper.NonNegative(row?.TotalSalesAmount),
            PendingOrderValue = SpValueHelper.NonNegative(row?.PendingOrderValue),
            PendingOrders = SpValueHelper.NonNegative(row?.PendingOrder),
            InProcessing = SpValueHelper.NonNegative(row?.PendingProcess),
            CompletedOrders = 0
        };

    private async Task<DashboardSummarySpRow?> ExecuteSummaryAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        var accountId = filter.CustomerAccountId;
        var startDate = DateHelper.StartOfDay(filter.StartDate);
        var endDate = DateHelper.EndOfDay(filter.EndDate);
        var coId = CompanyContext.GetRequiredCoId(httpContextAccessor);

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        var parameters = DesignDashboardSp.CreateParameters(DesignDashboardSp.Actions.GetSummary);
        DesignDashboardSp.AddInt(parameters, "@AccountId", accountId);
        DesignDashboardSp.AddDateTime(parameters, "@StartDate", startDate);
        DesignDashboardSp.AddDateTime(parameters, "@EndDate", endDate);
        DesignDashboardSp.AddInt(parameters, "@CoId", coId);

        var list = (await connection.QueryAsync<DashboardSummarySpRow>(
                new CommandDefinition(
                    DesignDashboardSp.Name,
                    parameters,
                    commandType: CommandType.StoredProcedure,
                    cancellationToken: cancellationToken))
            .ConfigureAwait(false)).ToList();

        sw.Stop();

        logger.LogInformation(
            "{Proc} Action={Action} returned {Count} rows in {ElapsedMs}ms for AccountId={AccountId} TotalProducts={TotalProducts}",
            DesignDashboardSp.Name,
            DesignDashboardSp.Actions.GetSummary,
            list.Count,
            sw.ElapsedMilliseconds,
            accountId,
            list.Count == 1 ? list[0].TotalProducts : null);

        // Contract: GetSummary returns exactly one summary row (or none).
        if (list.Count > 1)
        {
            logger.LogError(
                "{Proc} Action={Action} contract violation: expected 0 or 1 summary row but returned {Count} for AccountId={AccountId}",
                DesignDashboardSp.Name,
                DesignDashboardSp.Actions.GetSummary,
                list.Count,
                accountId);

            throw new InvalidOperationException(
                $"{DesignDashboardSp.Name} Action={DesignDashboardSp.Actions.GetSummary} returned {list.Count} rows for AccountId={accountId}; expected exactly one summary row.");
        }

        return list.Count == 0 ? null : list[0];
    }

    /// <summary>
    /// Private SP-shaped row. Nullable numerics distinguish DB NULL from zero before DTO mapping.
    /// Extra SP columns are ignored by Dapper (safe). Renamed/removed required columns break here only.
    /// </summary>
    private sealed class DashboardSummarySpRow
    {
        public int? TotalProducts { get; set; }
        public decimal? TotalOrderQty { get; set; }
        public decimal? TotalOrderAmount { get; set; }
        public decimal? TotalSalesQty { get; set; }
        public decimal? TotalSalesAmount { get; set; }
        public decimal? PendingOrder { get; set; }
        public decimal? PendingOrderValue { get; set; }
        public decimal? PendingProcess { get; set; }
    }
}
