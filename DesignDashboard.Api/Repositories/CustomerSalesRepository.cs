using System.Data;
using System.Diagnostics;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Product cards — dbo.usp_DesignDashboard (@Action = GetCustomerSales).
/// One row per ProductId; design image/code repeated from Design master.
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

            // Distinct DesignIds — same thumbnail reused for every product under that design.
            var thumbs = await DesignThumbnailLoader.LoadDataUrlsAsync(
                connectionFactory,
                result.Select(r => r.DesignId).Distinct().ToArray(),
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
            var productNameOrd = reader.GetOrdinal("ProductName");
            list.Add(new CustomerSalesDto
            {
                DesignId = reader.GetInt32(reader.GetOrdinal("DesignId")),
                DesignCode = Convert.ToString(reader["DesignCode"])?.Trim() ?? string.Empty,
                DesignName = Convert.ToString(reader["DesignName"])?.Trim() ?? string.Empty,
                ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
                ProductName = reader.IsDBNull(productNameOrd)
                    ? "-"
                    : (Convert.ToString(reader.GetValue(productNameOrd))?.Trim() is { Length: > 0 } name
                        ? name
                        : "-"),
                TotalSalesQty = Convert.ToDecimal(reader["TotalSalesQty"]),
                TotalSalesAmount = Convert.ToDecimal(reader["TotalSalesAmount"]),
                PendingOrder = Convert.ToDecimal(reader["PendingOrder"]),
                PendingProcess = Convert.ToDecimal(reader["PendingProcess"]),
                ImageThumbnail = null
            });
        }

        return list;
    }
}
