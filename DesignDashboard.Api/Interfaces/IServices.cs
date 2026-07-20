using DesignDashboard.Api.DTOs;

namespace DesignDashboard.Api.Interfaces;

public interface ICustomerService
{
    Task<IReadOnlyList<CustomerDto>> GetActiveCustomersAsync(CancellationToken cancellationToken = default);
}

public interface IDesignService
{
    Task<IReadOnlyList<DesignListItemDto>> GetDesignsAsync(DesignFilterRequest filter, CancellationToken cancellationToken = default);
    Task<DesignDetailDto?> GetDesignByIdAsync(int designId, int? customerAccountId, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken = default);
    Task<DesignProductionDto> GetProductionByDesignIdAsync(int designId, CancellationToken cancellationToken = default);
    Task<DesignInventoryDto> GetInventoryByDesignIdAsync(int designId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DesignActivityItemDto>> GetActivityTimelineByDesignIdAsync(int designId, CancellationToken cancellationToken = default);
}

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(DesignFilterRequest filter, CancellationToken cancellationToken = default);
    Task<DashboardChartsDto> GetChartsAsync(DesignFilterRequest filter, CancellationToken cancellationToken = default);
}

public interface IProductService
{
    Task<IReadOnlyList<ProductDto>> GetProductsAsync(int? designId = null, int? accountId = null, CancellationToken cancellationToken = default);
    Task<ProductDto?> GetProductByIdAsync(int productId, int? accountId = null, CancellationToken cancellationToken = default);
}

public interface ICustomerSalesService
{
    Task<IReadOnlyList<CustomerSalesDto>> GetCustomerSalesAsync(DesignFilterRequest filter, CancellationToken cancellationToken = default);
}
