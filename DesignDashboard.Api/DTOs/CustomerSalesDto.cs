using System.Text.Json.Serialization;

namespace DesignDashboard.Api.DTOs;

/// <summary>
/// One dashboard card = one product. DesignId/Code/Name/image may repeat across rows.
/// </summary>
public class CustomerSalesDto
{
    public int DesignId { get; set; }
    public string DesignCode { get; set; } = string.Empty;
    public string DesignName { get; set; } = string.Empty;
    /// <summary>Unique card key — Product.ProductId.</summary>
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    /// <summary>Product-level order qty from GetCustomerSales (TotalOrderQty).</summary>
    public decimal TotalOrderQty { get; set; }
    /// <summary>Product-level order value from GetCustomerSales (TotalOrderValue).</summary>
    public decimal TotalOrderValue { get; set; }
    public decimal TotalSalesQty { get; set; }
    public decimal TotalSalesAmount { get; set; }

    [JsonPropertyName("pendingOrder")]
    public decimal PendingOrder { get; set; }

    [JsonPropertyName("pendingProcess")]
    public decimal PendingProcess { get; set; }

    /// <summary>ItemDesign.ImgThumbData as data:image/jpeg;base64,... (same for all products of a design).</summary>
    public string? ImageThumbnail { get; set; }
}
