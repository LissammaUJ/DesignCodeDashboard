namespace DesignDashboard.Api.DTOs;

public class DashboardSummaryDto
{
    /// <summary>COUNT(DISTINCT ProductId) — product-wise cards.</summary>
    public int TotalProducts { get; set; }
    public decimal TotalOrderQty { get; set; }
    public decimal TotalOrderSalesValue { get; set; }
    public decimal TotalSalesQty { get; set; }
    public decimal TotalSalesValue { get; set; }
    public decimal PendingOrderValue { get; set; }
    public decimal PendingOrders { get; set; }
    public decimal InProcessing { get; set; }
    public decimal CompletedOrders { get; set; }
}
