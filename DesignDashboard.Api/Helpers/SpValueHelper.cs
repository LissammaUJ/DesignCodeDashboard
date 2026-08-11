namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Repository-boundary helpers for dbo.Usp_DesignDashboard_New results.
/// Keeps SP sentinel / NULL normalization out of services, controllers, and Angular.
/// </summary>
internal static class SpValueHelper
{
    public static bool IsMissingText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        var text = value.Trim();
        return text is "-" or "—" or "?"
            || text.Equals("null", StringComparison.OrdinalIgnoreCase)
            || text.Equals("no data available", StringComparison.OrdinalIgnoreCase);
    }

    public static string? CleanText(string? value) =>
        IsMissingText(value) ? null : value!.Trim();

    public static string CleanTextOrEmpty(string? value) =>
        CleanText(value) ?? string.Empty;

    public static bool IsMissingDecimal(decimal? value) =>
        value is null or <= 0;

    public static bool IsMissingDecimal(decimal value) => value <= 0;

    /// <summary>
    /// Existing dashboard contract: NULL or negative SP numerics → 0 for KPI/card quantities.
    /// </summary>
    public static decimal NonNegative(decimal? value)
    {
        if (value is null || value.Value < 0)
        {
            return 0;
        }

        return value.Value;
    }

    public static decimal NonNegative(decimal value) => value < 0 ? 0 : value;

    public static int NonNegativeInt(int? value)
    {
        if (value is null || value.Value < 0)
        {
            return 0;
        }

        return value.Value;
    }
}
