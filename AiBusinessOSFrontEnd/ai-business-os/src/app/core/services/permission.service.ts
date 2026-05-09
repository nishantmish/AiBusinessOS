import { Injectable, computed, inject } from '@angular/core';
import { Role, ROLE_PERMISSIONS } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private data = inject(MockDataService);

  allowedModules = computed(() => ROLE_PERMISSIONS[this.data.currentRole()]);

  canAccess(module: string): boolean {
    return this.allowedModules().includes(module);
  }

  canCreate(module: string): boolean {
    const r = this.data.currentRole();
    if (['super_admin','org_owner'].includes(r)) return true;
    if (r === 'manager') return ['crm','tasks','campaigns','invoices'].includes(module);
    if (r === 'sales_agent') return ['crm','tasks','invoices','inbox'].includes(module);
    return false;
  }

  canDelete(module: string): boolean {
    return ['super_admin','org_owner'].includes(this.data.currentRole());
  }

  isAtLeast(role: Role): boolean {
    const order: Role[] = ['customer','employee','ai_agent','sales_agent','manager','org_owner','super_admin'];
    return order.indexOf(this.data.currentRole()) >= order.indexOf(role);
  }
}
