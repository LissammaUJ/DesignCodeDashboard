using System.Data;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;

namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Loads design card thumbnails via dbo.usp_DesignDashboard (@Action = GetDesignThumbnails).
/// Batches DesignIds to avoid huge single payloads over WAN.
/// </summary>
public static class DesignThumbnailLoader
{
    private const int BatchSize = 40;
    private const int CommandTimeoutSeconds = 90;

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
                await using var command = DesignDashboardSp.Create(
                    connection,
                    DesignDashboardSp.Actions.GetDesignThumbnails,
                    CommandTimeoutSeconds);

                AdoNetHelper.AddIntIdListParameter(command, "@DesignIds", batch);

                await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
                await using var reader = await command.ExecuteReaderAsync(
                    CommandBehavior.SequentialAccess,
                    cancellationToken).ConfigureAwait(false);

                while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
                {
                    var designId = reader.GetInt32(0);
                    if (reader.IsDBNull(1))
                    {
                        continue;
                    }

                    var bytes = (byte[])reader[1];
                    result[designId] = ImageHelper.ToBase64DataUrl(bytes);
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
