using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

[ApiController]
[Route("api/product")]
[Produces("application/json")]
public sealed class ProductController(IProductService productService) : ControllerBase
{
    /// <summary>
    /// Returns active products. Optional filters: designId, accountId (Product_Account).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int? designId,
        [FromQuery] int? accountId,
        CancellationToken cancellationToken)
    {
        var products = await productService.GetProductsAsync(designId, accountId, cancellationToken);
        return Ok(products);
    }

    /// <summary>
    /// Returns a single product by id.
    /// </summary>
    [HttpGet("{productId:int}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetProductById(
        int productId,
        [FromQuery] int? accountId,
        CancellationToken cancellationToken)
    {
        var product = await productService.GetProductByIdAsync(productId, accountId, cancellationToken);
        if (product is null)
        {
            return NotFound(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status404NotFound,
                Message = $"Product {productId} was not found."
            });
        }

        return Ok(product);
    }
}
