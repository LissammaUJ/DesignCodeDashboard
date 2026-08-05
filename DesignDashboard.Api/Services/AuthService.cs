using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;

namespace DesignDashboard.Api.Services;

public sealed class AuthService(
    IAuthRepository authRepository,
    IJwtService jwtService,
    ILogger<AuthService> logger) : IAuthService
{
    private const string NoPermissionMessage = "You do not have permission to access this company.";

    public Task<IReadOnlyList<CompanyDto>> GetCompaniesAsync(CancellationToken cancellationToken = default)
        => authRepository.GetCompaniesAsync(cancellationToken);

    public async Task<AuthAttemptResult> AuthenticateAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var emplCode = request.ResolvedEmplCode;
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
            logger.LogWarning(
                "[Auth] Company permission denied EmplCode={EmplCode} EmplId={EmplId} CoId={CoId}",
                employee.EmplCode,
                employee.EmplId,
                companyId);
            return AuthAttemptResult.FailPermission(NoPermissionMessage);
        }

        return AuthAttemptResult.Success(BuildSuccessResponse(employee, company, "Login successful"));
    }

    public async Task<AuthAttemptResult> ChangeCompanyAsync(
        JwtUserIdentity user,
        ChangeCompanyRequestDto request,
        CancellationToken cancellationToken = default)
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

        logger.LogInformation(
            "[Auth] Company changed EmplCode={EmplCode} CoId={CoId}",
            employee.EmplCode,
            company.CoId);

        return AuthAttemptResult.Success(BuildSuccessResponse(employee, company, "Company changed successfully"));
    }

    private async Task<bool> HasCompanyPermissionAsync(
        EmployeeLoginDto employee,
        byte companyId,
        CancellationToken cancellationToken)
    {
        // Official ERP check: Usp_LoggedInEmployee @Mode = 2
        var accessCount = await authRepository
            .CheckCompanyAccessAsync(employee.EmplId, companyId, cancellationToken)
            .ConfigureAwait(false);

        if (accessCount > 0)
        {
            return true;
        }

        // Fallback when Company.ProgId is null: any dashboard/menu rights for that company.
        return await authRepository
            .HasDashboardPermissionAsync(employee.EmplId, companyId, employee.Admin, cancellationToken)
            .ConfigureAwait(false);
    }

    private LoginResponseDto BuildSuccessResponse(EmployeeLoginDto employee, CompanyDto company, string message)
    {
        var token = jwtService.GenerateToken(employee, company);
        return new LoginResponseDto
        {
            Status = true,
            Message = message,
            Employee = employee,
            Company = company,
            AccessToken = token,
            TokenType = "Bearer",
            ExpiresInSeconds = jwtService.ExpiryMinutes * 60,
            Username = employee.EmplCode,
        };
    }
}
