using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DesignDashboard.Api.Controllers;

[ApiController]
[Route("api/company")]
[Produces("application/json")]
public sealed class CompanyController(IAuthService authService, ILogger<CompanyController> logger) : ControllerBase
{
    /// <summary>GET /api/company/list — dbo.Usp_ComboBind @TableName='Company', @CoId=0</summary>
    [AllowAnonymous]
    [HttpGet("list")]
    [ProducesResponseType(typeof(IReadOnlyList<CompanyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CompanyDto>>> GetList(CancellationToken cancellationToken)
    {
        var companies = await authService.GetCompaniesAsync(cancellationToken).ConfigureAwait(false);
        return Ok(companies);
    }

    /// <summary>
    /// POST /api/company/change — switch company without logout; re-checks company permission via SP.
    /// </summary>
    [Authorize]
    [HttpPost("change")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<LoginResponseDto>> ChangeCompany(
        [FromBody] ChangeCompanyRequestDto? request,
        CancellationToken cancellationToken)
    {
        var user = JwtUserReader.TryRead(User);
        if (user is null || user.EmplId <= 0)
        {
            return Unauthorized(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Message = "Session is invalid. Please sign in again.",
            });
        }

        if (request is null || request.CompanyId <= 0)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Company is required.",
            });
        }

        logger.LogInformation(
            "[Company] Change requested EmplCode={EmplCode} CoId={CoId}",
            user.EmplCode,
            request.CompanyId);

        var result = await authService
            .ChangeCompanyAsync(user, request, cancellationToken)
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
