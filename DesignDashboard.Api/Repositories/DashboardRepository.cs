using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;
using Dapper;

namespace DesignDashboard.Api.Repositories;

public sealed class DashboardRepository(ISqlConnectionFactory connectionFactory) : IDashboardRepository
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var sales = await ExecuteCustomerwiseSalesAsync(filter, cancellationToken);

        return new DashboardSummaryDto
        {
            TotalDesigns = sales.Select(s => s.DesignId).Distinct().Count(),
            TotalSalesQty = sales.Sum(s => s.TotalSalesQty),
            TotalSalesValue = sales.Sum(s => s.TotalSalesAmount),
            PendingOrders = sales.Sum(s => s.PendingOrder),
            PendingOrderValue = 0,
            InProcessing = sales.Sum(s => s.PendingProcess),
            CompletedOrders = sales.Sum(s => s.TotalSalesQty)
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

    private async Task<IReadOnlyList<CustomerSalesResult>> ExecuteCustomerwiseSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<CustomerSalesResult>(
            new CommandDefinition(
                CustomerSalesSql.ByAccountAndDateRange,
                new
                {
                    AccountId = filter.CustomerAccountId,
                    StartDate = DateHelper.StartOfDay(filter.StartDate),
                    EndDate = DateHelper.EndOfDay(filter.EndDate)
                },
                cancellationToken: cancellationToken));

        return [.. rows];
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
            Label = r.Label,
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
}
