import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';
@Component({ selector: 'app-ai-reports', standalone: true, imports: [CommonModule], templateUrl: './ai-reports.component.html', styleUrls: ['./ai-reports.component.scss'] })
export class AiReportsComponent {
  data = inject(MockDataService);
  reports = [
    { title: 'Weekly Business Summary', date: 'May 5, 2026', type: 'weekly', icon: 'ti-sparkles', color: 'accent', summary: 'Revenue grew 18.3% driven by WhatsApp campaigns. 24 new leads this week, 6 conversions. Invoice collection improved — 2 overdue cleared.', insights: ['WhatsApp open rate 87% — highest in 3 months', 'Referral channel converting 2.8× better than average', '3 high-score leads (>85) need immediate follow-up', 'Projected June revenue: ₹3.1L based on pipeline'], creditsUsed: 10 },
    { title: 'Lead Scoring Analysis', date: 'May 8, 2026', type: 'analysis', icon: 'ti-brain', color: 'cyan', summary: 'AI analyzed 16 leads. Top performers: Arjun Malhotra (95), Meera Iyer (96), Divya Menon (96). 3 cold leads recommended for re-engagement campaign.', insights: ['Avg lead score improved to 78.4 (up from 71.2)', 'Instagram leads scoring 12pts higher than Forms', 'Demo attendance correlates with 3× conversion rate', 'Morning inquiry leads convert 40% better'], creditsUsed: 8 },
    { title: 'Invoice & Payment Risk Report', date: 'May 7, 2026', type: 'risk', icon: 'ti-alert-triangle', color: 'amber', summary: '3 invoices flagged as overdue. Vikram Rao (5 days) is highest risk. Automated reminders sent. Historical payment behavior suggests 80% will clear within 7 days.', insights: ['₹6,200 at risk — Vikram Rao needs immediate call', 'GST collection efficiency 94.2% this quarter', 'Average payment lag: 4.3 days (industry avg: 8.1)', 'Consider early payment discount to improve cash flow'], creditsUsed: 6 },
    { title: 'Campaign Performance Report', date: 'May 6, 2026', type: 'campaign', icon: 'ti-speakerphone', color: 'green', summary: 'Summer Offer campaign achieved 81% open rate on WhatsApp with 368 sends. Email campaign running at 60% open rate. Mother\'s Day campaign scheduled for May 11.', insights: ['Morning sends (8-9am) outperform evening by 2.4×', 'Emoji in subject lines boost open rate by 18%', 'Segment: female members aged 25-35 highest responders', 'Recommended: send 3 follow-ups to non-openers'], creditsUsed: 5 },
  ];
  getColorClass(c: string) { return { accent: 'badge-blue', cyan: 'badge-cyan', amber: 'badge-amber', green: 'badge-green' }[c] ?? 'badge-blue'; }
  getIconBg(c: string) { return { accent: 'var(--accent-glow)', cyan: 'var(--cyan-dim)', amber: 'var(--amber-dim)', green: 'var(--green-dim)' }[c] ?? 'var(--accent-glow)'; }
  getIconColor(c: string) { return { accent: 'var(--accent2)', cyan: 'var(--cyan)', amber: 'var(--amber)', green: 'var(--green)' }[c] ?? 'var(--accent2)'; }
}
