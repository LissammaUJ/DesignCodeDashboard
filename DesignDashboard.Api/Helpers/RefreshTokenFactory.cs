using System.Security.Cryptography;

namespace DesignDashboard.Api.Helpers;

public static class RefreshTokenFactory
{
    /// <summary>Creates a cryptographically random opaque refresh token (base64url-ish).</summary>
    public static string CreateOpaqueToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    /// <summary>SHA-256 hex uppercase — stored in dbo.AuthRefreshToken.TokenHash.</summary>
    public static string HashToken(string opaqueToken) => PasswordHasher.HashSha256Hex(opaqueToken);
}
