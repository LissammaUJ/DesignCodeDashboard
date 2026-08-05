/** POST /api/auth/login request body. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** POST /api/auth/login success response. */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  username: string;
}
