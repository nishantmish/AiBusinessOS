import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
@Component({ selector:'app-settings', standalone:true, imports:[CommonModule,FormsModule], templateUrl:'./settings.component.html', styleUrls:['./settings.component.scss'] })
export class SettingsComponent {
  data = inject(MockDataService);
  activeTab = signal<'org'|'integrations'|'roles'|'billing'|'notifications'|'api'>('org');
  tabs = [
    { id:'org', label:'Organization', icon:'ti-building' },
    { id:'integrations', label:'Integrations', icon:'ti-plug' },
    { id:'roles', label:'Roles & Permissions', icon:'ti-shield-check' },
    { id:'billing', label:'Billing & Plan', icon:'ti-credit-card' },
    { id:'notifications', label:'Notifications', icon:'ti-bell' },
    { id:'api', label:'API & Webhooks', icon:'ti-code' },
  ];
  integrations = [
    { name:'WhatsApp Business API', provider:'Meta Cloud API', icon:'ti-brand-whatsapp', color:'#25d366', connected:true, desc:'Sending/receiving messages' },
    { name:'Razorpay', provider:'Payment Gateway', icon:'ti-credit-card', color:'#3395FF', connected:true, desc:'Invoice payments & subscriptions' },
    { name:'OpenAI GPT-4o', provider:'AI Provider', icon:'ti-robot', color:'#74aa9c', connected:true, desc:'Lead scoring, chat copilot, reports' },
    { name:'Anthropic Claude', provider:'AI Provider', icon:'ti-sparkles', color:'#cc8b3c', connected:false, desc:'Long-context document analysis' },
    { name:'Twilio', provider:'SMS & Voice', icon:'ti-device-mobile', color:'#F22F46', connected:false, desc:'SMS campaigns and voice calls' },
    { name:'SendGrid', provider:'Email Delivery', icon:'ti-mail', color:'#1A82E2', connected:true, desc:'Transactional and campaign emails' },
    { name:'Stripe', provider:'Payment Gateway', icon:'ti-credit-card', color:'#6772E5', connected:false, desc:'International payments' },
    { name:'Zapier', provider:'Automation', icon:'ti-bolt', color:'#FF4A00', connected:false, desc:'Connect to 5000+ apps' },
  ];
  rolesInfo = [
    { role:'Super Admin', color:'badge-red', modules:12, users:1, desc:'Full platform access including tenant management, audit logs, SaaS billing.' },
    { role:'Org Owner', color:'badge-blue', modules:12, users:1, desc:'Full org access, team management, subscription control, data export.' },
    { role:'Manager', color:'badge-cyan', modules:9, users:1, desc:'Team oversight, reports, lead assignment, campaign approval.' },
    { role:'Sales Agent', color:'badge-green', modules:5, users:2, desc:'Own leads, create activities, send messages, create invoices.' },
    { role:'Employee', color:'badge-gray', modules:3, users:3, desc:'Assigned tasks only, time logging, attendance, own profile.' },
    { role:'AI Agent', color:'badge-blue', modules:4, users:1, desc:'Read org context, send messages, create activities, score leads.' },
  ];
  apiKeys = [
    { name:'Production API Key', key:'sk-prod-••••••••••••••••••••••••••3a9f', created:'Jan 15, 2026', lastUsed:'Just now' },
    { name:'WhatsApp Webhook', key:'wh-••••••••••••••••••••••••••••••7k2m', created:'Feb 20, 2026', lastUsed:'2 min ago' },
  ];
}
