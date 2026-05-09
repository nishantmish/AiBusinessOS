import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../core/services/mock-data.service';
import { PermissionService } from '../core/services/permission.service';
import { Role, ROLE_PERMISSIONS } from '../core/models';

interface NavItem {
  label: string; icon: string; route: string; module: string; badge?: number; badgeColor?: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  data = inject(MockDataService);
  perms = inject(PermissionService);

  showNotifications = signal(false);
  showRoleSwitcher = signal(false);
  showOrgMenu = signal(false);
  sidebarCollapsed = signal(false);

  allRoles: Role[] = ['org_owner','super_admin','manager','sales_agent','employee','customer','ai_agent'];

  allNavItems: NavItem[] = [
    { label:'Dashboard',   icon:'ti-layout-dashboard', route:'/dashboard',  module:'dashboard' },
    { label:'CRM',         icon:'ti-users',             route:'/crm',        module:'crm',       badge:16, badgeColor:'accent' },
    { label:'Inbox',       icon:'ti-brand-whatsapp',    route:'/inbox',      module:'inbox',     badge:7,  badgeColor:'green' },
    { label:'Tasks',       icon:'ti-checklist',         route:'/tasks',      module:'tasks',     badge:5,  badgeColor:'amber' },
    { label:'Invoices',    icon:'ti-file-invoice',      route:'/invoices',   module:'invoices' },
    { label:'AI Reports',  icon:'ti-sparkles',          route:'/ai-reports', module:'ai-reports' },
    { label:'Analytics',   icon:'ti-chart-dots-3',      route:'/analytics',  module:'analytics' },
    { label:'Workflows',   icon:'ti-git-fork',          route:'/workflows',  module:'workflows' },
    { label:'Campaigns',   icon:'ti-speakerphone',      route:'/campaigns',  module:'campaigns' },
    { label:'Team',        icon:'ti-users-group',       route:'/team',       module:'team' },
    { label:'Attendance',  icon:'ti-calendar-stats',    route:'/attendance', module:'attendance' },
    { label:'Settings',    icon:'ti-settings',          route:'/settings',   module:'settings' },
  ];

  navItems = computed(() =>
    this.allNavItems.filter(n => this.perms.canAccess(n.module))
  );

  unreadNotifications = computed(() =>
    this.data.notifications().filter(n => !n.read).length
  );

  switchRole(role: Role) {
    this.data.switchRole(role);
    this.showRoleSwitcher.set(false);
  }

  getRoleLabel(role: Role): string {
    const labels: Record<Role, string> = {
      super_admin: 'Super Admin', org_owner: 'Org Owner', manager: 'Manager',
      sales_agent: 'Sales Agent', employee: 'Employee', customer: 'Customer', ai_agent: 'AI Agent'
    };
    return labels[role];
  }

  getRoleBadgeClass(role: Role): string {
    const map: Record<Role, string> = {
      super_admin:'badge-red', org_owner:'badge-blue', manager:'badge-cyan',
      sales_agent:'badge-green', employee:'badge-gray', customer:'badge-amber', ai_agent:'badge-blue'
    };
    return map[role];
  }

  getRoleIcon(role: Role): string {
    const map: Record<Role, string> = {
      super_admin:'ti-crown', org_owner:'ti-building', manager:'ti-briefcase',
      sales_agent:'ti-user-star', employee:'ti-user', customer:'ti-user-circle', ai_agent:'ti-robot'
    };
    return map[role];
  }

  getModuleCount(role: Role): number {
    return ROLE_PERMISSIONS[role].length;
  }

  markAllRead() {
    this.data.notifications.update(ns => ns.map(n => ({ ...n, read: true })));
  }

  toggleSidebar() { this.sidebarCollapsed.update(v => !v); }

  getPlanBadge(): string {
    const p = this.data.organization().plan;
    if (p === 'growth') return 'badge-blue';
    if (p === 'enterprise') return 'badge-red';
    return 'badge-gray';
  }
}
