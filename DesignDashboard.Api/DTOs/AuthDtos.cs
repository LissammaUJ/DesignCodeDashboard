using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DesignDashboard.Api.DTOs;

/// <summary>POST /api/login and POST /api/auth/login body.</summary>
public sealed class LoginRequestDto
{
    [MaxLength(10)]
    public string? EmplCode { get; set; }

    [MaxLength(100)]
    public string? Username { get; set; }

    [Required]
    [MaxLength(200)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Range(1, 255)]
    public int CompanyId { get; set; }

    [MaxLength(200)]
    public string? CompanyName { get; set; }

    [JsonIgnore]
    public string ResolvedEmplCode =>
        !string.IsNullOrWhiteSpace(EmplCode) ? EmplCode.Trim()
        : !string.IsNullOrWhiteSpace(Username) ? Username.Trim()
        : string.Empty;
}

/// <summary>POST /api/company/change — switch company without re-login.</summary>
public sealed class ChangeCompanyRequestDto
{
    [Required]
    [Range(1, 255)]
    public int CompanyId { get; set; }

    [MaxLength(200)]
    public string? CompanyName { get; set; }
}

public sealed class CompanyDto
{
    public int CoId { get; set; }
    public string CoName { get; set; } = string.Empty;
}

public sealed class EmployeeLoginDto
{
    public short EmplId { get; set; }
    public string EmplCode { get; set; } = string.Empty;
    public string EmplName { get; set; } = string.Empty;
    public bool Admin { get; set; }
    public bool Auditor { get; set; }
    public int CostingMethod { get; set; }
    public int Storage { get; set; }
    public int BatchExpiry { get; set; }
    public int ValidateStock { get; set; }
    public int StateId { get; set; }
    public int LocalSalesRateMethod { get; set; }
    public string Designation { get; set; } = string.Empty;
    public string ProfilePic { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateTime? Doj { get; set; }
    public DateTime? LastLogin { get; set; }
    public DateTime? PasswordChangedOn { get; set; }
    public bool DashboardEnabled { get; set; }
}

public sealed class LoginResponseDto
{
    public bool Status { get; set; }
    public string Message { get; set; } = string.Empty;
    public EmployeeLoginDto? Employee { get; set; }
    public CompanyDto? Company { get; set; }
    public string AccessToken { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Bearer";
    public int ExpiresInSeconds { get; set; }
    public string Username { get; set; } = string.Empty;
}

/// <summary>Result of login / change-company attempt (credentials vs company permission).</summary>
public sealed class AuthAttemptResult
{
    public LoginResponseDto? Response { get; init; }
    public bool InvalidCredentials { get; init; }
    public bool NoCompanyPermission { get; init; }
    public string Message { get; init; } = string.Empty;

    public static AuthAttemptResult Success(LoginResponseDto response) => new()
    {
        Response = response,
        Message = response.Message,
    };

    public static AuthAttemptResult FailCredentials(string message = "Invalid employee code, password, or company.") =>
        new() { InvalidCredentials = true, Message = message };

    public static AuthAttemptResult FailPermission(
        string message = "You do not have permission to access this company.") =>
        new() { NoCompanyPermission = true, Message = message };
}

public sealed class JwtUserIdentity
{
    public string EmplCode { get; init; } = string.Empty;
    public short EmplId { get; init; }
    public string EmplName { get; init; } = string.Empty;
    public bool Admin { get; init; }
    public int CompanyId { get; init; }
}
