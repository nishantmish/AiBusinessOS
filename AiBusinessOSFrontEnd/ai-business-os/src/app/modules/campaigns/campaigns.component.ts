import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';
@Component({ selector: 'app-campaigns', standalone: true, imports: [CommonModule], templateUrl: './campaigns.component.html', styleUrls: ['./campaigns.component.scss'] })
export class CampaignsComponent {
  data = inject(MockDataService);
  getStatusClass(s: string) { return { draft: 'badge-gray', scheduled: 'badge-blue', running: 'badge-amber', completed: 'badge-green' }[s] ?? 'badge-gray'; }
  getChannelIcon(c: string) { return { whatsapp: 'ti-brand-whatsapp', email: 'ti-mail', sms: 'ti-device-mobile' }[c] ?? 'ti-speakerphone'; }
  getChannelColor(c: string) { return { whatsapp: '#25d366', email: '#6366f1', sms: '#f59e0b' }[c] ?? 'var(--accent2)'; }
  openRate(camp: any) { return camp.delivered ? Math.round(camp.opened / camp.delivered * 100) + '%' : '—'; }
  deliveryRate(camp: any) { return camp.sent ? Math.round(camp.delivered / camp.sent * 100) + '%' : '—'; }
}
