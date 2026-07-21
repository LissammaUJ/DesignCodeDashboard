import {
  CustomerDto,
  CustomerSalesDto,
  DashboardChartsDto,
  DashboardSummaryDto,
  DesignDetailDto,
  DesignListItemDto,
  ProductDetailDto,
} from '../models/api.models';
import {
  DashboardAnalytics,
  DashboardKpiSummary,
  DesignDetail,
  DesignListItem,
  DesignOrderDetail,
  SelectOption,
  SortField,
  SortOrder,
} from '../core/models/design.models';

const NO_DATA = 'No Data Available';

/** Maps GET /api/customer → filter dropdown options (value as string for existing Select). */
export function mapCustomersToOptions(customers: CustomerDto[]): SelectOption[] {
  return customers.map((c) => ({
    label: c.accountName?.trim() || `Account ${c.accountId}`,
    value: String(c.accountId),
  }));
}

/**
 * Maps GET /api/customer-sales CustomerSalesDto → existing DesignListItem UI model.
 * Field mismatches: totalSalesQty→salesQuantity, totalSalesAmount→totalSalesValue,
 * pendingOrder→pendingOrderQuantity, imageThumbnail→imageUrl, designId→designID.
 */
export function mapCustomerSalesToListItem(
  dto: CustomerSalesDto,
  customerAccount = ''
): DesignListItem {
  const image = toCardImageUrl(dto.imageThumbnail);
  return {
    designID: dto.designId,
    designCode: dto.designCode ?? '',
    designName: dto.designName ?? '',
    customerAccount,
    category: '',
    subCategory: '',
    material: '',
    purity: '',
    grossWeight: 0,
    netWeight: 0,
    stoneWeight: 0,
    makingCharge: 0,
    salesQuantity: Number(dto.totalSalesQty) || 0,
    totalSalesValue: Number(dto.totalSalesAmount) || 0,
    pendingOrderQuantity: Number(dto.pendingOrder) || 0,
    pendingOrderValue: 0,
    inProcessingQuantity: Number(dto.pendingProcess) || 0,
    completedOrderQuantity: 0,
    currentStock: 0,
    availableStock: 0,
    reservedQuantity: 0,
    createdDate: '',
    designer: '',
    approvalStatus: 'Approved',
    salesStatus: 'Active',
    imageUrl: image,
    images: image ? [image] : [],
    isFavorite: false,
    isPinned: false,
  };
}

/**
 * Maps GET /api/designs DesignListItemDto → existing DesignListItem UI model.
 * Keeps card template bindings (designCode, designName, imageUrl, salesQuantity, …).
 * Image comes from ItemDesign.ImgThumbData → API imageThumbnail (data:image/jpeg;base64,...).
 */
export function mapDesignListItem(dto: DesignListItemDto): DesignListItem {
  const image = toCardImageUrl(dto.imageThumbnail);
  return {
    designID: dto.designId,
    designCode: dto.designCode ?? '',
    designName: dto.designName ?? '',
    customerAccount: dto.customerName ?? '',
    category: '',
    subCategory: '',
    material: '',
    purity: '',
    grossWeight: 0,
    netWeight: 0,
    stoneWeight: 0,
    makingCharge: 0,
    salesQuantity: Number(dto.salesQty) || 0,
    totalSalesValue: Number(dto.salesValue) || 0,
    pendingOrderQuantity: Number(dto.pendingOrders) || 0,
    pendingOrderValue: 0,
    inProcessingQuantity: Number(dto.pendingProcess) || 0,
    completedOrderQuantity: 0,
    currentStock: 0,
    availableStock: 0,
    reservedQuantity: 0,
    createdDate: '',
    designer: '',
    approvalStatus: 'Approved',
    salesStatus: 'Active',
    imageUrl: image,
    images: image ? [image] : [],
    isFavorite: false,
    isPinned: false,
  };
}

/** Normalize API thumbnail (already data-URL or raw base64) for <img [src]>. */
function toCardImageUrl(thumbnail: string | null | undefined): string {
  const raw = thumbnail?.trim() ?? '';
  if (!raw) return '';
  if (raw.startsWith('data:')) return raw;
  return `data:image/jpeg;base64,${raw}`;
}

