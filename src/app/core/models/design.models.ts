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
  sparkline: number[];
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
  designCode: string;
  designName: string;
  designID: number;
  barcode: string;
  customer: string;
  designer: string;
  category: string;
  subCategory: string;
  material: string;
  purity: string;
  grossWeight: number;
  netWeight: number;
  stoneWeight: number;
  makingCharge: number;
  status: ApprovalStatus;
  createdDate: string;
  modifiedDate: string;
}

export interface DesignSalesInfo {
  totalSalesQuantity: number;
  totalSalesValue: number;
  averageSellingPrice: number;
  lastSoldDate: string;
  bestCustomer: string;
  topSellingBranch: string;
  monthlySales: { month: string; quantity: number; value: number }[];
  yearlySales: { year: string; quantity: number; value: number }[];
}

export interface DesignOrderDetail {
  orderNo: string;
  customer: string;
  orderDate: string;
  deliveryDate: string;
  quantity: number;
  pendingQuantity: number;
  amount: number;
  status: string;
  processingStage: string;
  expectedDelivery: string;
}

export interface DesignProductionInfo {
  productionQuantity: number;
  completedQuantity: number;
  pendingQuantity: number;
  rejectedQuantity: number;
  productionDate: string;
  /** Raw ISO date from API for status calculations (Delayed). */
  productionDateRaw: string | null;
  department: string;
  supervisor: string;
}

export interface DesignInventoryInfo {
  currentStock: number;
}

export interface DesignDetail extends DesignListItem {
  general: DesignGeneralInfo;
  sales: DesignSalesInfo;
  orders: DesignOrderDetail[];
  production: DesignProductionInfo;
  inventory: DesignInventoryInfo;
}

export interface DashboardAnalytics {
  salesTrend: { label: string; value: number }[];
  topCustomers: { label: string; value: number }[];
  topCategories: { label: string; value: number }[];
  topMaterials: { label: string; value: number }[];
  topDesigners: { label: string; value: number }[];
  stockMovement: { label: string; value: number }[];
  monthlyProduction: { label: string; value: number }[];
  pendingOrders: { label: string; value: number }[];
}
