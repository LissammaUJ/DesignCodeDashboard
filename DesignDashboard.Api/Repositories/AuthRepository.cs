using System.Data;
using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;
using Microsoft.Data.SqlClient;

namespace DesignDashboard.Api.Repositories;

/// <summary>
/// Auth data access — stored procedures only (ComboBind, LoginCheck, LoggedInEmployee, GetDashboardPermission).
/// </summary>
public sealed class AuthRepository(
    ISqlConnectionFactory connectionFactory,
    ILogger<AuthRepository> logger) : IAuthRepository
{
    private const string ComboBindProc = "dbo.Usp_ComboBind";
    private const string LoginCheckProc = "dbo.Usp_LoginCheck";
    private const string LoggedInEmployeeProc = "dbo.Usp_LoggedInEmployee";
    private const string DashboardPermissionProc = "dbo.Usp_GetDashboardPermission";

    public async Task<IReadOnlyList<CompanyDto>> GetCompaniesAsync(CancellationToken cancellationToken = default)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = new SqlCommand(ComboBindProc, connection)
        {
            CommandType = CommandType.StoredProcedure,
            CommandTimeout = 60,
        };

        command.Parameters.Add("@TableName", SqlDbType.VarChar, 40).Value = "Company";
        command.Parameters.Add("@Val1", SqlDbType.VarChar, 50).Value = string.Empty;
        command.Parameters.Add("@Val2", SqlDbType.VarChar, 50).Value = DBNull.Value;
        command.Parameters.Add("@ParamId", SqlDbType.Int).Value = 0;
        command.Parameters.Add("@CoId", SqlDbType.Int).Value = 0;
        command.Parameters.Add("@IsReport", SqlDbType.TinyInt).Value = 0;

        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

        var list = new List<CompanyDto>();
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            var coIdOrd = reader.GetOrdinal("CoId");
            var coNameOrd = reader.GetOrdinal("CoName");
            list.Add(new CompanyDto
            {
                CoId = reader.IsDBNull(coIdOrd) ? 0 : Convert.ToInt32(reader.GetValue(coIdOrd)),
                CoName = reader.IsDBNull(coNameOrd)
                    ? string.Empty
                    : Convert.ToString(reader.GetValue(coNameOrd))?.Trim() ?? string.Empty,
            });
        }

        logger.LogInformation("[Auth] {Proc} returned {Count} companies", ComboBindProc, list.Count);
        return list;
    }

    public async Task<EmployeeLoginDto?> LoginCheckAsync(
        string emplCode,
        string encryptedPassword,
        byte companyId,
        CancellationToken cancellationToken = default)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = new SqlCommand(LoginCheckProc, connection)
        {
            CommandType = CommandType.StoredProcedure,
            CommandTimeout = 90,
        };

        command.Parameters.Add("@Mode", SqlDbType.Int).Value = 1;
        command.Parameters.Add("@EmplCode", SqlDbType.VarChar, 10).Value = emplCode;
        command.Parameters.Add("@Password", SqlDbType.VarChar, 300).Value = encryptedPassword;
        command.Parameters.Add("@EmplId", SqlDbType.SmallInt).Value = DBNull.Value;
        command.Parameters.Add("@CoId", SqlDbType.TinyInt).Value = companyId;

        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

        if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            logger.LogWarning(
                "[Auth] {Proc} returned no rows for EmplCode={EmplCode} CoId={CoId} (check password hash / Active / UserType IN 1,2)",
                LoginCheckProc,
                emplCode,
                companyId);
            logger.LogInformation("Stored procedure result count = {Count}", 0);
            return null;
        }

        var employee = MapEmployee(reader);
        logger.LogInformation(
            "Stored procedure result count = {Count} EmplId={EmplId} EmplCode={EmplCode} Admin={Admin}",
            1,
            employee.EmplId,
            employee.EmplCode,
            employee.Admin);
        return employee;
    }

    public async Task<int> CheckCompanyAccessAsync(
        short emplId,
        byte companyId,
        CancellationToken cancellationToken = default)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = new SqlCommand(LoggedInEmployeeProc, connection)
        {
            CommandType = CommandType.StoredProcedure,
            CommandTimeout = 60,
        };

        // Mode 2 = Check Right To Access Company
        command.Parameters.Add("@Mode", SqlDbType.Int).Value = 2;
        command.Parameters.Add("@EmplId", SqlDbType.SmallInt).Value = emplId;
        command.Parameters.Add("@CoId", SqlDbType.TinyInt).Value = companyId;
        command.Parameters.Add("@RefId", SqlDbType.Int).Value = 0;
        command.Parameters.Add("@RefType", SqlDbType.Int).Value = 0;

        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        var scalar = await command.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
        var count = scalar is null or DBNull ? 0 : Convert.ToInt32(scalar);

        logger.LogInformation(
            "[Auth] {Proc} Mode=2 EmplId={EmplId} CoId={CoId} => {Count}",
            LoggedInEmployeeProc,
            emplId,
            companyId,
            count);

        return count;
    }

    public async Task<bool> HasDashboardPermissionAsync(
        short emplId,
        byte companyId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        await using var connection = (SqlConnection)connectionFactory.CreateConnection();
        await using var command = new SqlCommand(DashboardPermissionProc, connection)
        {
            CommandType = CommandType.StoredProcedure,
            CommandTimeout = 60,
        };

        command.Parameters.Add("@EmplId", SqlDbType.SmallInt).Value = emplId;
        command.Parameters.Add("@CoId", SqlDbType.TinyInt).Value = companyId;
        command.Parameters.Add("@Admin", SqlDbType.TinyInt).Value = isAdmin ? (byte)1 : (byte)0;

        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        var hasRows = await reader.ReadAsync(cancellationToken).ConfigureAwait(false);

        logger.LogInformation(
            "[Auth] {Proc} EmplId={EmplId} CoId={CoId} Admin={Admin} hasAccess={HasAccess}",
            DashboardPermissionProc,
            emplId,
            companyId,
            isAdmin,
            hasRows);

        return hasRows;
    }

    private static EmployeeLoginDto MapEmployee(SqlDataReader reader)
    {
        short ReadInt16(string name)
        {
            var ord = reader.GetOrdinal(name);
            return reader.IsDBNull(ord) ? (short)0 : Convert.ToInt16(reader.GetValue(ord));
        }

        int ReadInt32(string name)
        {
            var ord = reader.GetOrdinal(name);
            return reader.IsDBNull(ord) ? 0 : Convert.ToInt32(reader.GetValue(ord));
        }

        bool ReadBool(string name)
        {
            var ord = reader.GetOrdinal(name);
            if (reader.IsDBNull(ord))
            {
                return false;
            }

            var value = reader.GetValue(ord);
            return value switch
            {
                bool b => b,
                byte by => by != 0,
                short s => s != 0,
                int i => i != 0,
                _ => Convert.ToInt32(value) != 0,
            };
        }

        string ReadString(string name)
        {
            var ord = reader.GetOrdinal(name);
            return reader.IsDBNull(ord) ? string.Empty : Convert.ToString(reader.GetValue(ord))?.Trim() ?? string.Empty;
        }

        DateTime? ReadDate(string name)
        {
            var ord = reader.GetOrdinal(name);
            return reader.IsDBNull(ord) ? null : Convert.ToDateTime(reader.GetValue(ord));
        }

        return new EmployeeLoginDto
        {
            EmplId = ReadInt16("EmplId"),
            EmplCode = ReadString("EmplCode"),
            EmplName = ReadString("EmplName"),
            Admin = ReadBool("Admin"),
            Auditor = ReadBool("Auditor"),
            CostingMethod = ReadInt32("CostingMethod"),
            Storage = ReadInt32("Storage"),
            BatchExpiry = ReadInt32("BatchExpiry"),
            ValidateStock = ReadInt32("ValidateStock"),
            StateId = ReadInt32("StateId"),
            LocalSalesRateMethod = ReadInt32("LocalSalesRateMethod"),
            Designation = ReadString("Designation"),
            ProfilePic = ReadString("ProfilePic"),
            Gender = ReadString("Gender"),
            Doj = ReadDate("DOJ"),
            LastLogin = ReadDate("LastLogin"),
            PasswordChangedOn = ReadDate("PasswordChangedOn"),
            DashboardEnabled = ReadBool("DashboardEnabled"),
        };
    }
}