/** Maps GET /api/dashboard/summary → existing KPI tile model. */
export function mapDashboardSummary(dto: DashboardSummaryDto): DashboardKpiSummary {
  const metrics = [
    {
      key: 'totalDesigns',
      label: 'Total Designs',
      value: dto.totalDesigns,
      growth: 0,
      trend: 'neutral' as const,
      icon: 'pi pi-box',
      gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      sparkline: [] as number[],
    },
    {
      key: 'totalSalesQty',
      label: 'Total Sales Qty',
      value: Number(dto.totalSalesQty) || 0,
      growth: 0,
      trend: 'neutral' as const,
      icon: 'pi pi-shopping-cart',
      gradient: 'linear-gradient(135deg, #0891b2, #0e7490)',
      sparkline: [] as number[],
    },
    {
      key: 'totalSalesValue',
      label: 'Total Sales Value',
      value: Number(dto.totalSalesValue) || 0,
      growth: 0,
      trend: 'neutral' as const,
      icon: 'pi pi-dollar',
      gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      sparkline: [] as number[],
      format: 'currency' as const,
    },
    {
      key: 'pendingOrders',
      label: 'Pending Orders',
      value: Number(dto.pendingOrders) || 0,
      growth: 0,
      trend: 'neutral' as const,
      icon: 'pi pi-inbox',
      gradient: 'linear-gradient(135deg, #d97706, #b45309)',
      sparkline: [] as number[],
    },
    {
      key: 'pendingOrderValue',
      label: 'Pending Order Value',
      value: Number(dto.pendingOrderValue) || 0,
      growth: 0,
      trend: 'neutral' as const,
      icon: 'pi pi-wallet',
      gradient: 'linear-gradient(135deg, #db2777, #be185d)',
      sparkline: [] as number[],
      format: 'currency' as const,
    },
    {
      key: 'inProcessing',
      label: 'In Processing',
      value: Number(dto.inProcessing) || 0,
      growth: 0,
      trend: 'neutral' as const,
      icon: 'pi pi-cog',
      gradient: 'linear-gradient(135deg, #16a34a, #15803d)',
      sparkline: [] as number[],
    },
    {
      key: 'completedOrders',
      label: 'Completed Orders',
      value: Number(dto.completedOrders) || 0,
      growth: 0,
      trend: 'neutral' as const,
      icon: 'pi pi-check-circle',
      gradient: 'linear-gradient(135deg, #059669, #047857)',
      sparkline: [] as number[],
    },
  ];

  return {
    metrics,
    lastUpdated: new Date().toLocaleString('en-IN'),
  };
}

/** Maps GET /api/dashboard/charts → existing analytics panel model. */
export function mapDashboardCharts(dto: DashboardChartsDto): DashboardAnalytics {
  const toPoints = (rows: { label: string; value: number }[] | undefined) =>
    (rows ?? []).map((r) => ({ label: r.label, value: Number(r.value) || 0 }));

  return {
    salesTrend: toPoints(dto.salesTrend),
    topCustomers: toPoints(dto.topCustomers),
    topCategories: toPoints(dto.topCategories),
    topMaterials: [],
    topDesigners: [],
    stockMovement: [],
    monthlyProduction: [],
    pendingOrders: [],
  };
}

