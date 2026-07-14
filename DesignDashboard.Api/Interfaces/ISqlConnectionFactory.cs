using System.Data;

namespace DesignDashboard.Api.Interfaces;

public interface ISqlConnectionFactory
{
    IDbConnection CreateConnection();
}
