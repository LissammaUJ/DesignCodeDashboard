using DesignDashboard.Api.DTOs;

namespace DesignDashboard.Api.Interfaces;

public interface ICustomerRepository
{
    Task<IReadOnlyList<CustomerDto>> GetActiveCustomersAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}

public interface IDesignRepository
{
    Task<DesignDetailDto?> GetDesignByIdAsync(
        int designId,
        DesignFilterRequest? filter = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DesignProductionDto>> GetProductionByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default);

    Task<DesignInventoryDto> GetInventoryByDesignIdAsync(
        int designId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Other customers for a product (GetOtherCustomers) — excludes the selected AccountId.
    /// Incoming <paramref name="designId"/> is ProductId (same route convention as production).
    /// </summary>
    Task<IReadOnlyList<AccountDetailDto>> GetOtherCustomersByProductIdAsync(
        int designId,
        int accountId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}

public interface IDashboardRepository
{
    Task<DashboardSummaryDto> GetSummaryAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default);
}

public interface ICustomerSalesRepository
{
    Task<IReadOnlyList<CustomerSalesDto>> GetCustomerSalesAsync(
        DesignFilterRequest filter,
        CancellationToken cancellationToken = default);
}
