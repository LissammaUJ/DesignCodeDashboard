using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;

namespace DesignDashboard.Api.Services;

public sealed class CustomerService(ICustomerRepository repository) : ICustomerService
{
    public Task<IReadOnlyList<CustomerDto>> GetActiveCustomersAsync(CancellationToken cancellationToken = default)
        => repository.GetActiveCustomersAsync(cancellationToken);
}
