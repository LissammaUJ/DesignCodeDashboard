namespace DesignDashboard.Api.DTOs;

public class DashboardSummaryDto
{
    public int TotalDesigns { get; set; }
    public decimal TotalOrderQty { get; set; }
    public decimal TotalOrderSalesValue { get; set; }
    public decimal TotalSalesQty { get; set; }
    public decimal TotalSalesValue { get; set; }
    public decimal PendingOrderValue { get; set; }
    public decimal PendingOrders { get; set; }
    public decimal InProcessing { get; set; }
    public decimal CompletedOrders { get; set; }
}
