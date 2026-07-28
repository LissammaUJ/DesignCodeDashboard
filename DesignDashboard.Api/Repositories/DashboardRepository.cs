using System.Diagnostics;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;
using Dapper;
using Microsoft.Extensions.Logging;

namespace DesignDashboard.Api.Repositories;

public sealed class DashboardRepository(
    ISqlConnectionFactory connectionFactory,
    ILogger<DashboardRepository> logger) : IDashboardRepository
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var sales = await ExecuteCustomerwiseSalesAsync(filter, cancellationToken);

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

        // Parallel independent chart queries (separate pooled connections).
        var salesTrendTask = GetSalesTrendAsync(accountId, start, end, cancellationToken);
        var topCustomersTask = GetTopCustomersAsync(start, end, cancellationToken);
        var topCategoriesTask = GetTopCategoriesAsync(accountId, start, end, cancellationToken);

        await Task.WhenAll(salesTrendTask, topCustomersTask, topCategoriesTask);

        return new DashboardChartsDto
        {
            SalesTrend = await salesTrendTask,
            TopCustomers = await topCustomersTask,
            TopCategories = await topCategoriesTask
        };
    }

    /// <summary>
    /// Dashboard Summary sales query (CarolERP) — one row per Design.
    /// Order / pending / completed metrics use distinct BoSl for that design.
    /// Parameters only: @AccountId, @StartDate, @EndDate.
    /// </summary>
    private const string DashboardSummarySalesSql = """
        WITH DesignSales AS (
            SELECT
                  d.DesignId,
                  d.DesignCode,
                  d.DesignName,
                  SUM(bet.Quantity) AS TotalSalesQty,
                  SUM(bet.Amount * bm.ExchRate) AS TotalSalesAmount
            FROM Bill_mas bm
            INNER JOIN Bill_Exp_trn bet
                    ON bm.BillId = bet.BillId
            INNER JOIN Bo_trn bo
                    ON bet.BoSl = bo.BoSl
            INNER JOIN Product p
                    ON bo.ProductId = p.ProductId
            INNER JOIN ItemDesign d
                    ON p.DesignId = d.DesignId
            WHERE bm.AccountId = @AccountId
              AND bm.BillDate BETWEEN @StartDate AND @EndDate
            GROUP BY
                  d.DesignId,
                  d.DesignCode,
                  d.DesignName
        ),
        DesignBoSl AS (
            SELECT
                  p2.DesignId,
                  bo2.BoSl,
                  MAX(bo2.Quantity) AS Quantity,
                  MAX(bo2.AddlQty) AS AddlQty,
                  MAX(bo2.FiledQty) AS FiledQty,
                  MAX(bo2.Amount) AS Amount,
                  MAX(bo2.Rate) AS Rate
            FROM Bill_mas bm2
            INNER JOIN Bill_Exp_trn bet2
                    ON bm2.BillId = bet2.BillId
            INNER JOIN Bo_trn bo2
                    ON bet2.BoSl = bo2.BoSl
            INNER JOIN Product p2
                    ON bo2.ProductId = p2.ProductId
            WHERE bm2.AccountId = @AccountId
              AND bm2.BillDate BETWEEN @StartDate AND @EndDate
              AND p2.DesignId IN (SELECT DesignId FROM DesignSales)
            GROUP BY
                  p2.DesignId,
                  bo2.BoSl
        ),
        DesignOrderAgg AS (
            SELECT
                  DesignId,
                  SUM(Quantity) AS TotalOrderQty,
                  SUM(Amount) AS TotalOrderAmount,
                  SUM(Quantity + AddlQty - FiledQty) AS PendingOrder,
                  SUM((Quantity + AddlQty - FiledQty) * Rate) AS PendingOrderValue,
                  SUM(FiledQty) AS CompletedOrderQty
            FROM DesignBoSl
            GROUP BY DesignId
        ),
        DesignBoSlProcess AS (
            SELECT
                  b.DesignId,
                  b.BoSl,
                  ISNULL((
                      SELECT SUM(Po_trn.Quantity - LandedQty - ProducedQty)
                      FROM Po_trn
                      INNER JOIN Pi_trn
                             ON Po_trn.PiSl = Pi_trn.PiSl
                      WHERE Pi_trn.BoSl = b.BoSl
                  ), 0) AS PendingProcess
            FROM DesignBoSl b
        ),
        DesignProcess AS (
            SELECT
                  DesignId,
                  SUM(PendingProcess) AS PendingProcess
            FROM DesignBoSlProcess
            GROUP BY DesignId
        )
        SELECT
              s.DesignId,
              s.DesignCode,
              s.DesignName,
              s.TotalSalesQty,
              s.TotalSalesAmount,
              ISNULL(o.PendingOrder, 0) AS PendingOrder,
              ISNULL(p.PendingProcess, 0) AS PendingProcess,
              ISNULL(o.TotalOrderQty, 0) AS TotalOrderQty,
              ISNULL(o.TotalOrderAmount, 0) AS TotalOrderAmount,
              ISNULL(o.PendingOrderValue, 0) AS PendingOrderValue,
              ISNULL(o.CompletedOrderQty, 0) AS CompletedOrderQty
        FROM DesignSales s
        LEFT JOIN DesignOrderAgg o
               ON o.DesignId = s.DesignId
        LEFT JOIN DesignProcess p
               ON p.DesignId = s.DesignId
        ORDER BY s.DesignCode;
        """;

    private async Task<IReadOnlyList<DashboardSummarySalesRow>> ExecuteCustomerwiseSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        using var connection = connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<DashboardSummarySalesRow>(
            new CommandDefinition(
                DashboardSummarySalesSql,
                new
                {
                    AccountId = filter.CustomerAccountId,
                    StartDate = DateHelper.StartOfDay(filter.StartDate),
                    EndDate = DateHelper.EndOfDay(filter.EndDate)
                },
                cancellationToken: cancellationToken,
                commandTimeout: 120));

        sw.Stop();
        var list = rows.AsList();
        logger.LogInformation(
            "DashboardSummarySalesSql returned {Count} rows in {ElapsedMs}ms for AccountId={AccountId}",
            list.Count,
            sw.ElapsedMilliseconds,
            filter.CustomerAccountId);

        return list;
    }

    private async Task<IReadOnlyList<ChartDataPointDto>> GetSalesTrendAsync(
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                FORMAT(bm.BillDate, 'yyyy-MM') AS Label,
                CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18,2)) AS Value
            FROM Bill_mas bm
            INNER JOIN Bill_Exp_trn bet ON bm.BillId = bet.BillId
            WHERE bm.AccountId = @AccountId
              AND bm.BillDate BETWEEN @StartDate AND @EndDate
            GROUP BY FORMAT(bm.BillDate, 'yyyy-MM')
            ORDER BY Label;
            """;

        using var connection = connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<ChartRow>(
            new CommandDefinition(
                sql,
                new { AccountId = accountId, StartDate = startDate, EndDate = endDate },
                cancellationToken: cancellationToken));

        return [.. rows.Select(r => new ChartDataPointDto
        {
            Label = r.Label?.Trim() ?? string.Empty,
            Value = r.Value
        })];
    }

    private async Task<IReadOnlyList<ChartDataPointDto>> GetTopCustomersAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT TOP 10
                a.AccountName AS Label,
                CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18,2)) AS Value
            FROM Bill_mas bm
            INNER JOIN Bill_Exp_trn bet ON bm.BillId = bet.BillId
            INNER JOIN Account a ON a.AccountId = bm.AccountId
            WHERE bm.BillDate BETWEEN @StartDate AND @EndDate
              AND a.Active = 1
            GROUP BY a.AccountName
            ORDER BY Value DESC;
            """;

        using var connection = connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<ChartRow>(
            new CommandDefinition(
                sql,
                new { StartDate = startDate, EndDate = endDate },
                cancellationToken: cancellationToken));

        return [.. rows.Select(r => new ChartDataPointDto
        {
            Label = r.Label?.Trim() ?? string.Empty,
            Value = r.Value
        })];
    }

    private async Task<IReadOnlyList<ChartDataPointDto>> GetTopCategoriesAsync(
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT TOP 10
                ISNULL(dc.DesCatName, 'Uncategorized') AS Label,
                CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18,2)) AS Value
            FROM Bill_mas bm
            INNER JOIN Bill_Exp_trn bet ON bm.BillId = bet.BillId
            INNER JOIN Bo_trn bo ON bet.BoSl = bo.BoSl
            INNER JOIN Product p ON bo.ProductId = p.ProductId
            INNER JOIN ItemDesign d ON p.DesignId = d.DesignId
            LEFT JOIN DesignCat dc ON dc.DesCatId = d.DesCatId
            WHERE bm.AccountId = @AccountId
              AND bm.BillDate BETWEEN @StartDate AND @EndDate
            GROUP BY ISNULL(dc.DesCatName, 'Uncategorized')
            ORDER BY Value DESC;
            """;

        using var connection = connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<ChartRow>(
            new CommandDefinition(
                sql,
                new { AccountId = accountId, StartDate = startDate, EndDate = endDate },
                cancellationToken: cancellationToken));

        return [.. rows.Select(r => new ChartDataPointDto
        {
            Label = r.Label?.Trim() ?? string.Empty,
            Value = r.Value
        })];
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
