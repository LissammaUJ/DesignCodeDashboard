namespace DesignDashboard.Api.DTOs;

public class ProductDetailDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? BarCode { get; set; }
    public decimal? NetWt { get; set; }
    public string? Composition { get; set; }
    public bool Active { get; set; }
}

public class AccountDetailDto
{
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string? AccountCode { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? TelNo { get; set; }
    public string? GstNo { get; set; }
}

public class DesignOrderDto
{
    public string OrderNo { get; set; } = string.Empty;
    public string Customer { get; set; } = string.Empty;
    public DateTime? OrderDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public decimal Quantity { get; set; }
    public decimal PendingQuantity { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ProcessingStage { get; set; } = string.Empty;
}

public class DesignSalesPointDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Value { get; set; }
}

public class DesignDetailDto
{
    public int DesignId { get; set; }
    public string DesignCode { get; set; } = string.Empty;
    public string DesignName { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? ImageThumbnail { get; set; }
    public string? CategoryName { get; set; }
    public decimal SalesQty { get; set; }
    public decimal SalesValue { get; set; }
    public decimal PendingOrders { get; set; }
    public decimal PendingProcess { get; set; }
    public DateTime? LastSoldDate { get; set; }
    public decimal AverageSellingPrice { get; set; }
    public IReadOnlyList<ProductDetailDto> ProductDetails { get; set; } = Array.Empty<ProductDetailDto>();
    public AccountDetailDto? AccountDetails { get; set; }
    public IReadOnlyList<DesignOrderDto> Orders { get; set; } = Array.Empty<DesignOrderDto>();
    public IReadOnlyList<DesignSalesPointDto> MonthlySales { get; set; } = Array.Empty<DesignSalesPointDto>();
    public IReadOnlyList<DesignSalesPointDto> YearlySales { get; set; } = Array.Empty<DesignSalesPointDto>();
    public IReadOnlyList<DesignProductionDto> Production { get; set; } = Array.Empty<DesignProductionDto>();
    public IReadOnlyList<DesignInventoryDto> Inventory { get; set; } = Array.Empty<DesignInventoryDto>();
}

public class DesignProductionDto
{
    public decimal ProductionQuantity { get; set; }
    public decimal CompletedQuantity { get; set; }
    public decimal PendingQuantity { get; set; }
    public decimal RejectedQuantity { get; set; }
    public DateTime? ProductionDate { get; set; }
    public string Department { get; set; } = string.Empty;
    public string Supervisor { get; set; } = string.Empty;

    public static DesignProductionDto Empty { get; } = new();
}

public class DesignInventoryDto
{
    public decimal CurrentStock { get; set; }

    public static DesignInventoryDto Empty { get; } = new();
}
