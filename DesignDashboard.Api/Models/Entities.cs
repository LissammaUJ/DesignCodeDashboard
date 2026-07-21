namespace DesignDashboard.Api.Models;

public class CustomerSalesResult
{
    public int DesignId { get; set; }
    public string DesignCode { get; set; } = string.Empty;
    public string DesignName { get; set; } = string.Empty;
    public decimal TotalSalesQty { get; set; }
    public decimal TotalSalesAmount { get; set; }
    public decimal PendingOrder { get; set; }
    public decimal PendingProcess { get; set; }
    public byte[]? ImgThumbData { get; set; }
}

public class DesignImageRow
{
    public int DesignId { get; set; }
    public byte[]? ImgThumbData { get; set; }
    public int? AccountId { get; set; }
    public string? CustomerName { get; set; }
}

public class DesignHeaderRow
{
    public int DesignId { get; set; }
    public string? DesignCode { get; set; }
    public string? DesignName { get; set; }
    public byte[]? ImgThumbData { get; set; }
    public int? AccountId { get; set; }
    public string? CustomerName { get; set; }
    public string? CategoryName { get; set; }
}

public class DesignOrderRow
{
    public string OrderNo { get; set; } = string.Empty;
    public string Customer { get; set; } = string.Empty;
    public DateTime? OrderDate { get; set; }
    public decimal Quantity { get; set; }
    public decimal Amount { get; set; }
}

public class DesignSalesPointRow
{
    public string Label { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Value { get; set; }
}

public class DesignSalesMetaRow
{
    public DateTime? LastSoldDate { get; set; }
}

public class DesignProductionRow
{
    public decimal ProductionQuantity { get; set; }
    public decimal CompletedQuantity { get; set; }
    public decimal PendingQuantity { get; set; }
    public decimal RejectedQuantity { get; set; }
    public DateTime? ProductionDate { get; set; }
    public string? Department { get; set; }
    public string? Supervisor { get; set; }
}

public class DesignInventoryRow
{
    public decimal CurrentStock { get; set; }
}

public class ProductRow
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? BarCode { get; set; }
    public decimal? NetWt { get; set; }
    public string? Composition { get; set; }
    public byte Active { get; set; }
}

public class AccountRow
{
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string? AccountCode { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? TelNo { get; set; }
    public string? GstNo { get; set; }
}

public class ChartRow
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
}
