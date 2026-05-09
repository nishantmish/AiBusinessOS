import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-bg text-text px-4 py-8">
      <div class="w-full max-w-xl rounded-[24px] border border-border bg-surface p-10 shadow-lg">
        <div class="mb-6 text-center">
          <div class="text-4xl font-semibold">Access denied</div>
          <p class="mt-3 text-text-secondary">You do not have permission to view this page.</p>
        </div>
        <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a routerLink="/" class="btn btn-secondary btn-block">Go to home</a>
          <a routerLink="/auth/login" class="btn btn-primary btn-block">Sign in</a>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}
