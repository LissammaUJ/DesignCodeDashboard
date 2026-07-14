using System.Data;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Configuration;

public sealed class SqlConnectionFactory(IConfiguration configuration) : ISqlConnectionFactory
{
    private readonly string _connectionString = configuration.GetConnectionString(DatabaseSettings.ConnectionName)
        ?? throw new InvalidOperationException(
            $"Connection string '{DatabaseSettings.ConnectionName}' is missing.");

    public IDbConnection CreateConnection() => new SqlConnection(_connectionString);
}
