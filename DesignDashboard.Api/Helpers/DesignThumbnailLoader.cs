using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;
using Dapper;
using Microsoft.Extensions.Logging;

namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Loads design card thumbnails separately from sales aggregation.
/// Keeps list sales SQL free of varbinary LOBs (avoids transport error 19),
/// then enriches ImageThumbnail best-effort in small batches.
/// </summary>
public static class DesignThumbnailLoader
{
    private const int BatchSize = 40;
    private const int CommandTimeoutSeconds = 90;

    private const string ByDesignIdsSql = """
        SELECT
              d.DesignId,
              d.ImgThumbData
        FROM ItemDesign d
        WHERE d.DesignId IN @DesignIds
          AND d.ImgThumbData IS NOT NULL;
        """;

    public static async Task<Dictionary<int, string?>> LoadDataUrlsAsync(
        ISqlConnectionFactory connectionFactory,
        IReadOnlyCollection<int> designIds,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var ids = designIds.Where(id => id > 0).Distinct().ToArray();
        if (ids.Length == 0)
        {
            return new Dictionary<int, string?>();
        }

        var result = new Dictionary<int, string?>();

        for (var offset = 0; offset < ids.Length; offset += BatchSize)
        {
            var batch = ids.Skip(offset).Take(BatchSize).ToArray();
            try
            {
                using var connection = connectionFactory.CreateConnection();
                var rows = await connection.QueryAsync<DesignImageRow>(
                    new CommandDefinition(
                        ByDesignIdsSql,
                        new { DesignIds = batch },
                        cancellationToken: cancellationToken,
                        commandTimeout: CommandTimeoutSeconds));

                foreach (var row in rows)
                {
                    result[row.DesignId] = ImageHelper.ToBase64DataUrl(row.ImgThumbData);
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
            {
                logger.LogWarning(
                    ex,
                    "Thumbnail batch failed for {Count} designIds (offset {Offset}); continuing without those images",
                    batch.Length,
                    offset);
            }
        }

        return result;
    }
}
