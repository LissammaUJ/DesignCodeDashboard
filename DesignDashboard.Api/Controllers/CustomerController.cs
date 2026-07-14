using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

[ApiController]
[Route("api/customer")]
[Produces("application/json")]
public sealed class CustomerController(ICustomerService customerService) : ControllerBase
{
    /// <summary>
    /// Returns active customers ordered by account name.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetCustomers(CancellationToken cancellationToken)
    {
        var customers = await customerService.GetActiveCustomersAsync(cancellationToken);
        return Ok(customers);
    }
}
