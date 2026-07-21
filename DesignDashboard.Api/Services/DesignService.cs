using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;

namespace DesignDashboard.Api.Services;

public sealed class DesignService(IDesignRepository repository) : IDesignService
{
    public Task<IReadOnlyList<DesignListItemDto>> GetDesignsAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        ValidateFilter(filter);
        return repository.GetDesignsAsync(filter, cancellationToken);
    }

    public Task<DesignDetailDto?> GetDesignByIdAsync(
        int designId,
        int? customerAccountId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken = default)
    {
        if (designId <= 0)
        {
            throw new ArgumentException("designId must be greater than zero.", nameof(designId));
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

    public Task<DesignProductionDto> GetProductionByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        if (designId <= 0)
        {
            return Task.FromResult(DesignProductionDto.Empty);
        }

        return repository.GetProductionByDesignIdAsync(designId, cancellationToken);
    }

    public Task<DesignInventoryDto> GetInventoryByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default)
    {
        if (designId <= 0)
        {
            return Task.FromResult(DesignInventoryDto.Empty);
        }

        return repository.GetInventoryByDesignIdAsync(designId, cancellationToken);
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
