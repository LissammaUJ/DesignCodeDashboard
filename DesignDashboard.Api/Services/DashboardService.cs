using DesignDashboard.Api.DTOs;
using DesignDashboard.Api.Interfaces;

namespace DesignDashboard.Api.Services;

public sealed class DashboardService(IDashboardRepository repository) : IDashboardService
{
    public Task<DashboardSummaryDto> GetSummaryAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        ValidateFilter(filter);
        return repository.GetSummaryAsync(filter, cancellationToken);
    }

    public Task<DashboardChartsDto> GetChartsAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        ValidateFilter(filter);
        return repository.GetChartsAsync(filter, cancellationToken);
    }

    private static void ValidateFilter(DesignFilterRequest filter)
    {
        if (filter.CustomerAccountId <= 0)
        {
            throw new ArgumentException("accountId (or customerAccountId) is required.", nameof(filter));
        }

        if (filter.StartDate == default)
        {
            throw new ArgumentException("startDate is required.", nameof(filter));
        }

        if (filter.EndDate == default)
        {
            throw new ArgumentException("endDate is required.", nameof(filter));
        }

        if (filter.EndDate.Date < filter.StartDate.Date)
        {
            throw new ArgumentException("endDate cannot be less than startDate.", nameof(filter));
        }
    }
}
