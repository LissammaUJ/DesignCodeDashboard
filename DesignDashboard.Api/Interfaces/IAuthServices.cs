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

    Task<int> CheckCompanyAccessAsync(
        short emplId,
        byte companyId,
        CancellationToken cancellationToken = default);

    Task<bool> HasDashboardPermissionAsync(
        short emplId,
        byte companyId,
        bool isAdmin,
        CancellationToken cancellationToken = default);
}

public interface IAuthService
{
    Task<IReadOnlyList<CompanyDto>> GetCompaniesAsync(CancellationToken cancellationToken = default);

    Task<AuthAttemptResult> AuthenticateAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default,
        string? clientIp = null);

    Task<AuthAttemptResult> ChangeCompanyAsync(
        JwtUserIdentity user,
        ChangeCompanyRequestDto request,
        CancellationToken cancellationToken = default,
        string? clientIp = null);

    /// <summary>Rotates refresh token and issues a new access token.</summary>
    Task<AuthAttemptResult> RefreshAsync(
        RefreshTokenRequestDto request,
        CancellationToken cancellationToken = default,
        string? clientIp = null);
}

public interface IJwtService
{
    string GenerateToken(EmployeeLoginDto employee, CompanyDto company);
    int ExpiryMinutes { get; }
    int RefreshTokenExpiryDays { get; }
}
