using System.Diagnostics;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Customer filter — Action=GetCustomers (@CoId from JWT, @StartDate, @EndDate).
/// </summary>
public sealed class CustomerRepository(
    ISqlConnectionFactory connectionFactory,
    IHttpContextAccessor httpContextAccessor,
    ILogger<CustomerRepository> logger) : ICustomerRepository
{
    public async Task<IReadOnlyList<CustomerDto>> GetActiveCustomersAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var start = DateHelper.StartOfDay(startDate);
        var end = DateHelper.EndOfDay(endDate);
        var coId = CompanyContext.GetRequiredCoId(httpContextAccessor);
        var sw = Stopwatch.StartNew();

        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var p = SpCallHelper.Params(DesignDashboardSp.Actions.GetCustomers);
            SpCallHelper.AddDateTime(p, "@StartDate", start);
            SpCallHelper.AddDateTime(p, "@EndDate", end);
            SpCallHelper.AddInt(p, "@CoId", coId);

            var rows = await SpCallHelper.QueryAsync<CustomerDto>(
                    connection,
                    logger,
                    DesignDashboardSp.Actions.GetCustomers,
                    p,
                    incomingId: null,
                    productId: null,
                    designId: null,
                    cancellationToken)
                .ConfigureAwait(false);

            var result = rows
                .Select(c => new CustomerDto
                {
                    AccountId = c.AccountId,
                    AccountName = c.AccountName?.Trim() ?? string.Empty
                })
                .ToList();

            sw.Stop();
            logger.LogInformation(
                "[SP] Action={Action} CoId={CoId} Rows={Rows} ElapsedMs={ElapsedMs}",
                DesignDashboardSp.Actions.GetCustomers,
                coId,
                result.Count,
                sw.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex) when (ex is OperationCanceledException or TaskCanceledException)
        {
            cancellationToken.ThrowIfCancellationRequested();
            throw;
        }
    }
}
