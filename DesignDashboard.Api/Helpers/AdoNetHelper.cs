using System.Data;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Shared ADO.NET helpers for Stored Procedure calls (no Dapper, no inline SQL text).
/// </summary>
public static class AdoNetHelper
{
    public const string IntIdListTypeName = "dbo.IntIdList";

    /// <summary>
    /// Builds a DataTable matching dbo.IntIdList (column Id INT).
    /// Used as SqlDbType.Structured parameter for TVP Stored Procedures.
    /// </summary>
    public static DataTable CreateIntIdListTable(IEnumerable<int> ids)
    {
        var table = new DataTable();
        table.Columns.Add("Id", typeof(int));

        foreach (var id in ids.Where(x => x > 0).Distinct())
        {
            table.Rows.Add(id);
        }

        return table;
    }

    /// <summary>Adds or replaces a table-valued parameter (@DesignIds dbo.IntIdList).</summary>
    public static void AddIntIdListParameter(SqlCommand command, string parameterName, IEnumerable<int> ids)
    {
        var table = CreateIntIdListTable(ids);
        if (command.Parameters.Contains(parameterName))
        {
            command.Parameters[parameterName].Value = table;
            return;
        }

        var parameter = command.Parameters.Add(parameterName, SqlDbType.Structured);
        parameter.TypeName = IntIdListTypeName;
        parameter.Value = table;
    }
}
