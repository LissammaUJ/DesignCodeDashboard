using DesignDashboard.Api.DTOs;

namespace DesignDashboard.Api.Interfaces;

/// <summary>
/// Authentication abstraction — currently hardcoded credentials.
/// Swap the implementation for database / Identity later without changing JWT issuance.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Validates credentials and returns a JWT when successful; otherwise null.
    /// </summary>
    LoginResponseDto? Authenticate(LoginRequestDto request);
}

/// <summary>Issues signed JWT access tokens (HMAC SHA-256).</summary>
public interface IJwtService
{
    string GenerateToken(string username);
    int ExpiryMinutes { get; }
}
