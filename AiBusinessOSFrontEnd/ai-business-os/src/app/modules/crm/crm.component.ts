import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { PermissionService } from '../../core/services/permission.service';
import { Lead } from '../../core/models';

@Component({ selector:'app-crm', standalone:true, imports:[CommonModule,FormsModule], templateUrl:'./crm.component.html', styleUrls:['./crm.component.scss'] })
export class CrmComponent {
  data = inject(MockDataService);
  perms = inject(PermissionService);
  view = signal<'table'|'kanban'>('table');
  search = signal('');
  filterStage = signal('all');
  filterSource = signal('all');
  showModal = signal(false);
  selectedLead = signal<Lead|null>(null);
  stages = ['new','contacted','qualified','proposal','won','lost'];
  stageLabels: Record<string,string> = { new:'New',contacted:'Contacted',qualified:'Qualified',proposal:'Proposal',won:'Won',lost:'Lost' };
  sources = ['WhatsApp','Form','Manual','Referral','Instagram','Google'];

  newLead: Partial<Lead> = { name:'', email:'', phone:'', source:'WhatsApp', stage:'new', tags:[], notes:'' };

  filtered = computed(() => {
    let leads = this.data.leads();
    if (this.search()) leads = leads.filter(l => l.name.toLowerCase().includes(this.search().toLowerCase()) || l.email.toLowerCase().includes(this.search().toLowerCase()));
    if (this.filterStage() !== 'all') leads = leads.filter(l => l.stage === this.filterStage());
    if (this.filterSource() !== 'all') leads = leads.filter(l => l.source === this.filterSource());
    return leads;
  });

  getLeadsByStage(stage: string) { return this.filtered().filter(l => l.stage === stage); }
  getScoreClass(s: number) { return s >= 80 ? 'score-high' : s >= 60 ? 'score-mid' : 'score-low'; }
  getStageClass(s: string) { const m: Record<string,string> = { new:'badge-blue',contacted:'badge-cyan',qualified:'badge-amber',proposal:'badge-amber',won:'badge-green',lost:'badge-red' }; return m[s]??'badge-gray'; }
  getSourceIcon(s: string) { const m: Record<string,string> = { WhatsApp:'ti-brand-whatsapp',Form:'ti-forms',Manual:'ti-edit',Referral:'ti-users',Instagram:'ti-brand-instagram',Google:'ti-brand-google' }; return m[s]??'ti-user'; }

  openLead(lead: Lead) { this.selectedLead.set(lead); this.showModal.set(true); }

  addLead() {
    const lead: Lead = {
      id: 'l'+Date.now(), orgId:'org1', name:this.newLead.name||'', email:this.newLead.email||'',
      phone:this.newLead.phone||'', source:(this.newLead.source as any)||'Manual',
      stage:'new', score:Math.floor(Math.random()*40+50), status:'open',
      owner:'Aryan Mehta', ownerId:'u1', value:0, tags:[], notes:this.newLead.notes||'',
      createdAt:new Date().toISOString().slice(0,10), updatedAt:new Date().toISOString().slice(0,10)
    };
    this.data.leads.update(ls => [lead, ...ls]);
    this.showModal.set(false);
    this.newLead = { name:'', email:'', phone:'', source:'WhatsApp', stage:'new', tags:[], notes:'' };
  }
}
