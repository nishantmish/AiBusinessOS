import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, finalize, shareReplay, map, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
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
  ResetPasswordRequest,
  AuthTokenApiResponse,
} from '../models/auth';
import { authUserFromAccessToken, isJwtExpired } from '../utils/jwt';

const AUTH_ACCESS_KEY = 'app-access-token';
const AUTH_REFRESH_KEY = 'app-refresh-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiBase = `${environment.apiBaseUrl}/v1.0`;

  private authState = signal<AuthState>({
    user: null,
    token: this.loadAccessToken(),
    isAuthenticated: false,
    isLoading: false,
    error: null,
    otpSent: false,
    otpVerified: false,
    refreshToken: this.loadRefreshToken(),
  });

  public state$ = this.authState.asReadonly();
  public user$ = computed(() => this.authState().user);
  public isAuthenticated$ = computed(() => this.authState().isAuthenticated);
  public isLoading$ = computed(() => this.authState().isLoading);
  public error$ = computed(() => this.authState().error);

  private refreshInFlight$: Observable<void> | null = null;

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const access = this.loadAccessToken();
    const refresh = this.loadRefreshToken();

    if (access && !isJwtExpired(access)) {
      const user = authUserFromAccessToken(access);
      if (user) {
        this.authState.update(s => ({
          ...s,
          token: access,
          refreshToken: refresh,
          user,
          isAuthenticated: true,
        }));
        return;
      }
    }

    if (refresh) {
      this.refreshAccessToken().subscribe({
        error: () => this.logoutLocal(),
      });
    }
  }

  private loadAccessToken(): string | null {
    try {
      return sessionStorage.getItem(AUTH_ACCESS_KEY);
    } catch {
      return null;
    }
  }

  private loadRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(AUTH_REFRESH_KEY);
    } catch {
      return null;
    }
  }

  private persistTokens(response: AuthTokenApiResponse): void {
    try {
      sessionStorage.setItem(AUTH_ACCESS_KEY, response.accessToken);
      sessionStorage.setItem(AUTH_REFRESH_KEY, response.refreshToken);
    } catch (e) {
      console.warn('Failed to persist tokens:', e);
    }

    const user = authUserFromAccessToken(response.accessToken);
    this.authState.update(s => ({
      ...s,
      token: response.accessToken,
      refreshToken: response.refreshToken,
      user,
      isAuthenticated: !!user,
      error: null,
    }));
  }

  private clearStorage(): void {
    try {
      sessionStorage.removeItem(AUTH_ACCESS_KEY);
      sessionStorage.removeItem(AUTH_REFRESH_KEY);
    } catch (e) {
      console.warn('Failed to clear auth storage:', e);
    }
  }

  getToken(): string | null {
    return this.authState().token;
  }

  getRefreshToken(): string | null {
    return this.authState().refreshToken ?? this.loadRefreshToken();
  }

  getUser(): AuthUser | null {
    return this.authState().user;
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    this.authState.update(s => ({ ...s, isLoading: true, error: null }));

    const body: { email: string; password: string; tenantId?: string } = {
      email: request.email.trim(),
      password: request.password,
    };
    if (request.tenantId) {
      body.tenantId = request.tenantId;
    }

    return this.http.post<AuthTokenApiResponse>(`${this.apiBase}/auth/login`, body).pipe(
      tap(res => this.persistTokens(res)),
      map((res): LoginResponse => {
        const user = authUserFromAccessToken(res.accessToken);
        if (!user) {
          throw new Error('Invalid access token');
        }
        return {
          token: res.accessToken,
          user,
          refreshToken: res.refreshToken,
        };
      }),
      tap(() => {
        this.authState.update(s => ({ ...s, isLoading: false }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Login failed';
        this.authState.update(s => ({
          ...s,
          error: errorMessage,
          isLoading: false,
        }));
        return throwError(() => error);
      })
    );
  }

  /**
   * Rotates refresh token; used by interceptor on 401 and on cold start when access JWT expired.
   */
  refreshAccessToken(): Observable<void> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    this.refreshInFlight$ = this.http
      .post<AuthTokenApiResponse>(`${this.apiBase}/auth/refresh`, { refreshToken })
      .pipe(
        tap(res => this.persistTokens(res)),
        map(() => undefined),
        catchError(err => {
          this.logoutLocal();
          return throwError(() => err);
        }),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshInFlight$;
  }

  /** Clears session without calling the API (e.g. after failed refresh). */
  logoutLocal(): void {
    this.clearStorage();
    this.authState.set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      otpSent: false,
      otpVerified: false,
      refreshToken: null,
    });
  }

  /**
   * Revokes refresh token on the server (when possible), then clears the local session.
   */
  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    const access = this.getToken();

    if (refreshToken && access) {
      return this.http
        .post(`${this.apiBase}/auth/revoke`, { refreshToken, reason: 'logout' }, {
          headers: { Authorization: `Bearer ${access}` },
        })
        .pipe(
          map(() => undefined),
          catchError(() => of(void 0)),
          tap(() => this.logoutLocal())
        );
    }

    this.logoutLocal();
    return of(void 0);
  }

  clearError(): void {
    this.authState.update(s => ({ ...s, error: null }));
  }

  signup(request: SignupRequest): Observable<SignupResponse> {
    this.authState.update(s => ({ ...s, isLoading: true, error: null }));

    return this.http.post<SignupResponse>(`${this.apiBase}/auth/signup`, request).pipe(
      tap(response => {
        try {
          sessionStorage.setItem(AUTH_ACCESS_KEY, response.token);
        } catch {
          /* ignore */
        }
        this.authState.update(s => ({
          ...s,
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Signup failed';
        this.authState.update(s => ({
          ...s,
          error: errorMessage,
          isLoading: false,
        }));
        return throwError(() => error);
      })
    );
  }

  sendOtp(email: string): Observable<{ message: string }> {
    this.authState.update(s => ({ ...s, isLoading: true, error: null }));

    return this.http.post<{ message: string }>(`${this.apiBase}/auth/send-otp`, { email }).pipe(
      tap(() => {
        this.authState.update(s => ({
          ...s,
          otpSent: true,
          isLoading: false,
        }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Failed to send OTP';
        this.authState.update(s => ({
          ...s,
          error: errorMessage,
          isLoading: false,
        }));
        return throwError(() => error);
      })
    );
  }

  verifyOtp(request: OtpVerifyRequest): Observable<OtpVerifyResponse> {
    this.authState.update(s => ({ ...s, isLoading: true, error: null }));

    return this.http.post<OtpVerifyResponse>(`${this.apiBase}/auth/verify-otp`, request).pipe(
      tap(response => {
        const isVerified = response.verified;
        const token = response.token;
        const user = response.user;

        this.authState.update(s => ({
          ...s,
          otpVerified: isVerified,
          isLoading: false,
        }));

        if (isVerified && token && user) {
          try {
            sessionStorage.setItem(AUTH_ACCESS_KEY, token);
          } catch {
            /* ignore */
          }
          this.authState.update(s => ({
            ...s,
            user,
            token,
            isAuthenticated: true,
          }));
        }
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'OTP verification failed';
        this.authState.update(s => ({
          ...s,
          error: errorMessage,
          isLoading: false,
        }));
        return throwError(() => error);
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    this.authState.update(s => ({ ...s, isLoading: true, error: null }));

    return this.http.post<{ message: string }>(`${this.apiBase}/auth/forgot-password`, request).pipe(
      tap(() => {
        this.authState.update(s => ({ ...s, isLoading: false }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Failed to send reset email';
        this.authState.update(s => ({
          ...s,
          error: errorMessage,
          isLoading: false,
        }));
        return throwError(() => error);
      })
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    this.authState.update(s => ({ ...s, isLoading: true, error: null }));

    return this.http.post<{ message: string }>(`${this.apiBase}/auth/reset-password`, request).pipe(
      tap(() => {
        this.authState.update(s => ({ ...s, isLoading: false }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Password reset failed';
        this.authState.update(s => ({
          ...s,
          error: errorMessage,
          isLoading: false,
        }));
        return throwError(() => error);
      })
    );
  }

  updateProfile(user: Partial<AuthUser>): Observable<AuthUser> {
    return this.http.put<AuthUser>(`${this.apiBase}/auth/profile`, user).pipe(
      tap(updatedUser => {
        this.authState.update(s => ({
          ...s,
          user: updatedUser,
        }));
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Failed to update profile';
        this.authState.update(s => ({
          ...s,
          error: errorMessage,
        }));
        return throwError(() => error);
      })
    );
  }
}
