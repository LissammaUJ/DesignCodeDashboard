export interface CompanyOption {
  coId: number;
  coName: string;
}

export interface LoginRequest {
  emplCode: string;
  password: string;
  companyId: number;
  companyName?: string;
}

export interface ChangeCompanyRequest {
  companyId: number;
  companyName?: string;
}

export interface EmployeeLogin {
  emplId: number;
  emplCode: string;
  emplName: string;
  admin?: boolean;
  auditor?: boolean;
  designation?: string;
  profilePic?: string;
  gender?: string;
  dashboardEnabled?: boolean;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  employee?: EmployeeLogin | null;
  company?: CompanyOption | null;
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  username: string;
}
