using DesignDashboard.Api.DTOs;

namespace DesignDashboard.Api.Interfaces;

public interface IAuthRepository
{
    Task<IReadOnlyList<CompanyDto>> GetCompaniesAsync(CancellationToken cancellationToken = default);

    Task<EmployeeLoginDto?> LoginCheckAsync(
        string emplCode,
        string encryptedPassword,
        byte companyId,
        CancellationToken cancellationToken = default);

    /// <summary>dbo.Usp_LoggedInEmployee @Mode = 2 — Check Right To Access Company.</summary>
    Task<int> CheckCompanyAccessAsync(
        short emplId,
        byte companyId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// dbo.Usp_GetDashboardPermission — fallback when Company.ProgId is null
    /// (any allowed program for EmplId + CoId means company access).
    /// </summary>
    Task<bool> HasDashboardPermissionAsync(
        short emplId,
        byte companyId,
        bool isAdmin,
        CancellationToken cancellationToken = default);
}

public interface IAuthService
{
    Task<IReadOnlyList<CompanyDto>> GetCompaniesAsync(CancellationToken cancellationToken = default);

    Task<AuthAttemptResult> AuthenticateAsync(LoginRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthAttemptResult> ChangeCompanyAsync(
        JwtUserIdentity user,
        ChangeCompanyRequestDto request,
        CancellationToken cancellationToken = default);
}

public interface IJwtService
{
    string GenerateToken(EmployeeLoginDto employee, CompanyDto company);
    int ExpiryMinutes { get; }
}
