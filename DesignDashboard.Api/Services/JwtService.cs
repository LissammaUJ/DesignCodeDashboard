using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DesignDashboard.Api.Configuration;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DesignDashboard.Api.Services;

public sealed class JwtService(IOptions<JwtSettings> options, ILogger<JwtService> logger) : IJwtService
{
    private readonly JwtSettings _settings = options.Value;

    public int ExpiryMinutes => Math.Max(1, _settings.ExpiryMinutes);

    public int RefreshTokenExpiryDays => Math.Max(1, _settings.RefreshTokenExpiryDays);

    public string GenerateToken(EmployeeLoginDto employee, CompanyDto company)
    {
        ArgumentNullException.ThrowIfNull(employee);
        ArgumentNullException.ThrowIfNull(company);

        if (string.IsNullOrWhiteSpace(employee.EmplCode))
        {
            throw new ArgumentException("Employee code is required to issue a token.", nameof(employee));
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
            new(JwtRegisteredClaimNames.Sub, employee.EmplCode),
            new(ClaimTypes.Name, employee.EmplCode),
            new(JwtRegisteredClaimNames.UniqueName, employee.EmplCode),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new("emplId", employee.EmplId.ToString()),
            new("emplName", employee.EmplName ?? string.Empty),
            new("admin", employee.Admin ? "1" : "0"),
            new("coId", company.CoId.ToString()),
            new("coName", company.CoName ?? string.Empty),
        };

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: credentials);

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        logger.LogInformation(
            "[JWT] Access token generated | User={Username} | EmplId={EmplId} | CoId={CoId} | ExpiresUtc={Expires:o}",
            employee.EmplCode,
            employee.EmplId,
            company.CoId,
            expires);

        return jwt;
    }
}
