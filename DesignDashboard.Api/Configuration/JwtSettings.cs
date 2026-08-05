namespace DesignDashboard.Api.Configuration;

/// <summary>
/// JWT options bound from appsettings.json "Jwt" section.
/// Keep secrets out of source control in production (User Secrets / Key Vault).
/// </summary>
public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    /// <summary>HMAC signing key (min 32 characters for HS256).</summary>
    public string Key { get; set; } = string.Empty;

    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    /// <summary>Token lifetime in minutes (default 60).</summary>
    public int ExpiryMinutes { get; set; } = 60;
}
