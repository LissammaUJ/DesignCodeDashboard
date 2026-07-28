using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

/// <summary>
/// Separate read-only endpoints for design detail tabs (Production / Inventory).
/// </summary>
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
}
