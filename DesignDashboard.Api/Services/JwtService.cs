using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DesignDashboard.Api.Configuration;
using DesignDashboard.Api.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DesignDashboard.Api.Services;

/// <summary>
/// Issues HMAC SHA-256 JWT access tokens.
/// Credential validation lives in <see cref="AuthService"/> so DB auth can replace it later.
/// </summary>
public sealed class JwtService(IOptions<JwtSettings> options, ILogger<JwtService> logger) : IJwtService
{
    private readonly JwtSettings _settings = options.Value;

    public int ExpiryMinutes => Math.Max(1, _settings.ExpiryMinutes);

    public string GenerateToken(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            throw new ArgumentException("Username is required to issue a token.", nameof(username));
        }

        if (string.IsNullOrWhiteSpace(_settings.Key) || _settings.Key.Length < 32)
        {
            throw new InvalidOperationException(
                "Jwt:Key must be configured and at least 32 characters for HMAC SHA-256.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(ExpiryMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, username),
            new(ClaimTypes.Name, username),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
        };

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: credentials);

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        // Log metadata only — never log the full token in production logs if possible.
        logger.LogInformation(
            "[JWT] Token generated | User={Username} | Issuer={Issuer} | Audience={Audience} | ExpiresUtc={Expires:o} | Prefix={Prefix}…",
            username,
            _settings.Issuer,
            _settings.Audience,
            expires,
            jwt.Length > 16 ? jwt[..16] : jwt);

        return jwt;
    }
}
