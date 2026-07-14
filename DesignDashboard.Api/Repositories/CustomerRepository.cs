using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Dapper;

namespace DesignDashboard.Api.Repositories;

public sealed class CustomerRepository(ISqlConnectionFactory connectionFactory) : ICustomerRepository
{
    public async Task<IReadOnlyList<CustomerDto>> GetActiveCustomersAsync(CancellationToken cancellationToken = default)
    {
        // Active accounts that appear on bills (sales dashboard). Avoids loading every Account row
        // over the remote link (~4.6k+), which caused ~45–60s responses and client cancellations.
        const string sql = """
            SELECT
                CAST(a.AccountId AS INT) AS AccountId,
                a.AccountName
            FROM Account a
            WHERE a.Active = 1
              AND EXISTS (
                    SELECT 1
                    FROM Bill_mas bm
                    WHERE bm.AccountId = a.AccountId
              )
            ORDER BY a.AccountName;
            """;

        try
        {
            using var connection = connectionFactory.CreateConnection();
            var rows = await connection.QueryAsync<CustomerDto>(
                new CommandDefinition(
                    sql,
                    cancellationToken: cancellationToken,
                    commandTimeout: 120));
            return [.. rows];
        }
        catch (Exception ex) when (ex is OperationCanceledException or TaskCanceledException)
        {
            // Client aborted the HTTP request (navigation / refresh / timeout). Not a server fault.
            cancellationToken.ThrowIfCancellationRequested();
            throw;
        }
    }
}
