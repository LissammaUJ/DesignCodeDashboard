using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Helpers;
using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Models;
using Dapper;

namespace DesignDashboard.Api.Repositories;

public sealed class CustomerSalesRepository(
    ISqlConnectionFactory connectionFactory,
    ILogger<CustomerSalesRepository> logger) : ICustomerSalesRepository
{
    public async Task<IReadOnlyList<CustomerSalesDto>> GetCustomerSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var accountId = filter.CustomerAccountId;
        var startDate = DateHelper.StartOfDay(filter.StartDate);
        var endDate = DateHelper.EndOfDay(filter.EndDate);

        logger.LogInformation(
            "Executing customer sales SQL for AccountId={AccountId}, StartDate={StartDate}, EndDate={EndDate}",
            accountId,
            startDate,
            endDate);

        try
        {
            using var connection = connectionFactory.CreateConnection();

            var rows = await connection.QueryAsync<CustomerSalesResult>(
                new CommandDefinition(
                    CustomerSalesSql.ByAccountAndDateRange,
                    new { AccountId = accountId, StartDate = startDate, EndDate = endDate },
                    cancellationToken: cancellationToken));

            List<CustomerSalesDto> result = [.. rows.Select(r => new CustomerSalesDto
            {
                DesignId = r.DesignId,
                DesignCode = r.DesignCode?.Trim() ?? string.Empty,
                DesignName = r.DesignName?.Trim() ?? string.Empty,
                TotalSalesQty = r.TotalSalesQty,
                TotalSalesAmount = r.TotalSalesAmount,
                PendingOrder = r.PendingOrder,
                PendingProcess = r.PendingProcess,
                ImageThumbnail = ImageHelper.ToBase64DataUrl(r.ImgThumbData)
            })];

            logger.LogInformation("Customer sales SQL returned {Count} rows", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Customer sales SQL failed for AccountId={AccountId}", accountId);
            throw;
        }
    }
}
