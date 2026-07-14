using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Dapper;

namespace DesignDashboard.Api.Repositories;

public sealed class ProductRepository(ISqlConnectionFactory connectionFactory) : IProductRepository
{
    public async Task<IReadOnlyList<ProductDto>> GetProductsAsync(
        int? designId = null,
        int? accountId = null,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT TOP 500
                p.ProductId,
                p.ProductName,
                p.DesignId,
                p.BarCode,
                p.NetWt,
                p.Composition,
                CAST(CASE WHEN p.Active = 1 THEN 1 ELSE 0 END AS BIT) AS Active,
                pa.AcSpecCode,
                pa.AcSpecName,
                pa.Rate
            FROM Product p
            LEFT JOIN Product_Account pa
                   ON pa.ProductId = p.ProductId
                  AND (@AccountId IS NULL OR pa.AccountId = @AccountId)
            WHERE (@DesignId IS NULL OR p.DesignId = @DesignId)
              AND p.Active = 1
            ORDER BY p.ProductName;
            """;

        using var connection = connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<ProductDto>(
            new CommandDefinition(
                sql,
                new { DesignId = designId, AccountId = accountId },
                cancellationToken: cancellationToken));

        return [.. rows];
    }

    public async Task<ProductDto?> GetProductByIdAsync(
        int productId,
        int? accountId = null,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT TOP 1
                p.ProductId,
                p.ProductName,
                p.DesignId,
                p.BarCode,
                p.NetWt,
                p.Composition,
                CAST(CASE WHEN p.Active = 1 THEN 1 ELSE 0 END AS BIT) AS Active,
                pa.AcSpecCode,
                pa.AcSpecName,
                pa.Rate
            FROM Product p
            LEFT JOIN Product_Account pa
                   ON pa.ProductId = p.ProductId
                  AND (@AccountId IS NULL OR pa.AccountId = @AccountId)
            WHERE p.ProductId = @ProductId;
            """;

        using var connection = connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<ProductDto>(
            new CommandDefinition(
                sql,
                new { ProductId = productId, AccountId = accountId },
                cancellationToken: cancellationToken));
    }
}
