import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CustomValidators } from '../../../shared/utils/validators';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-bg text-text px-4 py-8">
      <div class="w-full max-w-lg">
        <div class="mb-8 p-8 rounded-[24px] border border-border bg-surface shadow-lg">
          <div class="mb-6 text-center">
            <div class="text-3xl font-semibold">Create account</div>
            <p class="mt-2 text-sm text-text-secondary">Set up your account and start managing your business.</p>
          </div>

          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="form-label" for="firstName">First name</label>
                <input id="firstName" type="text" formControlName="firstName" class="form-control w-full" placeholder="First name" />
                <div *ngIf="firstName.invalid && firstName.touched" class="form-error">
                  First name is required
                </div>
              </div>
              <div>
                <label class="form-label" for="lastName">Last name</label>
                <input id="lastName" type="text" formControlName="lastName" class="form-control w-full" placeholder="Last name" />
                <div *ngIf="lastName.invalid && lastName.touched" class="form-error">
                  Last name is required
                </div>
              </div>
            </div>

            <div>
              <label class="form-label" for="email">Email</label>
              <input id="email" type="email" formControlName="email" class="form-control w-full" placeholder="hello@company.com" />
              <div *ngIf="email.invalid && email.touched" class="form-error">
                {{ getEmailError() }}
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="form-label" for="password">Password</label>
                <input id="password" type="password" formControlName="password" class="form-control w-full" placeholder="Password" />
                <div *ngIf="password.invalid && password.touched" class="form-error">
                  Password must be at least 8 characters and include uppercase and number.
                </div>
              </div>
              <div>
                <label class="form-label" for="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type="password" formControlName="confirmPassword" class="form-control w-full" placeholder="Confirm password" />
                <div *ngIf="confirmPassword.invalid && confirmPassword.touched" class="form-error">
                  {{ getConfirmPasswordError() }}
                </div>
              </div>
            </div>

            <div>
              <label class="form-label" for="organizationName">Organization</label>
              <input id="organizationName" type="text" formControlName="organizationName" class="form-control w-full" placeholder="Organization name" />
            </div>

            <div class="flex items-center gap-2">
              <input id="agreesToTerms" type="checkbox" formControlName="agreesToTerms" class="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
              <label for="agreesToTerms" class="text-sm text-text-secondary">I agree to the terms and privacy policy.</label>
            </div>
            <div *ngIf="agreesToTerms.invalid && agreesToTerms.touched" class="form-error">
              You must agree to continue.
            </div>

            <button type="submit" class="btn btn-primary w-full" [disabled]="signupForm.invalid || isLoading">
              <span *ngIf="!isLoading">Create account</span>
              <span *ngIf="isLoading">Creating account...</span>
            </button>

            <div *ngIf="error" class="text-error text-sm">{{ error }}</div>

            <div class="text-center text-sm text-text-secondary">
              Already have an account?
              <a routerLink="/auth/login" class="text-primary hover:underline">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
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

  signupForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, CustomValidators.email()]],
    password: ['', [Validators.required, CustomValidators.strongPassword()]],
    confirmPassword: ['', [Validators.required]],
    organizationName: ['', [Validators.required]],
    agreesToTerms: [false, [Validators.requiredTrue]]
  }, {
    validators: CustomValidators.passwordMatch('password', 'confirmPassword')
  });

  isLoading = false;
  error = '';

  get firstName() { return this.signupForm.get('firstName')!; }
  get lastName() { return this.signupForm.get('lastName')!; }
  get email() { return this.signupForm.get('email')!; }
  get password() { return this.signupForm.get('password')!; }
  get confirmPassword() { return this.signupForm.get('confirmPassword')!; }
  get organizationName() { return this.signupForm.get('organizationName')!; }
  get agreesToTerms() { return this.signupForm.get('agreesToTerms')!; }

  getEmailError(): string {
    if (this.email.hasError('required')) return 'Email is required';
    if (this.email.hasError('invalidEmail')) return 'Enter a valid email';
    return 'Email is invalid';
  }

  getConfirmPasswordError(): string {
    if (this.confirmPassword.hasError('required')) return 'Confirm your password';
    if (this.signupForm.hasError('passwordMismatch')) return 'Passwords do not match';
    return '';
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const request = {
      ...this.signupForm.value,
      email: this.email.value ?? '',
      password: this.password.value ?? '',
      confirmPassword: this.confirmPassword.value ?? ''
    };

    this.authService.signup(request as any).subscribe({
      next: () => {},
      error: () => {}
    });
  }
}
