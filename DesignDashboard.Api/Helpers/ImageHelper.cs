namespace DesignDashboard.Api.Helpers;

public static class ImageHelper
{
    public static string? ToBase64DataUrl(byte[]? imageBytes, string mimeType = "image/jpeg")
    {
        if (imageBytes is null || imageBytes.Length == 0)
        {
            return null;
        }

        return $"data:{mimeType};base64,{Convert.ToBase64String(imageBytes)}";
    }
}
