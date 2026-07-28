namespace DesignDashboard.Api.DTOs;

public class DesignListItemDto
{
    public int DesignId { get; set; }
    public string DesignCode { get; set; } = string.Empty;
    public string DesignName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? ImageThumbnail { get; set; }
    public decimal SalesQty { get; set; }
    public decimal SalesValue { get; set; }
    public decimal PendingOrders { get; set; }
    public decimal PendingProcess { get; set; }
}
