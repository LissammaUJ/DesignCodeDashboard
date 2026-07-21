using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Dapper;

namespace DesignDashboard.Api.Repositories;

public sealed class CustomerRepository(ISqlConnectionFactory connectionFactory) : ICustomerRepository
{
    public async Task<IReadOnlyList<CustomerDto>> GetActiveCustomersAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        // Customer = Masters.MasType 65, Local Customer = Masters.MasType 95.
        const string sql = """
            SELECT DISTINCT
                CAST(a.AccountId AS INT) AS AccountId,
                a.AccountName
            FROM Account a
            INNER JOIN Masters m
                ON a.MasId = m.MasId
            WHERE
                a.Active = 1
                AND m.MasType IN (65, 95)
                AND EXISTS
                (
                    SELECT 1
                    FROM Bill_mas bm
                    WHERE bm.AccountId = a.AccountId
                      AND bm.BillDate BETWEEN @StartDate AND @EndDate
                )
            ORDER BY
                a.AccountName;
            """;

        try
        {
            using var connection = connectionFactory.CreateConnection();
            var rows = await connection.QueryAsync<CustomerDto>(
                new CommandDefinition(
                    sql,
                    new
                    {
                        StartDate = DateHelper.StartOfDay(startDate),
                        EndDate = DateHelper.EndOfDay(endDate)
                    },
                    cancellationToken: cancellationToken,
                    commandTimeout: 120));
            return [.. rows];
        }
        catch (Exception ex) when (ex is OperationCanceledException or TaskCanceledException)
        {
            cancellationToken.ThrowIfCancellationRequested();
            throw;
        }
    }
}
