using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

/// <summary>
/// Public authentication endpoints. Login is anonymous; all other APIs require JWT.
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public sealed class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    /// <summary>
    /// Validates credentials and returns a JWT access token (HMAC SHA-256, 1 hour by default).
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public ActionResult<LoginResponseDto> Login([FromBody] LoginRequestDto? request)
    {
        logger.LogInformation(
            "[Auth] Login request from {RemoteIp} | Username={Username}",
            HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            request?.Username?.Trim() ?? "(null)");

        if (request is null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            logger.LogWarning("[Auth] Login rejected — missing username/password");
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Username and password are required.",
            });
        }

        var result = authService.Authenticate(request);
        if (result is null)
        {
            logger.LogWarning(
                "[Auth] Login unauthorized for Username={Username}",
                request.Username.Trim());
            return Unauthorized(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Message = "Invalid username or password.",
            });
        }

        logger.LogInformation(
            "[Auth] Login success for Username={Username} | ExpiresInSeconds={ExpiresIn}",
            result.Username,
            result.ExpiresInSeconds);

        return Ok(result);
    }
}
