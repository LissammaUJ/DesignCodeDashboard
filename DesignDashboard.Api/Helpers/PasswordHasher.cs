using System.Security.Cryptography;
using System.Text;

namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Matches CarolERP password hashing used by dbo.Usp_LoginCheck (SHA-256 hex uppercase).
/// </summary>
public static class PasswordHasher
{
    public static string HashSha256Hex(string plainPassword)
    {
        if (string.IsNullOrEmpty(plainPassword))
        {
            return string.Empty;
        }

        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(plainPassword));
        var sb = new StringBuilder(hashBytes.Length * 2);
        foreach (var b in hashBytes)
        {
            sb.Append(b.ToString("X2"));
        }

        return sb.ToString();
    }
}
