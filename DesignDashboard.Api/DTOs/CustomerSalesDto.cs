namespace DesignDashboard.Api.DTOs;

/// <summary>Maps company sales SQL result columns for Angular (camelCase JSON).</summary>
public class CustomerSalesDto
{
    public int DesignId { get; set; }
    public string DesignCode { get; set; } = string.Empty;
    public string DesignName { get; set; } = string.Empty;
    /// <summary>Primary Product.ProductName for the design (reuse existing Product table).</summary>
    public string ProductName { get; set; } = string.Empty;
    public decimal TotalSalesQty { get; set; }
    public decimal TotalSalesAmount { get; set; }
    public decimal PendingOrder { get; set; }
    public decimal PendingProcess { get; set; }
    /// <summary>ItemDesign.ImgThumbData as data:image/jpeg;base64,... (batched after sales).</summary>
    public string? ImageThumbnail { get; set; }
}
