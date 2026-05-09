import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';
import { Role } from '../models';

/**
 * Guard to check if user is authenticated
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guard to prevent authenticated users from accessing auth pages
 */
export const noAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

/**
 * Guard to check role-based access
 */
export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getUser();

    if (!user) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    router.navigate(['/auth/unauthorized']);
    return false;
  };
};

/**
 * Guard to check permission for a specific module
 */
export const permissionGuard = (module: string): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (permissionService.canAccess(module)) {
      return true;
    }

    router.navigate(['/auth/unauthorized']);
    return false;
  };
};

/**
 * Guard to warn user before leaving page with unsaved changes
 */
export const unsavedChangesGuard: CanDeactivateFn<any> = (component: any) => {
  if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
    return confirm('You have unsaved changes. Do you really want to leave?');
  }
  return true;
};
