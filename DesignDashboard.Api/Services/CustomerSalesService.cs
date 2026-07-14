using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;

namespace DesignDashboard.Api.Services;

public sealed class CustomerSalesService(
    ICustomerSalesRepository repository,
    ILogger<CustomerSalesService> logger) : ICustomerSalesService
{
    public Task<IReadOnlyList<CustomerSalesDto>> GetCustomerSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        if (filter.CustomerAccountId <= 0)
        {
            throw new ArgumentException("accountId (or customerAccountId) is required.", nameof(filter));
        }

        if (filter.EndDate.Date < filter.StartDate.Date)
        {
            throw new ArgumentException("endDate cannot be less than startDate.", nameof(filter));
        }

        logger.LogDebug("CustomerSalesService AccountId={AccountId}", filter.CustomerAccountId);
        return repository.GetCustomerSalesAsync(filter, cancellationToken);
    }
}
