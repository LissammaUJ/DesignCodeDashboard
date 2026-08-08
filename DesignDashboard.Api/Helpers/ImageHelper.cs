using System.Text;

namespace DesignDashboard.Api.Helpers;

public static class ImageHelper
{
    /// <summary>
    /// Converts raw image bytes to a single data URL. If bytes already store a data: URL string, returns it once.
    /// </summary>
    public static string? ToBase64DataUrl(byte[]? imageBytes, string mimeType = "image/jpeg")
    {
        if (imageBytes is null || imageBytes.Length == 0)
        {
            return null;
        }

        // Guard against double-wrapping when the column already holds a data: URL.
        if (imageBytes.Length >= 11
            && imageBytes[0] == (byte)'d'
            && imageBytes[1] == (byte)'a'
            && imageBytes[2] == (byte)'t'
            && imageBytes[3] == (byte)'a'
            && imageBytes[4] == (byte)':')
        {
            var asText = Encoding.ASCII.GetString(imageBytes).Trim();
            if (asText.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            {
                return asText;
            }
        }

        return $"data:{mimeType};base64,{Convert.ToBase64String(imageBytes)}";
    }
}
