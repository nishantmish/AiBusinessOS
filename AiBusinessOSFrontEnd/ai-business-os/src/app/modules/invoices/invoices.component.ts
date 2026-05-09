import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { PermissionService } from '../../core/services/permission.service';
import { Invoice } from '../../core/models';

@Component({ selector:'app-invoices', standalone:true, imports:[CommonModule,FormsModule], templateUrl:'./invoices.component.html', styleUrls:['./invoices.component.scss'] })
export class InvoicesComponent {
  data = inject(MockDataService);
  perms = inject(PermissionService);
  filterStatus = signal('all');
  selectedInvoice = signal<Invoice|null>(null);
  showCreate = signal(false);
  statuses = ['draft','sent','paid','overdue'];

  filtered = computed(() => {
    if (this.filterStatus() === 'all') return this.data.invoices();
    return this.data.invoices().filter(i => i.status === this.filterStatus());
  });

  totalRevenue = computed(() => this.data.invoices().filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0));
  totalPending = computed(() => this.data.invoices().filter(i=>i.status==='sent').reduce((s,i)=>s+i.amount,0));
  totalOverdue = computed(() => this.data.invoices().filter(i=>i.status==='overdue').reduce((s,i)=>s+i.amount,0));

  getStatusClass(s: string) { const m: Record<string,string> = { paid:'badge-green', sent:'badge-blue', overdue:'badge-red', draft:'badge-gray' }; return m[s]??'badge-gray'; }
  getStatusIcon(s: string) { const m: Record<string,string> = { paid:'ti-circle-check', sent:'ti-send', overdue:'ti-alert-circle', draft:'ti-file' }; return m[s]??'ti-file'; }

  markPaid(inv: Invoice) {
    this.data.invoices.update(is => is.map(i => i.id===inv.id ? {...i, status:'paid', paidAt:new Date().toISOString().slice(0,10)} : i));
    this.selectedInvoice.set(null);
  }
}
