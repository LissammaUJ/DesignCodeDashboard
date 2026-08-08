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
import { displayDash } from './api.utils';

const NO_DATA = 'No Data Available';

/** Maps GET /api/customer → filter dropdown options. */
export function mapCustomersToOptions(customers: CustomerDto[]): SelectOption[] {
  return customers.map((c) => ({
    label: c.accountName?.trim() || `Account ${c.accountId}`,
    value: String(c.accountId),
  }));
}

/** Coerce API numeric fields (number | string | PascalCase) to a finite quantity. */
function toQty(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

/** Maps GET /api/customer-sales → one card per product. */
export function mapCustomerSalesToListItem(dto: CustomerSalesDto): DesignListItem {
  const row = dto as CustomerSalesDto & Record<string, unknown>;
  const image = toCardImageUrl(dto.imageThumbnail);

  // Prefer typed DTO fields first (HttpClient JSON), then PascalCase fallbacks.
  // pendingOrder  → pendingOrder + pendingOrderQuantity
  // pendingProcess → inProcess + inProcessingQuantity
  const apiPendingOrder = dto.pendingOrder ?? row['pendingOrder'] ?? row['PendingOrder'];
  const apiPendingProcess = dto.pendingProcess ?? row['pendingProcess'] ?? row['PendingProcess'];
  const pendingOrder = toQty(apiPendingOrder);
  const inProcess = toQty(apiPendingProcess);

  const card: DesignListItem = {
    designID: toQty(dto.designId ?? row['designId'] ?? row['DesignId']),
    productId: toQty(dto.productId ?? row['productId'] ?? row['ProductId']),
    designCode: dto.designCode ?? '',
    designName: dto.designName ?? '',
    productName: dto.productName?.trim() || '-',
    customerAccount: '',
    category: '',
    subCategory: '',
    material: '',
    purity: '',
    grossWeight: 0,
    netWeight: 0,
    stoneWeight: 0,
    makingCharge: 0,
    salesQuantity: toQty(dto.totalSalesQty ?? row['totalSalesQty'] ?? row['TotalSalesQty']),
    totalSalesValue: toQty(dto.totalSalesAmount ?? row['totalSalesAmount'] ?? row['TotalSalesAmount']),
    pendingOrder,
    pendingOrderQuantity: pendingOrder,
    pendingOrderValue: 0,
    inProcess,
    inProcessingQuantity: inProcess,
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

  if (card.productId === 257) {
    console.log('[mapCustomerSalesToListItem product 257]', {
      dtoKeys: Object.keys(row),
      api: {
        pendingOrder: apiPendingOrder,
        pendingProcess: apiPendingProcess,
        pendingProcessEquals1190: apiPendingProcess === 1190 || Number(apiPendingProcess) === 1190,
      },
      mapped: {
        pendingOrder: card.pendingOrder,
        pendingOrderQuantity: card.pendingOrderQuantity,
        inProcess: card.inProcess,
        inProcessingQuantity: card.inProcessingQuantity,
        inProcessEquals1190: card.inProcess === 1190,
      },
    });
  }

  return card;
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
      kpi('totalProducts', 'Total Products', dto.totalProducts, 'pi pi-box', 'linear-gradient(135deg, #2563eb, #1d4ed8)'),
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
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function firstProduct(products: ProductDetailDto[] | undefined): ProductDetailDto | undefined {
  // API puts the requested ProductId first; prefer that over another active sibling.
  return products?.find((p) => Number(p.productId) > 0) ?? products?.[0];
}

/** Read camelCase or PascalCase array from API JSON (HttpClient does not rename keys). */
function readApiArray(dto: object, camel: string, pascal: string): Record<string, unknown>[] {
  const row = dto as Record<string, unknown>;
  const raw = row[camel] ?? row[pascal];
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

function readApiField(row: Record<string, unknown>, camel: string, pascal: string): unknown {
  return row[camel] ?? row[pascal];
}

/** Maps GET /api/design/{id} → design detail dialog model. */
export function mapDesignDetail(dto: DesignDetailDto): DesignDetail {
  // Detail image = GetProductHeader.ImgThumbData only (same design thumb as card for that ProductId).
  const image = toCardImageUrl(dto.imageThumbnail);
  const product =
    dto.productDetails?.find((p) => Number(p.productId) === Number(dto.productId)) ??
    firstProduct(dto.productDetails);

  // General Information — header fields from API (GetProductHeader), not invented "-"/0.
  const productName = dto.productName?.trim() || product?.productName?.trim() || '';
  const category = dto.categoryName?.trim() || '';
  const material = dto.material?.trim() || product?.composition?.trim() || '';
  const netWt =
    dto.netWeight != null && Number.isFinite(Number(dto.netWeight))
      ? Number(dto.netWeight)
      : product?.netWt != null
        ? Number(product.netWt)
        : null;
  const currentQuantity =
    dto.currentQuantity != null && Number.isFinite(Number(dto.currentQuantity))
      ? Number(dto.currentQuantity)
      : null;
  // Inventory stock: GetInventory row only — never invent a stock value when SP returned no row.
  const invRow = dto.inventory?.[0] as Record<string, unknown> | undefined;
  const invRaw =
    invRow != null ? Number(invRow['currentStock'] ?? invRow['CurrentStock']) : Number.NaN;
  const hasInventory = Number.isFinite(invRaw);
  const currentStock = hasInventory ? invRaw : 0;
  const status = product?.active === false ? ('Inactive' as const) : ('Approved' as const);
  const customerName = dto.customerName?.trim() || dto.accountDetails?.accountName?.trim() || '';

  const pendingOrder = toQty(dto.pendingOrders);
  const inProcess = toQty(dto.pendingProcess);

  const base: DesignListItem = {
    designID: dto.designId,
    productId: Number(dto.productId) || Number(product?.productId) || 0,
    designCode: dto.designCode ?? '',
    designName: dto.designName ?? '',
    productName,
    customerAccount: customerName,
    category,
    subCategory: '',
    material,
    purity: '',
    grossWeight: 0,
    netWeight: netWt ?? 0,
    stoneWeight: 0,
    makingCharge: 0,
    salesQuantity: Number(dto.salesQty) || 0,
    totalSalesValue: Number(dto.salesValue) || 0,
    pendingOrderQuantity: pendingOrder,
    pendingOrderValue: 0,
    inProcessingQuantity: inProcess,
    pendingOrder,
    inProcess,
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

  // Prefer typed `orders`; fall back to PascalCase `Orders` (same pattern as card KPIs).
  const orders: DesignOrderDetail[] = readApiArray(dto, 'orders', 'Orders').map((o) => {
    const orderDate = readApiField(o, 'orderDate', 'OrderDate');
    return {
      orderNo: String(readApiField(o, 'orderNo', 'OrderNo') ?? ''),
      customer: String(readApiField(o, 'customer', 'Customer') ?? ''),
      orderDate: formatDisplayDate(
        orderDate instanceof Date || typeof orderDate === 'string' ? orderDate : null
      ),
      quantity: toQty(readApiField(o, 'quantity', 'Quantity')),
      amount: toQty(readApiField(o, 'amount', 'Amount')),
    };
  });

  return {
    ...base,
    customerName: customerName || displayDash(customerName, '-'),
    general: {
      productName: productName || displayDash(productName, NO_DATA),
      category: category || displayDash(category, NO_DATA),
      material: material || displayDash(material, '-'),
      netWeight: netWt ?? 0,
      status,
      // General stock = GetProductHeader.CurrentQuantity; inventory.currentStock = GetInventory only.
      currentQuantity: currentQuantity ?? (hasInventory ? currentStock : 0),
    },
    sales: {
      totalSalesQuantity: Number(dto.salesQty) || 0,
      totalSalesValue: Number(dto.salesValue) || 0,
      lastSoldDate: formatDisplayDate(dto.lastSoldDate),
      monthlySales: readApiArray(dto, 'monthlySales', 'MonthlySales').map((m) => ({
        month: String(readApiField(m, 'label', 'Label') ?? ''),
        quantity: toQty(readApiField(m, 'quantity', 'Quantity')),
        value: toQty(readApiField(m, 'value', 'Value')),
      })),
      yearlySales: readApiArray(dto, 'yearlySales', 'YearlySales').map((y) => ({
        year: String(readApiField(y, 'label', 'Label') ?? ''),
        quantity: toQty(readApiField(y, 'quantity', 'Quantity')),
        value: toQty(readApiField(y, 'value', 'Value')),
      })),
    },
    orders,
    production: readApiArray(dto, 'production', 'Production')
      .filter((row) => {
        const loc = String(readApiField(row, 'location', 'Location') ?? '').trim();
        const produced = toQty(readApiField(row, 'producedQuantity', 'ProducedQuantity'));
        const required = toQty(readApiField(row, 'requiredQuantity', 'RequiredQuantity'));
        const isPlaceholder =
          (loc === '' || loc === '-' || loc === '—') && produced === 0 && required === 0;
        return !isPlaceholder;
      })
      .map((row, index) => {
        const productionDate = readApiField(row, 'productionDate', 'ProductionDate');
        return {
          productionDate:
            productionDate instanceof Date
              ? productionDate.toISOString()
              : typeof productionDate === 'string'
                ? productionDate
                : null,
          location: String(readApiField(row, 'location', 'Location') ?? '').trim(),
          producedQuantity: toQty(readApiField(row, 'producedQuantity', 'ProducedQuantity')),
          requiredQuantity: toQty(readApiField(row, 'requiredQuantity', 'RequiredQuantity')),
          rowKey: `${dto.designId}-${index}`,
        };
      }),
    inventory: { currentStock: hasInventory ? currentStock : 0 },
  };
}
