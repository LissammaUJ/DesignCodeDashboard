using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;

namespace DesignDashboard.Api.Services;

public sealed class ProductService(IProductRepository repository) : IProductService
{
    public Task<IReadOnlyList<ProductDto>> GetProductsAsync(
        int? designId = null,
        int? accountId = null,
        CancellationToken cancellationToken = default)
        => repository.GetProductsAsync(designId, accountId, cancellationToken);

    public Task<ProductDto?> GetProductByIdAsync(
        int productId,
        int? accountId = null,
        CancellationToken cancellationToken = default)
    {
        if (productId <= 0)
        {
            throw new ArgumentException("productId must be greater than zero.", nameof(productId));
        }

        return repository.GetProductByIdAsync(productId, accountId, cancellationToken);
    }
}
