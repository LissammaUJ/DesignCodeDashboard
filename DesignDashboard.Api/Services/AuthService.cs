using System.Security.Cryptography;
using System.Text;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;

namespace DesignDashboard.Api.Services;

/// <summary>
/// Temporary hardcoded credential check (no database).
/// Replace this class later with a repository-backed implementation; keep <see cref="IJwtService"/> unchanged.
/// </summary>
public sealed class AuthService(IJwtService jwtService, ILogger<AuthService> logger) : IAuthService
{
    // Demo guest account — move to configuration or DB when hardening for production.
    private const string DemoUsername = "GUEST";
    private const string DemoPassword = "Car#2026";

    public LoginResponseDto? Authenticate(LoginRequestDto request)
    {
        var username = request.Username?.Trim() ?? string.Empty;
        var password = request.Password ?? string.Empty;

        if (!IsValidDemoCredential(username, password))
        {
            // Do not log passwords. Username only for audit of failed attempts.
            logger.LogWarning("Login failed for username={Username}", username);
            return null;
        }

        logger.LogInformation("[Auth] Credentials accepted for username={Username} — issuing JWT", DemoUsername);
        var token = jwtService.GenerateToken(DemoUsername);
        logger.LogInformation("[Auth] Login succeeded for username={Username}", DemoUsername);

        return new LoginResponseDto
        {
            AccessToken = token,
            TokenType = "Bearer",
            ExpiresInSeconds = jwtService.ExpiryMinutes * 60,
            Username = DemoUsername,
        };
    }

    /// <summary>Fixed-time comparison to reduce trivial timing leaks on the demo password.</summary>
    private static bool IsValidDemoCredential(string username, string password)
    {
        var userOk = FixedTimeEquals(
            Encoding.UTF8.GetBytes(username.ToUpperInvariant()),
            Encoding.UTF8.GetBytes(DemoUsername.ToUpperInvariant()));

        var passOk = FixedTimeEquals(
            Encoding.UTF8.GetBytes(password),
            Encoding.UTF8.GetBytes(DemoPassword));

        return userOk && passOk;
    }

    private static bool FixedTimeEquals(byte[] a, byte[] b)
    {
        if (a.Length != b.Length)
        {
            // Still run a comparison to keep timing closer when lengths differ.
            return CryptographicOperations.FixedTimeEquals(a, a) && false;
        }

        return CryptographicOperations.FixedTimeEquals(a, b);
    }
}
