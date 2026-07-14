namespace DesignDashboard.Api.DTOs;

public class DesignFilterRequest
{
    public int CustomerAccountId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
