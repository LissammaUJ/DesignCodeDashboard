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
  /** Incoming card ProductId */
  productId: number;
  designId: number;
  designCode: string;
  designName: string;
  customerName: string;
  /** GetProductHeader.ImgThumbData */
  imageThumbnail: string | null;
  /** GetProductHeader general fields */
  productName?: string | null;
  categoryName?: string | null;
  material?: string | null;
  netWeight?: number | null;
  currentQuantity?: number | null;
  salesQty: number;
  salesValue: number;
  pendingOrders: number;
  pendingProcess: number;
  lastSoldDate?: string | null;
  /** GetProductsByDesign only */
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
  totalProducts: number;
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

/** One card per product from GET /api/customer-sales (DesignId may repeat). */
export interface CustomerSalesDto {
  designId: number;
  designCode: string;
  designName: string;
  /** Unique card key */
  productId: number;
  productName?: string;
  totalSalesQty: number;
  totalSalesAmount: number;
  pendingOrder: number;
  pendingProcess: number;
  /** ItemDesign.ImgThumbData — same image for all products of a design */
  imageThumbnail?: string | null;
}
