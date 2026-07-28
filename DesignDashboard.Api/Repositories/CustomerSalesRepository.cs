using System.Data;
using System.Diagnostics;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Design cards — dbo.usp_DesignDashboard (@Action = GetCustomerSales).
/// ProductName is returned by the SP (no separate enrichment).
/// </summary>
public sealed class CustomerSalesRepository(
    ISqlConnectionFactory connectionFactory,
    ILogger<CustomerSalesRepository> logger) : ICustomerSalesRepository
{
    public async Task<IReadOnlyList<CustomerSalesDto>> GetCustomerSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var accountId = filter.CustomerAccountId;
        var startDate = DateHelper.StartOfDay(filter.StartDate);
        var endDate = DateHelper.EndOfDay(filter.EndDate);

        logger.LogInformation(
            "Executing {Proc} Action={Action} for AccountId={AccountId}",
            DesignDashboardSp.Name,
            DesignDashboardSp.Actions.GetCustomerSales,
            accountId);

        var sw = Stopwatch.StartNew();
        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var result = await ExecuteCustomerSalesAsync(
                connection, accountId, startDate, endDate, cancellationToken).ConfigureAwait(false);

            var thumbs = await DesignThumbnailLoader.LoadDataUrlsAsync(
                connectionFactory,
                result.Select(r => r.DesignId).ToArray(),
                logger,
                cancellationToken).ConfigureAwait(false);

            foreach (var row in result)
            {
                if (thumbs.TryGetValue(row.DesignId, out var url) && !string.IsNullOrEmpty(url))
                {
                    row.ImageThumbnail = url;
                }
            }

            sw.Stop();
            logger.LogInformation(
                "{Proc} returned {Count} rows in {ElapsedMs}ms",
                DesignDashboardSp.Name,
                result.Count,
                sw.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            logger.LogError(ex, "{Proc} failed for AccountId={AccountId}", DesignDashboardSp.Name, accountId);
            throw;
        }
    }

    private static async Task<List<CustomerSalesDto>> ExecuteCustomerSalesAsync(
        SqlConnection connection,
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetCustomerSales);

        DesignDashboardSp.AddOptionalInt(command, "@AccountId", accountId);
        DesignDashboardSp.AddOptionalDateTime(command, "@StartDate", startDate);
        DesignDashboardSp.AddOptionalDateTime(command, "@EndDate", endDate);

        var list = new List<CustomerSalesDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            var productOrd = reader.GetOrdinal("ProductName");
            list.Add(new CustomerSalesDto
            {
                DesignId = reader.GetInt32(reader.GetOrdinal("DesignId")),
                DesignCode = reader.GetString(reader.GetOrdinal("DesignCode")).Trim(),
                DesignName = reader.GetString(reader.GetOrdinal("DesignName")).Trim(),
                ProductName = reader.IsDBNull(productOrd) ? string.Empty : reader.GetString(productOrd).Trim(),
                TotalSalesQty = reader.GetDecimal(reader.GetOrdinal("TotalSalesQty")),
                TotalSalesAmount = reader.GetDecimal(reader.GetOrdinal("TotalSalesAmount")),
                PendingOrder = reader.GetDecimal(reader.GetOrdinal("PendingOrder")),
                PendingProcess = reader.GetDecimal(reader.GetOrdinal("PendingProcess")),
                ImageThumbnail = null
            });
        }

        return list;
    }
}
