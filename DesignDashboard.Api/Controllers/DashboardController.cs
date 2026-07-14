using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Produces("application/json")]
public sealed class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    /// <summary>
    /// Returns dashboard KPI summary for the selected customer and date range.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetSummary(
        [FromQuery] int? accountId,
        [FromQuery] int? customerAccountId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        CancellationToken cancellationToken)
    {
        var filter = new DesignFilterRequest
        {
            CustomerAccountId = accountId ?? customerAccountId ?? 0,
            StartDate = startDate,
            EndDate = endDate
        };

        var summary = await dashboardService.GetSummaryAsync(filter, cancellationToken);
        return Ok(summary);
    }

    /// <summary>
    /// Returns dashboard chart series: sales trend, top customers, top categories.
    /// </summary>
    [HttpGet("charts")]
    [ProducesResponseType(typeof(DashboardChartsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetCharts(
        [FromQuery] int? accountId,
        [FromQuery] int? customerAccountId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        CancellationToken cancellationToken)
    {
        var filter = new DesignFilterRequest
        {
            CustomerAccountId = accountId ?? customerAccountId ?? 0,
            StartDate = startDate,
            EndDate = endDate
        };

        var charts = await dashboardService.GetChartsAsync(filter, cancellationToken);
        return Ok(charts);
    }
}
