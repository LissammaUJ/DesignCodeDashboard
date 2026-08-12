using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public sealed class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("login")]
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
            logger.LogWarning(
                "[Auth] BadRequest — EmplCode empty={EmplEmpty} Password empty={PwdEmpty} CompanyId={CompanyId}",
                string.IsNullOrWhiteSpace(request?.ResolvedEmplCode),
                string.IsNullOrWhiteSpace(request?.Password),
                request?.CompanyId);

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
            logger.LogWarning("[Auth] 403 Forbidden — {Message}", result.Message);
            return StatusCode(StatusCodes.Status403Forbidden, new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status403Forbidden,
                Message = result.Message,
            });
        }

        if (result.InvalidCredentials || result.Response is null)
        {
            logger.LogWarning("[Auth] 401 Unauthorized — {Message}", result.Message);
            return Unauthorized(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Message = result.Message,
            });
        }

        logger.LogInformation(
            "[Auth] 200 OK — EmplCode={EmplCode} CoId={CoId}",
            result.Response.Username,
            result.Response.Company?.CoId);

        return Ok(result.Response);
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponseDto>> Refresh(
        [FromBody] RefreshTokenRequestDto? request,
        CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Refresh token is required.",
            });
        }

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await authService
            .RefreshAsync(request, cancellationToken, clientIp)
            .ConfigureAwait(false);

        if (result.InvalidCredentials || result.Response is null)
        {
            logger.LogWarning("[Auth] Refresh 401 — {Message}", result.Message);
            return Unauthorized(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Message = result.Message,
            });
        }

        return Ok(result.Response);
    }
}