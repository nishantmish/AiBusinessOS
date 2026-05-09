import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../core/services/permission.service';
import { LeadsService } from '../../core/services/leads.service';
import { Lead } from '../../core/models';

@Component({
  selector: 'app-crm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crm.component.html',
  styleUrls: ['./crm.component.scss'],
})
export class CrmComponent implements OnInit {
  leadsApi = inject(LeadsService);
  perms = inject(PermissionService);
  view = signal<'table' | 'kanban'>('table');
  search = signal('');
  filterStage = signal('all');
  filterSource = signal('all');
  showModal = signal(false);
  selectedLead = signal<Lead | null>(null);
  stages = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
  stageLabels: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    proposal: 'Proposal',
    won: 'Won',
    lost: 'Lost',
  };
  sources = ['WhatsApp', 'Form', 'Manual', 'Referral', 'Instagram', 'Google'];

  newLead: Partial<Lead> = { name: '', email: '', phone: '', source: 'WhatsApp', stage: 'new', tags: [], notes: '' };

  ngOnInit(): void {
    this.leadsApi.loadLeads().subscribe();
  }

  filtered = computed(() => {
    let leads = this.leadsApi.leads();
    if (this.search()) {
      const q = this.search().toLowerCase();
      leads = leads.filter(
        l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
      );
    }
    if (this.filterStage() !== 'all') leads = leads.filter(l => l.stage === this.filterStage());
    if (this.filterSource() !== 'all') leads = leads.filter(l => l.source === this.filterSource());
    return leads;
  });

  getLeadsByStage(stage: string) {
    return this.filtered().filter(l => l.stage === stage);
  }
  getScoreClass(s: number) {
    return s >= 80 ? 'score-high' : s >= 60 ? 'score-mid' : 'score-low';
  }
  getStageClass(s: string) {
    const m: Record<string, string> = {
      new: 'badge-blue',
      contacted: 'badge-cyan',
      qualified: 'badge-amber',
      proposal: 'badge-amber',
      won: 'badge-green',
      lost: 'badge-red',
    };
    return m[s] ?? 'badge-gray';
  }
  getSourceIcon(s: string) {
    const m: Record<string, string> = {
      WhatsApp: 'ti-brand-whatsapp',
      Form: 'ti-forms',
      Manual: 'ti-edit',
      Referral: 'ti-users',
      Instagram: 'ti-brand-instagram',
      Google: 'ti-brand-google',
    };
    return m[s] ?? 'ti-user';
  }

  openLead(lead: Lead) {
    this.selectedLead.set(lead);
    this.showModal.set(true);
  }

  addLead() {
    const raw = (this.newLead.name ?? '').trim();
    const parts = raw.split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
    if (!firstName) {
      return;
    }

    this.leadsApi
      .createLead({
        firstName,
        lastName,
        email: this.newLead.email || undefined,
        phone: this.newLead.phone || undefined,
        source: (this.newLead.source as string) || 'Manual',
      })
      .subscribe({
        next: () => {
          this.showModal.set(false);
          this.newLead = { name: '', email: '', phone: '', source: 'WhatsApp', stage: 'new', tags: [], notes: '' };
        },
        error: () => {},
      });
  }
}
