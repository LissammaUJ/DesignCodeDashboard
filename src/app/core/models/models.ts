export type DesignStatus = 'Approved' | 'Pending' | 'Rejected' | 'Inactive';

export type SortField = 'designCode' | 'createdDate' | 'category' | 'status';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'card' | 'table';

export interface DesignSummary {
  totalDesigns: number;
  approved: number;
  pending: number;
  rejected: number;
  inactive: number;
}

export interface Design {
  designID: number;
  designCode: string;
  designName: string;
  customerAccount: string;
  category: string;
  subCategory: string;
  material: string;
  purity: string;
  weight: number;
  status: DesignStatus;
  createdDate: string;
  imageUrl: string;
}

export interface DesignFilterRequest {
  customerAccountId: number;
  startDate: string;
  endDate: string;
}

export interface DesignQueryParams {
  page: number;
  pageSize: number;
  sortBy: SortField;
  sortOrder: SortOrder;
  searchTerm: string;
}

export interface DesignDashboardResponse {
  summary: DesignSummary;
  designs: Design[];
  totalRecords: number;
}

export interface CustomerAccount {
  id: number;
  name: string;
}
