namespace DesignDashboard.Api.Models;

/// <summary>Persisted refresh-token row (dbo.AuthRefreshToken). TokenHash is SHA-256 of the opaque token.</summary>
public sealed class RefreshToken
{
    public long Id { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public short EmplId { get; set; }
    public string EmplCode { get; set; } = string.Empty;
    public string? EmplName { get; set; }
    public bool IsAdmin { get; set; }
    public byte CoId { get; set; }
    public string? CoName { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public string? ReplacedByHash { get; set; }
    public string? CreatedByIp { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;
    public bool IsRevoked => RevokedAtUtc is not null;
    public bool IsActive => !IsRevoked && !IsExpired;
}
