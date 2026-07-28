using System.Data;
using System.Diagnostics;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Customer design sales for Design Cards — dbo.usp_DesignDashboard only.
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
            "Executing {Proc} Action={Action} for AccountId={AccountId}, StartDate={StartDate}, EndDate={EndDate}",
            DesignDashboardSp.Name,
            DesignDashboardSp.Actions.GetCustomerSales,
            accountId,
            startDate,
            endDate);

        var sw = Stopwatch.StartNew();
        try
        {
            await using var connection = (SqlConnection)connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var result = await ExecuteCustomerSalesAsync(
                connection, accountId, startDate, endDate, cancellationToken).ConfigureAwait(false);

            await EnrichProductNamesAsync(connection, result, cancellationToken).ConfigureAwait(false);

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
                "{Proc} returned {Count} rows ({WithImages} with thumbnails) in {ElapsedMs}ms",
                DesignDashboardSp.Name,
                result.Count,
                result.Count(r => !string.IsNullOrEmpty(r.ImageThumbnail)),
                sw.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            logger.LogError(
                ex,
                "{Proc} failed for AccountId={AccountId} after {ElapsedMs}ms",
                DesignDashboardSp.Name,
                accountId,
                sw.ElapsedMilliseconds);
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
            list.Add(new CustomerSalesDto
            {
                DesignId = reader.GetInt32(reader.GetOrdinal("DesignId")),
                DesignCode = reader.GetString(reader.GetOrdinal("DesignCode")).Trim(),
                DesignName = reader.GetString(reader.GetOrdinal("DesignName")).Trim(),
                TotalSalesQty = reader.GetDecimal(reader.GetOrdinal("TotalSalesQty")),
                TotalSalesAmount = reader.GetDecimal(reader.GetOrdinal("TotalSalesAmount")),
                PendingOrder = reader.GetDecimal(reader.GetOrdinal("PendingOrder")),
                PendingProcess = reader.GetDecimal(reader.GetOrdinal("PendingProcess")),
                ProductName = string.Empty,
                ImageThumbnail = null
            });
        }

        return list;
    }

    private static async Task EnrichProductNamesAsync(
        SqlConnection connection,
        List<CustomerSalesDto> rows,
        CancellationToken cancellationToken)
    {
        if (rows.Count == 0) return;

        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetProductNames, commandTimeout: 60);

        AdoNetHelper.AddIntIdListParameter(
            command,
            "@DesignIds",
            rows.Select(r => r.DesignId));

        var lookup = new Dictionary<int, string>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            var id = reader.GetInt32(reader.GetOrdinal("DesignId"));
            var nameOrdinal = reader.GetOrdinal("ProductName");
            var name = reader.IsDBNull(nameOrdinal)
                ? string.Empty
                : reader.GetString(nameOrdinal).Trim();
            lookup[id] = name;
        }

        foreach (var row in rows)
        {
            row.ProductName = lookup.GetValueOrDefault(row.DesignId, string.Empty);
        }
    }
}
