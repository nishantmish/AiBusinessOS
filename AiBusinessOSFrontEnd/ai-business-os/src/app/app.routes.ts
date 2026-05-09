import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',  loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'crm',        loadComponent: () => import('./modules/crm/crm.component').then(m => m.CrmComponent) },
      { path: 'inbox',      loadComponent: () => import('./modules/inbox/inbox.component').then(m => m.InboxComponent) },
      { path: 'tasks',      loadComponent: () => import('./modules/tasks/tasks.component').then(m => m.TasksComponent) },
      { path: 'invoices',   loadComponent: () => import('./modules/invoices/invoices.component').then(m => m.InvoicesComponent) },
      { path: 'analytics',  loadComponent: () => import('./modules/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'workflows',  loadComponent: () => import('./modules/workflows/workflows.component').then(m => m.WorkflowsComponent) },
      { path: 'campaigns',  loadComponent: () => import('./modules/campaigns/campaigns.component').then(m => m.CampaignsComponent) },
      { path: 'team',       loadComponent: () => import('./modules/team/team.component').then(m => m.TeamComponent) },
      { path: 'attendance', loadComponent: () => import('./modules/attendance/attendance.component').then(m => m.AttendanceComponent) },
      { path: 'ai-reports', loadComponent: () => import('./modules/ai-reports/ai-reports.component').then(m => m.AiReportsComponent) },
      { path: 'settings',   loadComponent: () => import('./modules/settings/settings.component').then(m => m.SettingsComponent) },
    ]
  }
];
