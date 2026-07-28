using System.Diagnostics;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;
using Dapper;

namespace DesignDashboard.Api.Repositories;

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
            "Executing customer sales SQL for AccountId={AccountId}, StartDate={StartDate}, EndDate={EndDate}",
            accountId,
            startDate,
            endDate);

        var sw = Stopwatch.StartNew();
        try
        {
            using var connection = connectionFactory.CreateConnection();

            // Sales list SQL stays LOB-free for performance / transport stability.
            var rows = await connection.QueryAsync<CustomerSalesResult>(
                new CommandDefinition(
                    CustomerSalesSql.ByAccountAndDateRange,
                    new { AccountId = accountId, StartDate = startDate, EndDate = endDate },
                    cancellationToken: cancellationToken,
                    commandTimeout: 120));

            List<CustomerSalesDto> result = [.. rows.Select(r => new CustomerSalesDto
            {
                DesignId = r.DesignId,
                DesignCode = r.DesignCode?.Trim() ?? string.Empty,
                DesignName = r.DesignName?.Trim() ?? string.Empty,
                TotalSalesQty = r.TotalSalesQty,
                TotalSalesAmount = r.TotalSalesAmount,
                PendingOrder = r.PendingOrder,
                PendingProcess = r.PendingProcess,
                ImageThumbnail = null
            })];

            await EnrichProductNamesAsync(connection, result, cancellationToken);

            // Thumbnails: separate batched ItemDesign query (does not rejoin sales).
            var thumbs = await DesignThumbnailLoader.LoadDataUrlsAsync(
                connectionFactory,
                result.Select(r => r.DesignId).ToArray(),
                logger,
                cancellationToken);

            foreach (var row in result)
            {
                if (thumbs.TryGetValue(row.DesignId, out var url) && !string.IsNullOrEmpty(url))
                {
                    row.ImageThumbnail = url;
                }
            }

            sw.Stop();
            var withImages = result.Count(r => !string.IsNullOrEmpty(r.ImageThumbnail));
            logger.LogInformation(
                "Customer sales returned {Count} rows ({WithImages} with thumbnails) in {ElapsedMs}ms",
                result.Count,
                withImages,
                sw.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            logger.LogError(
                ex,
                "Customer sales SQL failed for AccountId={AccountId} after {ElapsedMs}ms",
                accountId,
                sw.ElapsedMilliseconds);
            throw;
        }
    }

    private static async Task EnrichProductNamesAsync(
        System.Data.IDbConnection connection,
        List<CustomerSalesDto> rows,
        CancellationToken cancellationToken)
    {
        if (rows.Count == 0) return;

        var designIds = rows.Select(r => r.DesignId).Distinct().ToArray();
        const string sql = """
            SELECT DesignId, ProductName
            FROM (
                SELECT
                      DesignId,
                      ProductName,
                      ROW_NUMBER() OVER (
                          PARTITION BY DesignId
                          ORDER BY CASE WHEN Active = 1 THEN 0 ELSE 1 END, ProductName
                      ) AS rn
                FROM Product
                WHERE DesignId IN @DesignIds
            ) x
            WHERE rn = 1;
            """;

        var names = await connection.QueryAsync<(int DesignId, string? ProductName)>(
            new CommandDefinition(
                sql,
                new { DesignIds = designIds },
                cancellationToken: cancellationToken,
                commandTimeout: 60));

        var lookup = names.ToDictionary(
            x => x.DesignId,
            x => x.ProductName?.Trim() ?? string.Empty);

        foreach (var row in rows)
        {
            row.ProductName = lookup.GetValueOrDefault(row.DesignId, string.Empty);
        }
    }
}
