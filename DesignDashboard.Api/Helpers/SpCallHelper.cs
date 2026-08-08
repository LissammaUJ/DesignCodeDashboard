using System.Data;
using System.Diagnostics;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Thin Dapper executor for dbo.Usp_DesignDashboard_New — Action + params + timed logging only.
/// </summary>
internal static class SpCallHelper
{
    public static DynamicParameters Params(string action)
    {
        var p = new DynamicParameters();
        p.Add("@Action", action, DbType.String, size: 50);
        return p;
    }

    public static void AddInt(DynamicParameters p, string name, int value) =>
        p.Add(name, value, DbType.Int32);

    public static void AddDateTime(DynamicParameters p, string name, DateTime value) =>
        p.Add(name, value, DbType.DateTime);

    public static void AddOptionalInt(DynamicParameters p, string name, int? value)
    {
        if (value is > 0)
        {
            p.Add(name, value.Value, DbType.Int32);
        }
    }

    public static void AddOptionalDateTime(DynamicParameters p, string name, DateTime? value)
    {
        if (value.HasValue)
        {
            p.Add(name, value.Value, DbType.DateTime);
        }
    }

    public static async Task<IReadOnlyList<T>> QueryAsync<T>(
        SqlConnection connection,
        ILogger logger,
        string action,
        DynamicParameters parameters,
        int? incomingId,
        int? productId,
        int? designId,
        CancellationToken cancellationToken,
        int commandTimeout = 30)
    {
        var sw = Stopwatch.StartNew();
        var rows = (await connection.QueryAsync<T>(
                new CommandDefinition(
                    DesignDashboardSp.Name,
                    parameters,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: commandTimeout,
                    cancellationToken: cancellationToken))
            .ConfigureAwait(false)).ToList();
        sw.Stop();

        logger.LogInformation(
            "[SP] Action={Action} IncomingId={IncomingId} ProductId={ProductId} DesignId={DesignId} Rows={Rows} ElapsedMs={ElapsedMs}",
            action,
            incomingId,
            productId,
            designId,
            rows.Count,
            sw.ElapsedMilliseconds);

        return rows;
    }

    public static async Task<T?> QueryFirstOrDefaultAsync<T>(
        SqlConnection connection,
        ILogger logger,
        string action,
        DynamicParameters parameters,
        int? incomingId,
        int? productId,
        int? designId,
        CancellationToken cancellationToken,
        int commandTimeout = 30)
    {
        var rows = await QueryAsync<T>(
                connection,
                logger,
                action,
                parameters,
                incomingId,
                productId,
                designId,
                cancellationToken,
                commandTimeout)
            .ConfigureAwait(false);

        return rows.Count == 0 ? default : rows[0];
    }
}
