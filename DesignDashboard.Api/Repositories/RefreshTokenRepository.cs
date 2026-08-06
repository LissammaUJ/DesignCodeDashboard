using System.Data;
using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

public sealed class RefreshTokenRepository(
    ISqlConnectionFactory connectionFactory,
    ILogger<RefreshTokenRepository> logger) : IRefreshTokenRepository
{
    public async Task InsertAsync(RefreshToken token, CancellationToken cancellationToken = default)
    {
        const string sql = """
            INSERT INTO dbo.AuthRefreshToken
            (
                TokenHash, EmplId, EmplCode, EmplName, IsAdmin, CoId, CoName,
                CreatedAtUtc, ExpiresAtUtc, CreatedByIp
            )
            VALUES
            (
                @TokenHash, @EmplId, @EmplCode, @EmplName, @IsAdmin, @CoId, @CoName,
                @CreatedAtUtc, @ExpiresAtUtc, @CreatedByIp
            );
            """;

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = new SqlCommand(sql, connection) { CommandType = CommandType.Text };
        AddCommonParams(command, token);

        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);

        logger.LogInformation(
            "[RefreshToken] Inserted for EmplId={EmplId} CoId={CoId} ExpiresUtc={Expires:o}",
            token.EmplId,
            token.CoId,
            token.ExpiresAtUtc);
    }

    public async Task<RefreshToken?> FindByHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT TOP (1)
                Id, TokenHash, EmplId, EmplCode, EmplName, IsAdmin, CoId, CoName,
                CreatedAtUtc, ExpiresAtUtc, RevokedAtUtc, ReplacedByHash, CreatedByIp
            FROM dbo.AuthRefreshToken
            WHERE TokenHash = @TokenHash;
            """;

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = new SqlCommand(sql, connection) { CommandType = CommandType.Text };
        command.Parameters.Add("@TokenHash", SqlDbType.Char, 64).Value = tokenHash;

        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            return null;
        }

        return Map(reader);
    }

    public async Task RevokeAsync(string tokenHash, string? replacedByHash, CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE dbo.AuthRefreshToken
            SET RevokedAtUtc = SYSUTCDATETIME(),
                ReplacedByHash = @ReplacedByHash
            WHERE TokenHash = @TokenHash
              AND RevokedAtUtc IS NULL;
            """;

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = new SqlCommand(sql, connection) { CommandType = CommandType.Text };
        command.Parameters.Add("@TokenHash", SqlDbType.Char, 64).Value = tokenHash;
        command.Parameters.Add("@ReplacedByHash", SqlDbType.Char, 64).Value =
            (object?)replacedByHash ?? DBNull.Value;

        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task RevokeAllForEmployeeAsync(short emplId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE dbo.AuthRefreshToken
            SET RevokedAtUtc = SYSUTCDATETIME()
            WHERE EmplId = @EmplId
              AND RevokedAtUtc IS NULL;
            """;

        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = new SqlCommand(sql, connection) { CommandType = CommandType.Text };
        command.Parameters.Add("@EmplId", SqlDbType.SmallInt).Value = emplId;

        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        var rows = await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
        logger.LogInformation("[RefreshToken] Revoked {Count} active tokens for EmplId={EmplId}", rows, emplId);
    }

    private static void AddCommonParams(SqlCommand command, RefreshToken token)
    {
        command.Parameters.Add("@TokenHash", SqlDbType.Char, 64).Value = token.TokenHash;
        command.Parameters.Add("@EmplId", SqlDbType.SmallInt).Value = token.EmplId;
        command.Parameters.Add("@EmplCode", SqlDbType.VarChar, 10).Value = token.EmplCode;
        command.Parameters.Add("@EmplName", SqlDbType.NVarChar, 100).Value =
            (object?)token.EmplName ?? DBNull.Value;
        command.Parameters.Add("@IsAdmin", SqlDbType.Bit).Value = token.IsAdmin;
        command.Parameters.Add("@CoId", SqlDbType.TinyInt).Value = token.CoId;
        command.Parameters.Add("@CoName", SqlDbType.NVarChar, 100).Value =
            (object?)token.CoName ?? DBNull.Value;
        command.Parameters.Add("@CreatedAtUtc", SqlDbType.DateTime2).Value = token.CreatedAtUtc;
        command.Parameters.Add("@ExpiresAtUtc", SqlDbType.DateTime2).Value = token.ExpiresAtUtc;
        command.Parameters.Add("@CreatedByIp", SqlDbType.NVarChar, 64).Value =
            (object?)token.CreatedByIp ?? DBNull.Value;
    }

    private static RefreshToken Map(SqlDataReader reader) => new()
    {
        Id = reader.GetInt64(reader.GetOrdinal("Id")),
        TokenHash = reader.GetString(reader.GetOrdinal("TokenHash")),
        EmplId = reader.GetInt16(reader.GetOrdinal("EmplId")),
        EmplCode = reader.GetString(reader.GetOrdinal("EmplCode")),
        EmplName = reader.IsDBNull(reader.GetOrdinal("EmplName"))
            ? null
            : reader.GetString(reader.GetOrdinal("EmplName")),
        IsAdmin = reader.GetBoolean(reader.GetOrdinal("IsAdmin")),
        CoId = reader.GetByte(reader.GetOrdinal("CoId")),
        CoName = reader.IsDBNull(reader.GetOrdinal("CoName"))
            ? null
            : reader.GetString(reader.GetOrdinal("CoName")),
        CreatedAtUtc = reader.GetDateTime(reader.GetOrdinal("CreatedAtUtc")),
        ExpiresAtUtc = reader.GetDateTime(reader.GetOrdinal("ExpiresAtUtc")),
        RevokedAtUtc = reader.IsDBNull(reader.GetOrdinal("RevokedAtUtc"))
            ? null
            : reader.GetDateTime(reader.GetOrdinal("RevokedAtUtc")),
        ReplacedByHash = reader.IsDBNull(reader.GetOrdinal("ReplacedByHash"))
            ? null
            : reader.GetString(reader.GetOrdinal("ReplacedByHash")),
        CreatedByIp = reader.IsDBNull(reader.GetOrdinal("CreatedByIp"))
            ? null
            : reader.GetString(reader.GetOrdinal("CreatedByIp")),
    };
}