export function sortDesignListItems(
  items: DesignListItem[],
  sortBy: SortField,
  sortOrder: SortOrder
): DesignListItem[] {
  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'designCode':
        cmp = a.designCode.localeCompare(b.designCode);
        break;
      case 'category':
        cmp = a.category.localeCompare(b.category);
        break;
      case 'status':
        cmp = a.approvalStatus.localeCompare(b.approvalStatus);
        break;
      case 'salesQuantity':
        cmp = a.salesQuantity - b.salesQuantity;
        break;
      case 'createdDate':
      default:
        cmp = a.designID - b.designID;
        break;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

export function paginateDesignListItems(
  items: DesignListItem[],
  page: number,
  pageSize: number
): DesignListItem[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function formatDisplayDate(value: string | Date | null | undefined): string {
  if (value == null || value === '') return NO_DATA;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function firstProduct(products: ProductDetailDto[] | undefined): ProductDetailDto | undefined {
  return products?.find((p) => p.active) ?? products?.[0];
}

function accountContact(dto: DesignDetailDto): string {
  const a = dto.accountDetails;
  if (!a) return NO_DATA;
  const parts = [a.telNo, a.email, a.gstNo].map((x) => x?.trim()).filter(Boolean);
  return parts.length ? parts.join(' · ') : a.accountName?.trim() || NO_DATA;
}

/**
 * Maps GET /api/design/{id} DesignDetailDto → existing DesignDetail popup model.
 * Only maps fields present on the API; missing tabs stay empty (UI shows No Data Available).
 */
export function mapDesignDetail(dto: DesignDetailDto): DesignDetail {
  const image = dto.imageThumbnail?.trim() || '';
  const product = firstProduct(dto.productDetails);
  const category = dto.categoryName?.trim() || NO_DATA;
  const customer = dto.customerName?.trim() || NO_DATA;
  const netWt = product?.netWt != null ? Number(product.netWt) : null;
  const barcode = product?.barCode?.trim() || 'Not Available';
  const material = product?.composition?.trim() || 'No Material Available';

  const base: DesignListItem = {
    designID: dto.designId,
    designCode: dto.designCode ?? '',
    designName: dto.designName ?? '',
    customerAccount: customer === NO_DATA ? '' : customer,
    category: category === NO_DATA ? '' : category,
    subCategory: '',
    material: product?.composition?.trim() || '',
    purity: '',
    grossWeight: 0,
    netWeight: netWt ?? 0,
    stoneWeight: 0,
    makingCharge: 0,
    salesQuantity: Number(dto.salesQty) || 0,
    totalSalesValue: Number(dto.salesValue) || 0,
    pendingOrderQuantity: Number(dto.pendingOrders) || 0,
    pendingOrderValue: 0,
    inProcessingQuantity: Number(dto.pendingProcess) || 0,
    completedOrderQuantity: 0,
    currentStock: 0,
    availableStock: 0,
    reservedQuantity: 0,
    createdDate: '',
    designer: '',
    approvalStatus: product?.active === false ? 'Inactive' : 'Approved',
    salesStatus: 'Active',
    imageUrl: image,
    images: image ? [image] : [],
    isFavorite: false,
    isPinned: false,
  };

  const orders: DesignOrderDetail[] = (dto.orders ?? []).map((o) => ({
    orderNo: o.orderNo ?? '',
    customer: o.customer ?? '',
    orderDate: formatDisplayDate(o.orderDate),
    quantity: Number(o.quantity) || 0,
    amount: Number(o.amount) || 0,
  }));

  return {
    ...base,
    general: {
      designCode: dto.designCode || NO_DATA,
      designName: dto.designName || NO_DATA,
      designID: dto.designId,
      barcode,
      customer,
      designer: NO_DATA,
      category,
      subCategory: NO_DATA,
      material,
      purity: NO_DATA,
      grossWeight: 0,
      netWeight: netWt ?? 0,
      stoneWeight: 0,
      makingCharge: 0,
      status: product?.active === false ? 'Inactive' : 'Approved',
      createdDate: NO_DATA,
      modifiedDate: accountContact(dto),
    },
    sales: {
      totalSalesQuantity: Number(dto.salesQty) || 0,
      totalSalesValue: Number(dto.salesValue) || 0,
      averageSellingPrice: Number(dto.averageSellingPrice) || 0,
      lastSoldDate: formatDisplayDate(dto.lastSoldDate),
      monthlySales: (dto.monthlySales ?? []).map((m) => ({
        month: m.label,
        quantity: Number(m.quantity) || 0,
        value: Number(m.value) || 0,
      })),
      yearlySales: (dto.yearlySales ?? []).map((y) => ({
        year: y.label,
        quantity: Number(y.quantity) || 0,
        value: Number(y.value) || 0,
      })),
    },
    orders,
    // No production / inventory fields on DesignDetailDto (loaded via tab APIs)
    production: {
      productionQuantity: 0,
      completedQuantity: 0,
      pendingQuantity: 0,
      rejectedQuantity: 0,
      productionDate: '',
      department: '',
      supervisor: '',
    },
    inventory: {
      currentStock: 0,
    },
  };
}
