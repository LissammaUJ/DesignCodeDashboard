using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

[ApiController]
[Route("api/designs")]
[Produces("application/json")]
public sealed class DesignsController(IDesignService designService) : ControllerBase
{
    /// <summary>
    /// Returns customer-wise design sales for the given filter.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<DesignListItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetDesigns(
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

        var designs = await designService.GetDesignsAsync(filter, cancellationToken);
        return Ok(designs);
    }
}
