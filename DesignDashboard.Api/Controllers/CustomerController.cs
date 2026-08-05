using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/customer")]
[Produces("application/json")]
public sealed class CustomerController(ICustomerService customerService) : ControllerBase
{
    /// <summary>
    /// Returns active Customer (MasType 65) / Local Customer (MasType 95) accounts
    /// that have bills in the selected date range. Excludes Supplier/Courier and other types.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CustomerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken)
    {
        // Non-nullable DateTime binds missing query values to 0001-01-01, which then
        // triggered ArgumentException in CustomerService. Require explicit query dates.
        if (startDate is null || startDate.Value == default)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "startDate is required. Example: /api/customer?startDate=2025-01-01&endDate=2025-12-31"
            });
        }

        if (endDate is null || endDate.Value == default)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "endDate is required. Example: /api/customer?startDate=2025-01-01&endDate=2025-12-31"
            });
        }

        if (endDate.Value.Date < startDate.Value.Date)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "endDate cannot be less than startDate."
            });
        }

        var customers = await customerService.GetActiveCustomersAsync(
            startDate.Value,
            endDate.Value,
            cancellationToken);
        return Ok(customers);
    }
}
