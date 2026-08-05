using System.Security.Claims;
using DesignDashboard.Api.DTOs;

namespace DesignDashboard.Api.Helpers;

public static class JwtUserReader
{
    public static JwtUserIdentity? TryRead(ClaimsPrincipal? user)
    {
        if (user?.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        var emplCode = user.FindFirstValue(ClaimTypes.Name)
            ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("unique_name")
            ?? string.Empty;

        if (string.IsNullOrWhiteSpace(emplCode))
        {
            return null;
        }

        _ = short.TryParse(user.FindFirstValue("emplId"), out var emplId);
        _ = int.TryParse(user.FindFirstValue("coId"), out var companyId);
        var admin = user.FindFirstValue("admin") is "1" or "true" or "True";

        return new JwtUserIdentity
        {
            EmplCode = emplCode.Trim(),
            EmplId = emplId,
            EmplName = user.FindFirstValue("emplName") ?? string.Empty,
            Admin = admin,
            CompanyId = companyId,
        };
    }
}
