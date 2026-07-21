using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;

namespace DesignDashboard.Api.Services;

public sealed class CustomerService(ICustomerRepository repository) : ICustomerService
{
    public Task<IReadOnlyList<CustomerDto>> GetActiveCustomersAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        if (startDate == default)
        {
            throw new ArgumentException("startDate is required.", nameof(startDate));
        }

        if (endDate == default)
        {
            throw new ArgumentException("endDate is required.", nameof(endDate));
        }

        if (endDate.Date < startDate.Date)
        {
            throw new ArgumentException("endDate cannot be less than startDate.", nameof(endDate));
        }

        return repository.GetActiveCustomersAsync(startDate, endDate, cancellationToken);
    }
}
