using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

/// <summary>
/// Separate read-only endpoints for design detail tabs (Production / Inventory / Other Customers).
/// Route <c>designId</c> is ProductId (same convention as the rest of the detail APIs).
/// </summary>
[Authorize]
[ApiController]
[Route("api/designs/{designId:int}")]
[Produces("application/json")]
public sealed class DesignTabsController(IDesignService designService) : ControllerBase
{
    /// <summary>
    /// Production grid for a design (Date, Location, Produced Quantity, Required Quantity).
    /// </summary>
    [HttpGet("production")]
    [ProducesResponseType(typeof(IReadOnlyList<DesignProductionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProduction(int designId, CancellationToken cancellationToken)
    {
        var result = await designService.GetProductionByDesignIdAsync(designId, cancellationToken);
        return Ok(result);
    }

    /// <summary>Current stock for a design from StockDet (RecQty − IssQty).</summary>
    [HttpGet("inventory")]
    [ProducesResponseType(typeof(DesignInventoryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInventory(int designId, CancellationToken cancellationToken)
    {
        var result = await designService.GetInventoryByDesignIdAsync(designId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Other customers for this product (GetOtherCustomers) — excludes the selected account,
    /// filtered by the selected bill/order date range.
    /// </summary>
    [HttpGet("other-customers")]
    [ProducesResponseType(typeof(IReadOnlyList<AccountDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetOtherCustomers(
        int designId,
        [FromQuery] int? accountId,
        [FromQuery] int? customerAccountId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken)
    {
        var resolvedAccountId = accountId ?? customerAccountId ?? 0;
        if (resolvedAccountId <= 0 || !startDate.HasValue || !endDate.HasValue)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "accountId (or customerAccountId), startDate, and endDate are required."
            });
        }

        var result = await designService.GetOtherCustomersByProductIdAsync(
            designId,
            resolvedAccountId,
            startDate.Value,
            endDate.Value,
            cancellationToken);
        return Ok(result);
    }
}
