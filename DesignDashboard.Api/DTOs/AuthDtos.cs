using System.ComponentModel.DataAnnotations;

namespace DesignDashboard.Api.DTOs;

/// <summary>POST /api/auth/login body.</summary>
public sealed class LoginRequestDto
{
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Password { get; set; } = string.Empty;
}

/// <summary>Successful login response.</summary>
public sealed class LoginResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Bearer";
    public int ExpiresInSeconds { get; set; }
    public string Username { get; set; } = string.Empty;
}
