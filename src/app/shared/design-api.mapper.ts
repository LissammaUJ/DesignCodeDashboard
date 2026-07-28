import {
  CustomerDto,
  CustomerSalesDto,
  DashboardSummaryDto,
  DesignDetailDto,
  ProductDetailDto,
} from '../models/api.models';
import {
  DashboardKpiSummary,
  DesignDetail,
  DesignListItem,
  DesignOrderDetail,
  SelectOption,
  SortField,
  SortOrder,
} from '../core/models/design.models';

const NO_DATA = 'No Data Available';

/** Maps GET /api/customer → filter dropdown options. */
export function mapCustomersToOptions(customers: CustomerDto[]): SelectOption[] {
  return customers.map((c) => ({
    label: c.accountName?.trim() || `Account ${c.accountId}`,
    value: String(c.accountId),
  }));
}

/** Maps GET /api/customer-sales → design card model. */
export function mapCustomerSalesToListItem(dto: CustomerSalesDto): DesignListItem {
  const image = toCardImageUrl(dto.imageThumbnail);
  return {
    designID: dto.designId,
    designCode: dto.designCode ?? '',
    designName: dto.designName ?? '',
    productName: dto.productName?.trim() || '',
    customerAccount: '',
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

function toCardImageUrl(thumbnail: string | null | undefined): string {
  const raw = thumbnail?.trim() ?? '';
  if (!raw) return '';
  if (raw.startsWith('data:')) return raw;
  return `data:image/jpeg;base64,${raw}`;
}

function kpi(
  key: string,
  label: string,
  value: number,
  icon: string,
  gradient: string,
  format?: 'currency'
) {
  return {
    key,
    label,
    value: Number(value) || 0,
    growth: 0,
    trend: 'neutral' as const,
    icon,
    gradient,
    ...(format ? { format } : {}),
  };
}

/** Maps GET /api/dashboard/summary → 9 KPI cards. */
export function mapDashboardSummary(dto: DashboardSummaryDto): DashboardKpiSummary {
  return {
    metrics: [
      kpi('totalDesigns', 'Total Designs', dto.totalDesigns, 'pi pi-box', 'linear-gradient(135deg, #2563eb, #1d4ed8)'),
      kpi(
        'totalOrderQty',
        'Total Order Quantity',
        dto.totalOrderQty,
        'pi pi-list',
        'linear-gradient(135deg, #0ea5e9, #0284c7)'
      ),
      kpi(
        'totalOrderSalesValue',
        'Total Order Sales Value',
        dto.totalOrderSalesValue,
        'pi pi-money-bill',
        'linear-gradient(135deg, #6366f1, #4f46e5)',
        'currency'
      ),
      kpi(
        'totalSalesQty',
        'Total Sales Quantity',
        dto.totalSalesQty,
        'pi pi-shopping-cart',
        'linear-gradient(135deg, #0891b2, #0e7490)'
      ),
      kpi(
        'totalSalesValue',
        'Total Sales Value',
        dto.totalSalesValue,
        'pi pi-dollar',
        'linear-gradient(135deg, #7c3aed, #6d28d9)',
        'currency'
      ),
      kpi(
        'pendingOrderValue',
        'Pending Order Value',
        dto.pendingOrderValue,
        'pi pi-wallet',
        'linear-gradient(135deg, #db2777, #be185d)',
        'currency'
      ),
      kpi(
        'pendingOrders',
        'Pending Quantity',
        dto.pendingOrders,
        'pi pi-inbox',
        'linear-gradient(135deg, #d97706, #b45309)'
      ),
      kpi(
        'inProcessing',
        'In Process Quantity',
        dto.inProcessing,
        'pi pi-cog',
        'linear-gradient(135deg, #16a34a, #15803d)'
      ),
      kpi(
        'completedOrders',
        'Completed Orders Quantity',
        dto.completedOrders,
        'pi pi-check-circle',
        'linear-gradient(135deg, #059669, #047857)'
      ),
    ],
    lastUpdated: new Date().toLocaleString('en-IN'),
  };
}

export function sortDesignListItems(
  items: DesignListItem[],
  sortBy: SortField,
  sortOrder: SortOrder
): DesignListItem[] {
  return [...items].sort((a, b) => {
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

/** Maps GET /api/design/{id} → design detail dialog model. */
export function mapDesignDetail(dto: DesignDetailDto): DesignDetail {
  const image = dto.imageThumbnail?.trim() || '';
  const product = firstProduct(dto.productDetails);
  const category = dto.categoryName?.trim() || NO_DATA;
  const productName = product?.productName?.trim() || NO_DATA;
  const netWt = product?.netWt != null ? Number(product.netWt) : null;
  const material = product?.composition?.trim() || 'No Material Available';
  const currentStock = Number(dto.inventory?.[0]?.currentStock) || 0;
  const status = product?.active === false ? ('Inactive' as const) : ('Approved' as const);

  const base: DesignListItem = {
    designID: dto.designId,
    designCode: dto.designCode ?? '',
    designName: dto.designName ?? '',
    productName: productName === NO_DATA ? '' : productName,
    customerAccount: '',
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
    currentStock,
    availableStock: 0,
    reservedQuantity: 0,
    createdDate: '',
    designer: '',
    approvalStatus: status,
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
      productName,
      category,
      material,
      netWeight: netWt ?? 0,
      status,
      currentQuantity: currentStock,
    },
    sales: {
      totalSalesQuantity: Number(dto.salesQty) || 0,
      totalSalesValue: Number(dto.salesValue) || 0,
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
    production: (dto.production ?? []).map((row, index) => ({
      productionDate: row.productionDate ?? null,
      location: row.location?.trim() || '—',
      producedQuantity: Number(row.producedQuantity) || 0,
      requiredQuantity: Number(row.requiredQuantity) || 0,
      rowKey: `${dto.designId}-${index}`,
    })),
    inventory: { currentStock },
  };
}
