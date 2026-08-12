using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;

namespace DesignDashboard.Api.Services;

public sealed class DesignService(IDesignRepository repository) : IDesignService
{
    public Task<DesignDetailDto?> GetDesignByIdAsync(
        int designId,
        int? customerAccountId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken = default)
    {
        if (designId <= 0)
        {
            throw new ArgumentException("productId must be greater than zero.", nameof(designId));
        }

        DesignFilterRequest? filter = null;
        if (customerAccountId is > 0 && startDate.HasValue && endDate.HasValue)
        {
            filter = new DesignFilterRequest
            {
                CustomerAccountId = customerAccountId.Value,
                StartDate = startDate.Value,
                EndDate = endDate.Value
            };
            ValidateFilter(filter);
        }

        return repository.GetDesignByIdAsync(designId, filter, cancellationToken);
    }

    public Task<IReadOnlyList<DesignProductionDto>> GetProductionByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        if (designId <= 0)
        {
            throw new ArgumentException("productId must be greater than zero.", nameof(designId));
        }

        return repository.GetProductionByDesignIdAsync(designId, cancellationToken);
    }

    public Task<DesignInventoryDto> GetInventoryByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        if (designId <= 0)
        {
            throw new ArgumentException("productId must be greater than zero.", nameof(designId));
        }

        return repository.GetInventoryByDesignIdAsync(designId, cancellationToken);
    }

    public Task<IReadOnlyList<AccountDetailDto>> GetOtherCustomersByProductIdAsync(
        int designId,
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        if (designId <= 0)
        {
            throw new ArgumentException("productId must be greater than zero.", nameof(designId));
        }

        if (accountId <= 0)
        {
            throw new ArgumentException("accountId must be greater than zero.", nameof(accountId));
        }

        if (endDate.Date < startDate.Date)
        {
            throw new ArgumentException("endDate cannot be less than startDate.", nameof(endDate));
        }

        return repository.GetOtherCustomersByProductIdAsync(
            designId,
            accountId,
            startDate,
            endDate,
            cancellationToken);
    }

    private static void ValidateFilter(DesignFilterRequest filter)
    {
        if (filter.CustomerAccountId <= 0)
        {
            throw new ArgumentException("customerAccountId is required.", nameof(filter));
        }

        if (filter.EndDate.Date < filter.StartDate.Date)
        {
            throw new ArgumentException("endDate cannot be less than startDate.", nameof(filter));
        }
    }
}
