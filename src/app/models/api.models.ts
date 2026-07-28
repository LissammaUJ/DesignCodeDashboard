/** Request filter used by designs / dashboard endpoints. */
export interface DesignFilterRequest {
  customerAccountId: number;
  startDate: string;
  endDate: string;
}

export interface CustomerDto {
  accountId: number;
  accountName: string;
}

export interface ProductDetailDto {
  productId: number;
  productName: string;
  barCode: string | null;
  netWt: number | null;
  composition: string | null;
  active: boolean;
}

export interface AccountDetailDto {
  accountId: number;
  accountName: string;
  accountCode: string | null;
  address: string | null;
  email: string | null;
  telNo: string | null;
  gstNo: string | null;
}

export interface DesignOrderDto {
  orderNo: string;
  customer: string;
  orderDate: string | null;
  deliveryDate: string | null;
  quantity: number;
  pendingQuantity: number;
  amount: number;
  status: string;
  processingStage: string;
}

export interface DesignSalesPointDto {
  label: string;
  quantity: number;
  value: number;
}

export interface DesignDetailDto {
  designId: number;
  designCode: string;
  designName: string;
  customerName: string;
  imageThumbnail: string | null;
  categoryName?: string | null;
  salesQty: number;
  salesValue: number;
  pendingOrders: number;
  pendingProcess: number;
  lastSoldDate?: string | null;
  productDetails: ProductDetailDto[];
  accountDetails: AccountDetailDto | null;
  orders?: DesignOrderDto[];
  monthlySales?: DesignSalesPointDto[];
  yearlySales?: DesignSalesPointDto[];
  production?: DesignProductionDto[];
  inventory?: DesignInventoryDto[];
}

/** GET /api/designs/{designId}/production — production grid row */
export interface DesignProductionDto {
  productionDate: string | null;
  location: string;
  producedQuantity: number;
  requiredQuantity: number;
}

/** GET /api/designs/{designId}/inventory */
export interface DesignInventoryDto {
  currentStock: number;
}

export interface DashboardSummaryDto {
  totalDesigns: number;
  totalOrderQty: number;
  totalOrderSalesValue: number;
  totalSalesQty: number;
  totalSalesValue: number;
  pendingOrders: number;
  pendingOrderValue: number;
  inProcessing: number;
  completedOrders: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  details?: string | null;
  timestamp?: string;
}

/** Exact shape from company sales SQL /api/customer-sales */
export interface CustomerSalesDto {
  designId: number;
  designCode: string;
  designName: string;
  productName?: string;
  totalSalesQty: number;
  totalSalesAmount: number;
  pendingOrder: number;
  pendingProcess: number;
  /** ItemDesign.ImgThumbData as data:image/jpeg;base64,... */
  imageThumbnail?: string | null;
}
