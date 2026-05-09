import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../core/services/mock-data.service';
import { PermissionService } from '../core/services/permission.service';
import { AuthService } from '../core/services/auth.service';
import { authDisplayName, authInitials } from '../core/utils/jwt';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  module: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  data = inject(MockDataService);
  perms = inject(PermissionService);
  auth = inject(AuthService);
  private router = inject(Router);

  private sessionUser = computed(() => this.auth.state$().user);

  displayName = computed(() => authDisplayName(this.sessionUser()));
  initials = computed(() => authInitials(this.sessionUser()));
  currentRole = computed(() => this.sessionUser()?.role ?? 'employee');
  workspaceSubtitle = computed(() => {
    const id = this.sessionUser()?.organizationId;
    if (!id) return 'Signed in';
    return `Tenant ${id.slice(0, 8)}…`;
  });

  showNotifications = signal(false);
  showOrgMenu = signal(false);
  sidebarCollapsed = signal(false);

  allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'ti-layout-dashboard', route: '/dashboard', module: 'dashboard' },
    { label: 'CRM', icon: 'ti-users', route: '/crm', module: 'crm' },
    { label: 'Inbox', icon: 'ti-brand-whatsapp', route: '/inbox', module: 'inbox' },
    { label: 'Tasks', icon: 'ti-checklist', route: '/tasks', module: 'tasks' },
    { label: 'Invoices', icon: 'ti-file-invoice', route: '/invoices', module: 'invoices' },
    { label: 'AI Reports', icon: 'ti-sparkles', route: '/ai-reports', module: 'ai-reports' },
    { label: 'Analytics', icon: 'ti-chart-dots-3', route: '/analytics', module: 'analytics' },
    { label: 'Workflows', icon: 'ti-git-fork', route: '/workflows', module: 'workflows' },
    { label: 'Campaigns', icon: 'ti-speakerphone', route: '/campaigns', module: 'campaigns' },
    { label: 'Team', icon: 'ti-users-group', route: '/team', module: 'team' },
    { label: 'Attendance', icon: 'ti-calendar-stats', route: '/attendance', module: 'attendance' },
    { label: 'Settings', icon: 'ti-settings', route: '/settings', module: 'settings' },
  ];

  navItems = computed(() => this.allNavItems.filter(n => this.perms.canAccess(n.module)));

  unreadNotifications = computed(() => this.data.notifications().filter(n => !n.read).length);

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      org_owner: 'Org Owner',
      manager: 'Manager',
      sales_agent: 'Sales Agent',
      employee: 'Employee',
      customer: 'Customer',
      ai_agent: 'AI Agent',
    };
    return labels[role] ?? role;
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      super_admin: 'badge-red',
      org_owner: 'badge-blue',
      manager: 'badge-cyan',
      sales_agent: 'badge-green',
      employee: 'badge-gray',
      customer: 'badge-amber',
      ai_agent: 'badge-blue',
    };
    return map[role] ?? 'badge-gray';
  }

  markAllRead() {
    this.data.notifications.update(ns => ns.map(n => ({ ...n, read: true })));
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.showNotifications.set(false);
      void this.router.navigate(['/auth/login']);
    });
  }
}
