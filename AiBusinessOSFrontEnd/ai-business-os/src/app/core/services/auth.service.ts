import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  AuthUser,
  AuthState,
  OtpVerifyRequest,
  OtpVerifyResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../models/auth';

const AUTH_STORAGE_KEY = 'app-auth-token';
const AUTH_USER_KEY = 'app-auth-user';
const API_URL = '/api/auth'; // Update this to your API base URL

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authState = signal<AuthState>({
    user: this.loadUserFromStorage(),
    token: this.loadTokenFromStorage(),
    isAuthenticated: !!this.loadTokenFromStorage(),
    isLoading: false,
    error: null,
    otpSent: false,
    otpVerified: false
  });

  public state$ = this.authState.asReadonly();
  public user$ = computed(() => this.authState().user);
  public isAuthenticated$ = computed(() => this.authState().isAuthenticated);
  public isLoading$ = computed(() => this.authState().isLoading);
  public error$ = computed(() => this.authState().error);

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication on app load
   */
  private initializeAuth(): void {
    const token = this.loadTokenFromStorage();
    const user = this.loadUserFromStorage();

    if (token && user) {
      this.authState.update(state => ({
        ...state,
        token,
        user,
        isAuthenticated: true
      }));
    }
  }

  /**
   * Load token from localStorage
   */
  private loadTokenFromStorage(): string | null {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Load user from localStorage
   */
  private loadUserFromStorage(): AuthUser | null {
    try {
      const data = localStorage.getItem(AUTH_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthData(token: string, user: AuthUser): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save auth data:', e);
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.warn('Failed to clear auth data:', e);
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.authState().token;
  }

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    return this.authState().user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  /**
   * Login with email and password
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    this.authState.update(state => ({ ...state, isLoading: true, error: null }));

    return this.http.post<LoginResponse>(`${API_URL}/login`, request).pipe(
      tap(response => {
        this.saveAuthData(response.token, response.user);
        this.authState.update(state => ({
          ...state,
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          refreshToken: response.refreshToken || null
        }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Login failed';
        this.authState.update(state => ({
          ...state,
          error: errorMessage,
          isLoading: false
        }));
        return throwError(() => error);
      })
    );
  }

  /**
   * Sign up with email and password
   */
  signup(request: SignupRequest): Observable<SignupResponse> {
    this.authState.update(state => ({ ...state, isLoading: true, error: null }));

    return this.http.post<SignupResponse>(`${API_URL}/signup`, request).pipe(
      tap(response => {
        this.saveAuthData(response.token, response.user);
        this.authState.update(state => ({
          ...state,
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false
        }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Signup failed';
        this.authState.update(state => ({
          ...state,
          error: errorMessage,
          isLoading: false
        }));
        return throwError(() => error);
      })
    );
  }

  /**
   * Send OTP for verification
   */
  sendOtp(email: string): Observable<{ message: string }> {
    this.authState.update(state => ({ ...state, isLoading: true, error: null }));

    return this.http.post<{ message: string }>(`${API_URL}/send-otp`, { email }).pipe(
      tap(() => {
        this.authState.update(state => ({
          ...state,
          otpSent: true,
          isLoading: false
        }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Failed to send OTP';
        this.authState.update(state => ({
          ...state,
          error: errorMessage,
          isLoading: false
        }));
        return throwError(() => error);
      })
    );
  }

  /**
   * Verify OTP
   */
  verifyOtp(request: OtpVerifyRequest): Observable<OtpVerifyResponse> {
    this.authState.update(state => ({ ...state, isLoading: true, error: null }));

    return this.http.post<OtpVerifyResponse>(`${API_URL}/verify-otp`, request).pipe(
      tap(response => {
        const isVerified = response.verified;
        const token = response.token;
        const user = response.user;

        this.authState.update(state => ({
          ...state,
          otpVerified: isVerified,
          isLoading: false
        }));

        if (isVerified && token && user) {
          this.saveAuthData(token, user);
          this.authState.update(state => ({
            ...state,
            user,
            token,
            isAuthenticated: true
          }));
        }
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'OTP verification failed';
        this.authState.update(state => ({
          ...state,
          error: errorMessage,
          isLoading: false
        }));
        return throwError(() => error);
      })
    );
  }

  /**
   * Request password reset
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    this.authState.update(state => ({ ...state, isLoading: true, error: null }));

    return this.http.post<{ message: string }>(`${API_URL}/forgot-password`, request).pipe(
      tap(() => {
        this.authState.update(state => ({
          ...state,
          isLoading: false
        }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Failed to send reset email';
        this.authState.update(state => ({
          ...state,
          error: errorMessage,
          isLoading: false
        }));
        return throwError(() => error);
      })
    );
  }

  /**
   * Reset password with token
   */
  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    this.authState.update(state => ({ ...state, isLoading: true, error: null }));

    return this.http.post<{ message: string }>(`${API_URL}/reset-password`, request).pipe(
      tap(() => {
        this.authState.update(state => ({
          ...state,
          isLoading: false
        }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Password reset failed';
        this.authState.update(state => ({
          ...state,
          error: errorMessage,
          isLoading: false
        }));
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    this.clearAuthData();
    this.authState.set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      otpSent: false,
      otpVerified: false
    });
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.authState.update(state => ({ ...state, error: null }));
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<{ token: string; refreshToken?: string }> {
    return this.http.post<{ token: string; refreshToken?: string }>(`${API_URL}/refresh-token`, {}).pipe(
      tap(response => {
        this.authState.update(state => ({
          ...state,
          token: response.token,
          refreshToken: response.refreshToken || null
        }));
        localStorage.setItem(AUTH_STORAGE_KEY, response.token);
      }),
      catchError(error => {
        // If refresh fails, log out user
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(user: Partial<AuthUser>): Observable<AuthUser> {
    return this.http.put<AuthUser>(`${API_URL}/profile`, user).pipe(
      tap(updatedUser => {
        this.authState.update(state => ({
          ...state,
          user: updatedUser
        }));
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Failed to update profile';
        this.authState.update(state => ({
          ...state,
          error: errorMessage
        }));
        return throwError(() => error);
      })
    );
  }
}
