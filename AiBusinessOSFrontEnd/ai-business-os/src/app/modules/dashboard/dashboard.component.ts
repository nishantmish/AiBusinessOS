import { Component, inject, AfterViewInit, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { LeadsService } from '../../core/services/leads.service';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, OnInit {
  data = inject(MockDataService);
  leadsApi = inject(LeadsService);
  @ViewChild('revenueChart') chartRef!: ElementRef;

  stages = ['new','contacted','qualified','proposal','won','lost'] as const;
  stageLabels: Record<string, string> = { new:'New', contacted:'Contacted', qualified:'Qualified', proposal:'Proposal', won:'Won', lost:'Lost' };

  kpis = [
    { label:'Total Revenue', value:'₹2.84L', delta:'+18.3%', deltaUp:true, sub:'vs last month', icon:'ti-trending-up', color:'blue' },
    { label:'Active Leads', value:'142', delta:'+24', deltaUp:true, sub:'new this week', icon:'ti-users', color:'green' },
    { label:'Messages Sent', value:'3,241', delta:'94.2%', deltaUp:true, sub:'delivery rate', icon:'ti-brand-whatsapp', color:'amber' },
    { label:'AI Credits Used', value:'1,380', delta:'620 left', deltaUp:false, sub:'of 2,000', icon:'ti-cpu', color:'cyan' },
  ];

  insights = [
    { icon:'ti-trending-up', type:'up', text:'Revenue up <strong>18.3%</strong> — WhatsApp campaigns drove 42% of conversions. Morning broadcasts (8–9am) outperform afternoon by 2.4×.' },
    { icon:'ti-alert-triangle', type:'warn', text:'<strong>3 invoices at overdue risk</strong> — Vikram Rao (5d), Mohit Verma (2d), Kavya Pillai (due tomorrow). Send reminders now.' },
    { icon:'ti-bulb', type:'info', text:'Referral leads convert <strong>2.8× better</strong> — only 11% of leads via referral. Activating a referral workflow could add ₹40K–₹60K/month.' },
    { icon:'ti-robot', type:'up', text:'AI Copilot saved <strong>6.2 hours</strong> this week. Lead scoring accuracy improved to <strong>91.4%</strong> based on last 30 conversions.' },
  ];

  activities = [
    { dot:'green', text:'<strong>Meera Iyer</strong> paid invoice ₹8,500', time:'2 min ago · AI receipt sent' },
    { dot:'blue',  text:'<strong>Lead Workflow</strong> triggered for Rahul Sharma', time:'6 min ago · Automated' },
    { dot:'amber', text:'<strong>AI scored</strong> Arjun Malhotra at 95 — assigned to Riya', time:'18 min ago · AI' },
    { dot:'red',   text:'<strong>Overdue alert</strong> — Vikram Rao ₹6,200 · reminder sent', time:'45 min ago' },
    { dot:'blue',  text:'<strong>Campaign</strong> "Summer Offer" — 320 messages delivered', time:'1 hr ago · Broadcast' },
    { dot:'green', text:'<strong>Divya Menon</strong> converted — membership activated', time:'2 hr ago' },
  ];

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  ngOnInit(): void {
    this.leadsApi.loadLeads().subscribe();
  }

  getLeadsByStage(stage: string) {
    return this.leadsApi.leads().filter(l => l.stage === stage).slice(0, 3);
  }

  getScoreClass(score: number) {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-mid';
    return 'score-low';
  }

  getInvoiceStatusClass(status: string) {
    const map: Record<string, string> = { paid:'badge-green', sent:'badge-blue', overdue:'badge-red', draft:'badge-gray' };
    return map[status] ?? 'badge-gray';
  }

  ngAfterViewInit() { this.loadChartJs(); }

  loadChartJs() {
    if (typeof Chart !== 'undefined') { this.drawChart(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    s.onload = () => this.drawChart();
    document.head.appendChild(s);
  }

  drawChart() {
    if (!this.chartRef?.nativeElement) return;
    new Chart(this.chartRef.nativeElement.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Dec','Jan','Feb','Mar','Apr','May'],
        datasets: [
          { label:'Revenue (₹K)', data:[148,162,155,198,240,284], backgroundColor:'rgba(99,102,241,0.55)', borderColor:'#6366f1', borderWidth:1, borderRadius:4, yAxisID:'y' },
          { label:'Leads', type:'line', data:[78,95,88,110,128,142], borderColor:'#22c55e', backgroundColor:'rgba(34,197,94,0.1)', borderWidth:2, fill:true, tension:0.4, pointBackgroundColor:'#22c55e', pointRadius:3, yAxisID:'y1' }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:'#13161d', borderColor:'rgba(255,255,255,0.1)', borderWidth:1, titleColor:'#8b90a0', bodyColor:'#e8eaf0' } },
        scales:{
          x:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#555b6e', font:{ size:11 } }, border:{ color:'rgba(255,255,255,0.06)' } },
          y:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#555b6e', font:{ size:10 }, callback:(v:any)=>'₹'+v+'K' }, border:{ color:'transparent' } },
          y1:{ position:'right', grid:{ display:false }, ticks:{ color:'#555b6e', font:{ size:10 } }, border:{ color:'transparent' } }
        }
      }
    });
  }
}
