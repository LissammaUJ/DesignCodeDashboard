using System.Data;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Customer filter dropdown — dbo.usp_DesignDashboard (@Action = GetActiveCustomers).
/// </summary>
public sealed class CustomerRepository(ISqlConnectionFactory connectionFactory) : ICustomerRepository
{
    public async Task<IReadOnlyList<CustomerDto>> GetActiveCustomersAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var start = DateHelper.StartOfDay(startDate);
        var end = DateHelper.EndOfDay(endDate);

        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await using var command = DesignDashboardSp.Create(
                connection, DesignDashboardSp.Actions.GetActiveCustomers);

            DesignDashboardSp.AddOptionalDateTime(command, "@StartDate", start);
            DesignDashboardSp.AddOptionalDateTime(command, "@EndDate", end);

            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var list = new List<CustomerDto>();
            await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
            while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
            {
                list.Add(new CustomerDto
                {
                    AccountId = reader.GetInt32(reader.GetOrdinal("AccountId")),
                    AccountName = reader.GetString(reader.GetOrdinal("AccountName")).Trim()
                });
            }

            return list;
        }
        catch (Exception ex) when (ex is OperationCanceledException or TaskCanceledException)
        {
            cancellationToken.ThrowIfCancellationRequested();
            throw;
        }
    }
}
