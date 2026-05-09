import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';
declare const Chart: any;
@Component({ selector:'app-analytics', standalone:true, imports:[CommonModule], templateUrl:'./analytics.component.html', styleUrls:['./analytics.component.scss'] })
export class AnalyticsComponent implements AfterViewInit {
  data = inject(MockDataService);
  @ViewChild('revenueChart') revenueRef!: ElementRef;
  @ViewChild('funnelChart') funnelRef!: ElementRef;
  @ViewChild('sourceChart') sourceRef!: ElementRef;
  metrics = [
    { label:'Monthly Revenue', value:'₹2,84,000', delta:'+18.3%', up:true, icon:'ti-trending-up', color:'blue' },
    { label:'Lead Conversion', value:'34.7%', delta:'+4.2%', up:true, icon:'ti-chart-pie', color:'green' },
    { label:'Avg Deal Size', value:'₹10,800', delta:'+₹1,200', up:true, icon:'ti-coin', color:'amber' },
    { label:'Churn Rate', value:'3.2%', delta:'-0.8%', up:true, icon:'ti-users-minus', color:'cyan' },
  ];
  ngAfterViewInit() { this.loadChart(); }
  loadChart() {
    if (typeof Chart !== 'undefined') { this.drawCharts(); return; }
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    s.onload = () => this.drawCharts(); document.head.appendChild(s);
  }
  drawCharts() {
    const common = { grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#555b6e', font:{ size:10 } }, border:{ color:'transparent' } };
    if (this.revenueRef) new Chart(this.revenueRef.nativeElement.getContext('2d'), { type:'line', data:{ labels:['Nov','Dec','Jan','Feb','Mar','Apr','May'], datasets:[{ label:'Revenue', data:[185000,148000,162000,155000,198000,240000,284000], borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.1)', fill:true, tension:0.4, borderWidth:2 },{ label:'Target', data:[160000,160000,170000,180000,200000,220000,260000], borderColor:'rgba(34,197,94,0.4)', borderDash:[5,5], borderWidth:1.5, fill:false }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#8b90a0', font:{ size:11 } } } }, scales:{ x:common, y:{ ...common, ticks:{ ...common.ticks, callback:(v:any)=>'₹'+(v/1000)+'K' } } } } });
    if (this.funnelRef) new Chart(this.funnelRef.nativeElement.getContext('2d'), { type:'bar', data:{ labels:['New','Contacted','Qualified','Proposal','Won'], datasets:[{ data:[28,41,33,21,19], backgroundColor:['rgba(99,102,241,0.7)','rgba(6,182,212,0.7)','rgba(245,158,11,0.7)','rgba(239,68,68,0.7)','rgba(34,197,94,0.7)'], borderRadius:4 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:common, y:common } } });
    if (this.sourceRef) new Chart(this.sourceRef.nativeElement.getContext('2d'), { type:'doughnut', data:{ labels:['WhatsApp','Form','Referral','Instagram','Manual','Google'], datasets:[{ data:[42,25,18,8,5,2], backgroundColor:['#25d366','#6366f1','#f59e0b','#e1306c','#8b90a0','#4285f4'], borderWidth:0 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ color:'#8b90a0', font:{ size:11 }, boxWidth:10 } } } } });
  }
}
