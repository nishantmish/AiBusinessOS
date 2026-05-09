import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CustomValidators } from '../../../shared/utils/validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-bg text-text px-4 py-8">
      <div class="w-full max-w-md">
        <div class="mb-8 p-8 rounded-[24px] border border-border bg-surface shadow-lg">
          <div class="mb-6 text-center">
            <div class="text-3xl font-semibold">Welcome back</div>
            <p class="mt-2 text-sm text-text-secondary">Sign in to continue to AiBusinessOS</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="form-label" for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-control w-full"
                placeholder="hello@company.com"
              />
              <div *ngIf="email.invalid && email.touched" class="form-error">
                {{ getEmailError() }}
              </div>
            </div>

            <div>
              <label class="form-label" for="password">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="form-control w-full"
                placeholder="Enter your password"
              />
              <div *ngIf="password.invalid && password.touched" class="form-error">
                Password is required
              </div>
            </div>

            <div class="flex items-center justify-between gap-4">
              <button type="submit" class="btn btn-primary w-full" [disabled]="loginForm.invalid || isLoading">
                <span *ngIf="!isLoading">Sign in</span>
                <span *ngIf="isLoading">Signing in...</span>
              </button>
            </div>

            <div *ngIf="error" class="text-error text-sm">{{ error }}</div>

            <div class="text-center text-sm text-text-secondary">
              Don’t have an account?
              <a routerLink="/auth/signup" class="text-primary hover:underline">Create one</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const state = this.authService.state$();
      this.isLoading = state.isLoading;
      this.error = state.error || '';
      if (state.isAuthenticated) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, CustomValidators.email()]],
    password: ['', [Validators.required]],
  });

  isLoading = false;
  error = '';

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  getEmailError(): string {
    if (this.email.hasError('required')) return 'Email is required';
    if (this.email.hasError('invalidEmail')) return 'Enter a valid email';
    return 'Email is invalid';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = {
      email: this.email.value ?? '',
      password: this.password.value ?? ''
    };

    this.authService.login(credentials).subscribe({
      next: () => {},
      error: () => {}
    });
  }
}
