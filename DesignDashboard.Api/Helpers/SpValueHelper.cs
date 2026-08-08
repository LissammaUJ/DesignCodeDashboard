namespace DesignDashboard.Api.Helpers;

/// <summary>
/// SP sentinel values ("-", 0, empty) must not overwrite better data already resolved.
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

    public static bool IsMissingDecimal(decimal? value) =>
        value is null or <= 0;

    public static bool IsMissingDecimal(decimal value) => value <= 0;
}
