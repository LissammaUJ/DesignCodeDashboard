using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

/// <summary>
/// Separate read-only endpoints for design detail tabs (Production / Inventory / Activity Timeline).
/// </summary>
[ApiController]
[Route("api/designs/{designId:int}")]
[Produces("application/json")]
public sealed class DesignTabsController(IDesignService designService) : ControllerBase
{
    /// <summary>Production summary for a design from SQL Server (ProdSlip / Bo).</summary>
    [HttpGet("production")]
    [ProducesResponseType(typeof(DesignProductionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProduction(int designId, CancellationToken cancellationToken)
    {
        var result = await designService.GetProductionByDesignIdAsync(designId, cancellationToken);
        return Ok(result);
    }

    /// <summary>Inventory summary for a design from SQL Server (StockDet) when available.</summary>
    [HttpGet("inventory")]
    [ProducesResponseType(typeof(DesignInventoryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInventory(int designId, CancellationToken cancellationToken)
    {
        var result = await designService.GetInventoryByDesignIdAsync(designId, cancellationToken);
        return Ok(result);
    }

    /// <summary>Activity timeline for a design from SQL Server (production slips / stock log).</summary>
    [HttpGet("activity-timeline")]
    [ProducesResponseType(typeof(IReadOnlyList<DesignActivityItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActivityTimeline(int designId, CancellationToken cancellationToken)
    {
        var result = await designService.GetActivityTimelineByDesignIdAsync(designId, cancellationToken);
        return Ok(result);
    }
}
