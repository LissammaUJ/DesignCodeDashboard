using DesignDashboard.Api.DTOs;

namespace DesignDashboard.Api.Interfaces;

public interface ICustomerService
{
    Task<IReadOnlyList<CustomerDto>> GetActiveCustomersAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}

public interface IDesignService
{
    Task<DesignDetailDto?> GetDesignByIdAsync(
        int designId,
        int? customerAccountId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DesignProductionDto>> GetProductionByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default);

    Task<DesignInventoryDto> GetInventoryByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AccountDetailDto>> GetOtherCustomersByProductIdAsync(
        int designId,
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default);
}

public interface ICustomerSalesService
{
    Task<IReadOnlyList<CustomerSalesDto>> GetCustomerSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default);
}
