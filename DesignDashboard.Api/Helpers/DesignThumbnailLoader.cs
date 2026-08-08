using System.Data;
using Dapper;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;

namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Loads design card thumbnails via dbo.Usp_DesignDashboard_New (@Action = GetDesignThumbnails).
/// Batches DesignIds to avoid huge single payloads over WAN.
/// </summary>
public static class DesignThumbnailLoader
{
    private const int BatchSize = 40;
    private const int CommandTimeoutSeconds = 90;

    private sealed class ThumbRow
    {
        public int DesignId { get; set; }
        public byte[]? ImgThumbData { get; set; }
    }

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
                await using var connection = (SqlConnection)connectionFactory.CreateConnection();
                await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

                var parameters = DesignDashboardSp.CreateParameters(DesignDashboardSp.Actions.GetDesignThumbnails);
                DesignDashboardSp.AddDesignIds(parameters, batch);

                var rows = await connection.QueryAsync<ThumbRow>(
                        new CommandDefinition(
                            DesignDashboardSp.Name,
                            parameters,
                            commandType: CommandType.StoredProcedure,
                            commandTimeout: CommandTimeoutSeconds,
                            cancellationToken: cancellationToken))
                    .ConfigureAwait(false);

                foreach (var row in rows)
                {
                    if (row.ImgThumbData is { Length: > 0 })
                    {
                        result[row.DesignId] = ImageHelper.ToBase64DataUrl(row.ImgThumbData);
                    }
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException and not TaskCanceledException)
            {
                logger.LogWarning(
                    ex,
                    "Thumbnail SP batch failed for {Count} designIds (offset {Offset}); continuing without those images",
                    batch.Length,
                    offset);
            }
        }

        return result;
    }
}
