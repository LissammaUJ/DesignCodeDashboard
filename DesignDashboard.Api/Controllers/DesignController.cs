using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

[ApiController]
[Route("api/design")]
[Produces("application/json")]
public sealed class DesignController(IDesignService designService) : ControllerBase
{
    /// <summary>
    /// Returns design details including products and account information.
    /// Optional sales filter: accountId / customerAccountId, startDate, endDate.
    /// </summary>
    [HttpGet("{designId:int}")]
    [ProducesResponseType(typeof(DesignDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetDesignById(
        int designId,
        [FromQuery] int? accountId,
        [FromQuery] int? customerAccountId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken)
    {
        var design = await designService.GetDesignByIdAsync(
            designId,
            accountId ?? customerAccountId,
            startDate,
            endDate,
            cancellationToken);

        if (design is null)
        {
            return NotFound(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status404NotFound,
                Message = $"Design {designId} was not found."
            });
        }

        return Ok(design);
    }
}
