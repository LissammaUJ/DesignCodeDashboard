using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/customer-sales")]
[Produces("application/json")]
public sealed class CustomerSalesController(
    ICustomerSalesService customerSalesService,
    ILogger<CustomerSalesController> logger) : ControllerBase
{
    /// <summary>
    /// Customer-wise design sales using the company-provided SQL query (read-only).
    /// Accepts accountId (preferred) or customerAccountId, plus startDate and endDate.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CustomerSalesDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetCustomerSales(
        [FromQuery] int? accountId,
        [FromQuery] int? customerAccountId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        CancellationToken cancellationToken)
    {
        var resolvedAccountId = accountId ?? customerAccountId ?? 0;

        logger.LogInformation(
            "GET /api/customer-sales AccountId={AccountId} StartDate={StartDate} EndDate={EndDate}",
            resolvedAccountId, startDate, endDate);

        var filter = new DesignFilterRequest
        {
            CustomerAccountId = resolvedAccountId,
            StartDate = startDate,
            EndDate = endDate
        };

        var sales = await customerSalesService.GetCustomerSalesAsync(filter, cancellationToken);
        return Ok(sales);
    }
}
