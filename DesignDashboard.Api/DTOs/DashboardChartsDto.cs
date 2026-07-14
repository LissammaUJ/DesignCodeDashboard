namespace DesignDashboard.Api.DTOs;

public class ChartDataPointDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

public class DashboardChartsDto
{
    public IReadOnlyList<ChartDataPointDto> SalesTrend { get; set; } = Array.Empty<ChartDataPointDto>();
    public IReadOnlyList<ChartDataPointDto> TopCustomers { get; set; } = Array.Empty<ChartDataPointDto>();
    public IReadOnlyList<ChartDataPointDto> TopCategories { get; set; } = Array.Empty<ChartDataPointDto>();
}
