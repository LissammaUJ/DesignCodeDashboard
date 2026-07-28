export type ApprovalStatus = 'Approved' | 'Pending' | 'Rejected' | 'Inactive';
export type SalesStatus = 'Active' | 'Discontinued' | 'Seasonal' | 'New';
export type SortField = 'designCode' | 'createdDate' | 'category' | 'status' | 'salesQuantity';
export type SortOrder = 'asc' | 'desc';

export interface SelectOption {
  label: string;
  value: string;
}

export interface DesignFilter {
  customerAccountId?: number;
  startDate?: string;
  endDate?: string;
}

export interface DesignQuery {
  page: number;
  pageSize: number;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export interface CardKpiItem {
  label: string;
  value: string;
  icon: string;
  colorClass: string;
  tooltip: string;
}

export interface DesignListItem {
  designID: number;
  designCode: string;
  designName: string;
  productName: string;
  customerAccount: string;
  category: string;
  subCategory: string;
  material: string;
  purity: string;
  grossWeight: number;
  netWeight: number;
  stoneWeight: number;
  makingCharge: number;
  salesQuantity: number;
  totalSalesValue: number;
  pendingOrderQuantity: number;
  pendingOrderValue: number;
  inProcessingQuantity: number;
  completedOrderQuantity: number;
  currentStock: number;
  availableStock: number;
  reservedQuantity: number;
  createdDate: string;
  designer: string;
  approvalStatus: ApprovalStatus;
  salesStatus: SalesStatus;
  imageUrl: string;
  images: string[];
  isFavorite: boolean;
  isPinned: boolean;
}

export interface KpiMetric {
  key: string;
  label: string;
  value: number | string;
  growth: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  gradient: string;
  sparkline?: number[];
  format?: 'number' | 'currency' | 'datetime';
}

export interface DashboardKpiSummary {
  metrics: KpiMetric[];
  lastUpdated: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  page: number;
  pageSize: number;
}

export interface DesignGeneralInfo {
  productName: string;
  category: string;
  material: string;
  netWeight: number;
  status: ApprovalStatus;
  currentQuantity: number;
}

export interface DesignSalesInfo {
  totalSalesQuantity: number;
  totalSalesValue: number;
  lastSoldDate: string;
  monthlySales: { month: string; quantity: number; value: number }[];
  yearlySales: { year: string; quantity: number; value: number }[];
}

export interface DesignOrderDetail {
  orderNo: string;
  customer: string;
  orderDate: string;
  quantity: number;
  amount: number;
}

export interface DesignProductionRow {
  productionDate: string | null;
  location: string;
  producedQuantity: number;
  requiredQuantity: number;
  /** Stable client key for PrimeNG table (not from API). */
  rowKey?: string;
}

export interface DesignInventoryInfo {
  currentStock: number;
}

export interface DesignDetail extends DesignListItem {
  general: DesignGeneralInfo;
  sales: DesignSalesInfo;
  orders: DesignOrderDetail[];
  production: DesignProductionRow[];
  inventory: DesignInventoryInfo;
}
