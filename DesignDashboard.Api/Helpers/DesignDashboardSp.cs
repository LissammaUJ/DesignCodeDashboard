using System.Data;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Builds SqlCommand for the single Design Dashboard procedure: dbo.usp_DesignDashboard.
/// </summary>
public static class DesignDashboardSp
{
    public const string Name = "dbo.usp_DesignDashboard";

    public static class Actions
    {
        public const string GetActiveCustomers = "GetActiveCustomers";
        public const string GetCustomerSales = "GetCustomerSales";
        public const string GetDesignList = "GetDesignList";
        public const string GetSummary = "GetSummary";
        public const string GetSalesTrend = "GetSalesTrend";
        public const string GetTopCustomers = "GetTopCustomers";
        public const string GetTopCategories = "GetTopCategories";
        public const string GetProductNames = "GetProductNames";
        public const string GetDesignThumbnails = "GetDesignThumbnails";
        public const string GetAccountName = "GetAccountName";
        public const string GetAccountDetails = "GetAccountDetails";
        public const string GetDesignHeader = "GetDesignHeader";
        public const string GetDesignSales = "GetDesignSales";
        public const string GetProductsByDesign = "GetProductsByDesign";
        public const string GetOrdersByDesign = "GetOrdersByDesign";
        public const string GetMonthlySales = "GetMonthlySales";
        public const string GetYearlySales = "GetYearlySales";
        public const string GetLastSold = "GetLastSold";
        public const string GetProduction = "GetProduction";
        public const string GetProductionFromBo = "GetProductionFromBo";
        public const string GetInventory = "GetInventory";
        public const string GetProducts = "GetProducts";
        public const string GetProductById = "GetProductById";
    }

    public static SqlCommand Create(SqlConnection connection, string action, int commandTimeout = 120)
    {
        var command = new SqlCommand(Name, connection)
        {
            CommandType = CommandType.StoredProcedure,
            CommandTimeout = commandTimeout
        };
        command.Parameters.Add("@Action", SqlDbType.NVarChar, 50).Value = action;

        // TVP is required by the procedure signature; pass empty unless caller replaces it.
        AdoNetHelper.AddIntIdListParameter(command, "@DesignIds", Array.Empty<int>());

        return command;
    }

    public static void AddOptionalInt(SqlCommand command, string name, int? value)
    {
        command.Parameters.Add(name, SqlDbType.Int).Value = value.HasValue ? value.Value : DBNull.Value;
    }

    public static void AddOptionalDateTime(SqlCommand command, string name, DateTime? value)
    {
        command.Parameters.Add(name, SqlDbType.DateTime).Value = value.HasValue ? value.Value : DBNull.Value;
    }
}
