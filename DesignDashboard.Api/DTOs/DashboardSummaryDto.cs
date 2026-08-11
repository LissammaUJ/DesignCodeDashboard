namespace DesignDashboard.Api.DTOs;

public class DashboardSummaryDto
{
    /// <summary>From GetSummary.TotalProducts (single summary row).</summary>
    public int TotalProducts { get; set; }
    public decimal TotalOrderQty { get; set; }
    public decimal TotalOrderSalesValue { get; set; }
    public decimal TotalSalesQty { get; set; }
    public decimal TotalSalesValue { get; set; }
    public decimal PendingOrderValue { get; set; }
    public decimal PendingOrders { get; set; }
    public decimal InProcessing { get; set; }
    /// <summary>Kept for API contract. Not populated — GetSummary does not return CompletedOrderQty.</summary>
    public decimal CompletedOrders { get; set; }
}
