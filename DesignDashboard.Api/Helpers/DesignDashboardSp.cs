using System.Data;
using Dapper;

namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Parameter helpers for dbo.Usp_DesignDashboard_New.
/// </summary>
public static class DesignDashboardSp
{
    public const string Name = "dbo.Usp_DesignDashboard_New";

    public static class Actions
    {
        public const string GetCustomers = "GetCustomers";
        public const string GetCustomerSales = "GetCustomerSales";
        public const string GetSummary = "GetSummary";
        public const string GetDesignThumbnails = "GetDesignThumbnails";
        public const string GetAccountDetails = "GetAccountDetails";
        public const string GetProductHeader = "GetProductHeader";
        public const string GetProductSales = "GetProductSales";
        public const string GetProductsByDesign = "GetProductsByDesign";
        public const string GetOrdersByProduct = "GetOrdersByProduct";
        public const string GetMonthlySales = "GetMonthlySales";
        public const string GetYearlySales = "GetYearlySales";
        public const string GetLastSold = "GetLastSold";
        public const string GetProduction = "GetProduction";
        public const string GetInventory = "GetInventory";
    }

    public static DynamicParameters CreateParameters(string action)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@Action", action, DbType.String, size: 50);
        return parameters;
    }

    public static void AddInt(DynamicParameters parameters, string name, int value)
    {
        parameters.Add(name, value, DbType.Int32);
    }

    public static void AddDateTime(DynamicParameters parameters, string name, DateTime value)
    {
        parameters.Add(name, value, DbType.DateTime);
    }

    public static void AddOptionalInt(DynamicParameters parameters, string name, int? value)
    {
        if (value.HasValue)
        {
            parameters.Add(name, value.Value, DbType.Int32);
        }
    }

    public static void AddOptionalDateTime(DynamicParameters parameters, string name, DateTime? value)
    {
        if (value.HasValue)
        {
            parameters.Add(name, value.Value, DbType.DateTime);
        }
    }

    public static void AddDesignIds(DynamicParameters parameters, IEnumerable<int> ids)
    {
        parameters.Add(
            "@DesignIds",
            AdoNetHelper.CreateIntIdListTable(ids).AsTableValuedParameter(AdoNetHelper.IntIdListTypeName));
    }
}
