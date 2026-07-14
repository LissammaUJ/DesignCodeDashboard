namespace DesignDashboard.Api.Configuration;

public class DatabaseSettings
{
    public const string SectionName = "ConnectionStrings";
    public const string ConnectionName = "ERPConnectionString";

    public string ERPConnectionString { get; set; } = string.Empty;
}
