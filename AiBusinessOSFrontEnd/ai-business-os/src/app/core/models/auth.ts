import { Role } from './index';

export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

/** Matches AiBusinessOS.Api AuthTokenResponse (camelCase JSON). */
export interface AuthTokenApiResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  refreshToken?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  agreesToTerms: boolean;
}

export interface SignupResponse {
  user: AuthUser;
  token: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: Role;
  organizationId: string;
  status: 'active' | 'inactive' | 'pending_verification';
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
  token?: string;
  user?: AuthUser;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  otpVerified: boolean;
}
