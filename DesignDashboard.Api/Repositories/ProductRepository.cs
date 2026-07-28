using System.Data;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Products — dbo.usp_DesignDashboard only.
/// </summary>
public sealed class ProductRepository(ISqlConnectionFactory connectionFactory) : IProductRepository
{
    public async Task<IReadOnlyList<ProductDto>> GetProductsAsync(
        int? designId = null,
        int? accountId = null,
        CancellationToken cancellationToken = default)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetProducts, commandTimeout: 60);

        DesignDashboardSp.AddOptionalInt(command, "@DesignId", designId);
        DesignDashboardSp.AddOptionalInt(command, "@AccountId", accountId);

        var list = new List<ProductDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            list.Add(MapProduct(reader));
        }

        return list;
    }

    public async Task<ProductDto?> GetProductByIdAsync(
        int productId,
        int? accountId = null,
        CancellationToken cancellationToken = default)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        await using var command = DesignDashboardSp.Create(
            connection, DesignDashboardSp.Actions.GetProductById, commandTimeout: 60);

        DesignDashboardSp.AddOptionalInt(command, "@ProductId", productId);
        DesignDashboardSp.AddOptionalInt(command, "@AccountId", accountId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            return null;
        }

        return MapProduct(reader);
    }

    private static ProductDto MapProduct(SqlDataReader reader) => new()
    {
        ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
        ProductName = GetString(reader, "ProductName"),
        DesignId = GetNullableInt(reader, "DesignId"),
        BarCode = GetStringOrNull(reader, "BarCode"),
        NetWt = GetNullableDecimal(reader, "NetWt"),
        Composition = GetStringOrNull(reader, "Composition"),
        Active = GetBool(reader, "Active"),
        AcSpecCode = GetStringOrNull(reader, "AcSpecCode"),
        AcSpecName = GetStringOrNull(reader, "AcSpecName"),
        Rate = GetNullableDecimal(reader, "Rate")
    };

    private static string GetString(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        return reader.IsDBNull(ord) ? string.Empty : reader.GetString(ord).Trim();
    }

    private static string? GetStringOrNull(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        return reader.IsDBNull(ord) ? null : reader.GetString(ord);
    }

    private static int? GetNullableInt(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        return reader.IsDBNull(ord) ? null : reader.GetInt32(ord);
    }

    private static decimal? GetNullableDecimal(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        return reader.IsDBNull(ord) ? null : reader.GetDecimal(ord);
    }

    private static bool GetBool(SqlDataReader reader, string column)
    {
        var ord = reader.GetOrdinal(column);
        if (reader.IsDBNull(ord))
        {
            return false;
        }

        var value = reader.GetValue(ord);
        return value switch
        {
            bool b => b,
            byte by => by == 1,
            _ => Convert.ToBoolean(value)
        };
    }
}
