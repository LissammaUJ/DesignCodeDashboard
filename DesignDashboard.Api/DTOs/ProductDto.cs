namespace DesignDashboard.Api.DTOs;

/// <summary>Product list/detail response mapped from Product (+ optional Product_Account).</summary>
public class ProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? DesignId { get; set; }
    public string? BarCode { get; set; }
    public decimal? NetWt { get; set; }
    public string? Composition { get; set; }
    public bool Active { get; set; }
    public string? AcSpecCode { get; set; }
    public string? AcSpecName { get; set; }
    public decimal? Rate { get; set; }
}
