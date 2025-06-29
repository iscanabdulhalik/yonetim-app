export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "site_admin" | "resident";
  siteId: string;
  siteCode: string;
  building?: string;
  unitNumber?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  siteCode?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  building?: string;
  unitNumber: string;
  siteCode: string;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  siteId: string;
  iat?: number;
  exp?: number;
}
