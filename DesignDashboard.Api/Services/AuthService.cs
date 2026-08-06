using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;

namespace DesignDashboard.Api.Services;

public sealed class AuthService(
    IAuthRepository authRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IJwtService jwtService,
    ILogger<AuthService> logger) : IAuthService
{
    private const string NoPermissionMessage = "You do not have permission to access this company.";

    public Task<IReadOnlyList<CompanyDto>> GetCompaniesAsync(CancellationToken cancellationToken = default)
        => authRepository.GetCompaniesAsync(cancellationToken);

    public async Task<AuthAttemptResult> AuthenticateAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default,
        string? clientIp = null)
    {
        var emplCode = request.ResolvedEmplCode;

        logger.LogInformation(
            "Login request: EmplCode={EmplCode}, CompanyId={CompanyId}, PasswordLength={PasswordLength}",
            emplCode,
            request.CompanyId,
            request.Password?.Length ?? 0);

        if (string.IsNullOrWhiteSpace(emplCode) || string.IsNullOrWhiteSpace(request.Password))
        {
            return AuthAttemptResult.FailCredentials();
        }

        if (request.CompanyId is < 1 or > 255)
        {
            return AuthAttemptResult.FailCredentials();
        }

        var encryptedPassword = PasswordHasher.HashSha256Hex(request.Password);
        var companyId = (byte)request.CompanyId;

        EmployeeLoginDto? employee;
        try
        {
            employee = await authRepository
                .LoginCheckAsync(emplCode, encryptedPassword, companyId, cancellationToken)
                .ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[Auth] Usp_LoginCheck failed for EmplCode={EmplCode}", emplCode);
            throw;
        }

        logger.LogInformation("Stored procedure result count = {Count}", employee is null ? 0 : 1);

        if (employee is null)
        {
            return AuthAttemptResult.FailCredentials();
        }

        var company = new CompanyDto
        {
            CoId = request.CompanyId,
            CoName = request.CompanyName?.Trim() ?? string.Empty,
        };

        var hasAccess = await HasCompanyPermissionAsync(employee, companyId, cancellationToken)
            .ConfigureAwait(false);

        if (!hasAccess)
        {
            return AuthAttemptResult.FailPermission(NoPermissionMessage);
        }

        // New login session: revoke prior refresh tokens for this employee.
        await refreshTokenRepository
            .RevokeAllForEmployeeAsync(employee.EmplId, cancellationToken)
            .ConfigureAwait(false);

        var response = await IssueTokensAsync(employee, company, "Login successful", clientIp, cancellationToken)
            .ConfigureAwait(false);

        logger.LogInformation(
            "JWT generated successfully for user {User} CoId={CoId}",
            employee.EmplCode,
            company.CoId);

        return AuthAttemptResult.Success(response);
    }

    public async Task<AuthAttemptResult> ChangeCompanyAsync(
        JwtUserIdentity user,
        ChangeCompanyRequestDto request,
        CancellationToken cancellationToken = default,
        string? clientIp = null)
    {
        if (user.EmplId <= 0 || string.IsNullOrWhiteSpace(user.EmplCode))
        {
            return AuthAttemptResult.FailCredentials("Session is invalid. Please sign in again.");
        }

        if (request.CompanyId is < 1 or > 255)
        {
            return AuthAttemptResult.FailPermission(NoPermissionMessage);
        }

        var companyId = (byte)request.CompanyId;
        var employee = new EmployeeLoginDto
        {
            EmplId = user.EmplId,
            EmplCode = user.EmplCode,
            EmplName = user.EmplName,
            Admin = user.Admin,
        };

        var hasAccess = await HasCompanyPermissionAsync(employee, companyId, cancellationToken)
            .ConfigureAwait(false);

        if (!hasAccess)
        {
            return AuthAttemptResult.FailPermission(NoPermissionMessage);
        }

        var company = new CompanyDto
        {
            CoId = request.CompanyId,
            CoName = request.CompanyName?.Trim() ?? string.Empty,
        };

        if (string.IsNullOrWhiteSpace(company.CoName))
        {
            var companies = await authRepository.GetCompaniesAsync(cancellationToken).ConfigureAwait(false);
            company.CoName = companies.FirstOrDefault(c => c.CoId == company.CoId)?.CoName ?? string.Empty;
        }

        await refreshTokenRepository
            .RevokeAllForEmployeeAsync(employee.EmplId, cancellationToken)
            .ConfigureAwait(false);

        var response = await IssueTokensAsync(employee, company, "Company changed successfully", clientIp, cancellationToken)
            .ConfigureAwait(false);

        return AuthAttemptResult.Success(response);
    }

    public async Task<AuthAttemptResult> RefreshAsync(
        RefreshTokenRequestDto request,
        CancellationToken cancellationToken = default,
        string? clientIp = null)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return AuthAttemptResult.FailCredentials("Refresh token is required.");
        }

        var hash = RefreshTokenFactory.HashToken(request.RefreshToken.Trim());
        var existing = await refreshTokenRepository
            .FindByHashAsync(hash, cancellationToken)
            .ConfigureAwait(false);

        if (existing is null || !existing.IsActive)
        {
            logger.LogWarning("[Auth] Refresh rejected — token missing/expired/revoked");
            return AuthAttemptResult.FailCredentials("Invalid or expired refresh token.");
        }

        var employee = new EmployeeLoginDto
        {
            EmplId = existing.EmplId,
            EmplCode = existing.EmplCode,
            EmplName = existing.EmplName ?? string.Empty,
            Admin = existing.IsAdmin,
        };

        var company = new CompanyDto
        {
            CoId = existing.CoId,
            CoName = existing.CoName ?? string.Empty,
        };

        var opaque = RefreshTokenFactory.CreateOpaqueToken();
        var newHash = RefreshTokenFactory.HashToken(opaque);
        var now = DateTime.UtcNow;
        var refreshExpires = now.AddDays(jwtService.RefreshTokenExpiryDays);

        await refreshTokenRepository
            .RevokeAsync(hash, newHash, cancellationToken)
            .ConfigureAwait(false);

        await refreshTokenRepository
            .InsertAsync(
                new RefreshToken
                {
                    TokenHash = newHash,
                    EmplId = employee.EmplId,
                    EmplCode = employee.EmplCode,
                    EmplName = employee.EmplName,
                    IsAdmin = employee.Admin,
                    CoId = (byte)company.CoId,
                    CoName = company.CoName,
                    CreatedAtUtc = now,
                    ExpiresAtUtc = refreshExpires,
                    CreatedByIp = clientIp,
                },
                cancellationToken)
            .ConfigureAwait(false);

        var accessToken = jwtService.GenerateToken(employee, company);
        logger.LogInformation(
            "[Auth] Refresh succeeded for EmplCode={EmplCode} CoId={CoId}",
            employee.EmplCode,
            company.CoId);

        return AuthAttemptResult.Success(new LoginResponseDto
        {
            Status = true,
            Message = "Token refreshed",
            Employee = employee,
            Company = company,
            AccessToken = accessToken,
            RefreshToken = opaque,
            TokenType = "Bearer",
            ExpiresInSeconds = jwtService.ExpiryMinutes * 60,
            RefreshExpiresInSeconds = (int)(refreshExpires - now).TotalSeconds,
            Username = employee.EmplCode,
        });
    }

    private async Task<bool> HasCompanyPermissionAsync(
        EmployeeLoginDto employee,
        byte companyId,
        CancellationToken cancellationToken)
    {
        var accessCount = await authRepository
            .CheckCompanyAccessAsync(employee.EmplId, companyId, cancellationToken)
            .ConfigureAwait(false);

        if (accessCount > 0)
        {
            return true;
        }

        return await authRepository
            .HasDashboardPermissionAsync(employee.EmplId, companyId, employee.Admin, cancellationToken)
            .ConfigureAwait(false);
    }

    private async Task<LoginResponseDto> IssueTokensAsync(
        EmployeeLoginDto employee,
        CompanyDto company,
        string message,
        string? clientIp,
        CancellationToken cancellationToken)
    {
        var accessToken = jwtService.GenerateToken(employee, company);
        var opaque = RefreshTokenFactory.CreateOpaqueToken();
        var hash = RefreshTokenFactory.HashToken(opaque);
        var now = DateTime.UtcNow;
        var refreshExpires = now.AddDays(jwtService.RefreshTokenExpiryDays);

        await refreshTokenRepository
            .InsertAsync(
                new RefreshToken
                {
                    TokenHash = hash,
                    EmplId = employee.EmplId,
                    EmplCode = employee.EmplCode,
                    EmplName = employee.EmplName,
                    IsAdmin = employee.Admin,
                    CoId = (byte)Math.Clamp(company.CoId, 0, 255),
                    CoName = company.CoName,
                    CreatedAtUtc = now,
                    ExpiresAtUtc = refreshExpires,
                    CreatedByIp = clientIp,
                },
                cancellationToken)
            .ConfigureAwait(false);

        return new LoginResponseDto
        {
            Status = true,
            Message = message,
            Employee = employee,
            Company = company,
            AccessToken = accessToken,
            RefreshToken = opaque,
            TokenType = "Bearer",
            ExpiresInSeconds = jwtService.ExpiryMinutes * 60,
            RefreshExpiresInSeconds = (int)(refreshExpires - now).TotalSeconds,
            Username = employee.EmplCode,
        };
    }
}
