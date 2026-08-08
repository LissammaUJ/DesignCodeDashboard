using Microsoft.AspNetCore.Http;

namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Reads company id from the authenticated JWT (same claims as login / ComboBind CoId usage).
/// </summary>
public static class CompanyContext
{
    public static int GetRequiredCoId(IHttpContextAccessor httpContextAccessor)
    {
        var identity = JwtUserReader.TryRead(httpContextAccessor.HttpContext?.User);
        if (identity is null || identity.CompanyId <= 0)
        {
            throw new InvalidOperationException(
                "Company (CoId) is missing from the authenticated session.");
        }

        return identity.CompanyId;
    }
}
