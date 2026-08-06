using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/login")]
[Produces("application/json")]
public sealed class LoginController(IAuthService authService, ILogger<LoginController> logger) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<LoginResponseDto>> Login(
        [FromBody] LoginRequestDto? request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Login request: EmplCode={EmplCode}, CompanyId={CompanyId}",
            request?.EmplCode ?? request?.Username ?? "(null)",
            request?.CompanyId);

        if (request is null
            || string.IsNullOrWhiteSpace(request.ResolvedEmplCode)
            || string.IsNullOrWhiteSpace(request.Password)
            || request.CompanyId <= 0)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Company, employee code, and password are required.",
            });
        }

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await authService
            .AuthenticateAsync(request, cancellationToken, clientIp)
            .ConfigureAwait(false);


        if (result.NoCompanyPermission)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status403Forbidden,
                Message = result.Message,
            });
        }

        if (result.InvalidCredentials || result.Response is null)
        {
            return Unauthorized(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Message = result.Message,
            });
        }

        return Ok(result.Response);
    }
}
