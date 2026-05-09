export type Role = 'super_admin' | 'org_owner' | 'manager' | 'sales_agent' | 'employee' | 'customer' | 'ai_agent';

export interface User {
  id: string; name: string; email: string; phone: string;
  role: Role; avatar: string; orgId: string; status: 'active' | 'inactive';
  createdAt: string; department?: string; avatarColor?: string;
}

export interface Organization {
  id: string; name: string; slug: string; niche: string;
  plan: 'starter' | 'growth' | 'enterprise'; timezone: string;
  status: 'active' | 'suspended'; createdAt: string;
  branches: number; aiCredits: number; aiCreditsUsed: number;
}

export interface Lead {
  id: string; orgId: string; name: string; email: string; phone: string;
  source: 'WhatsApp' | 'Form' | 'Manual' | 'Referral' | 'Instagram' | 'Google';
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  score: number; status: 'open' | 'won' | 'lost';
  owner: string; ownerId: string; value: number;
  tags: string[]; notes: string; createdAt: string; updatedAt: string;
}

export interface Message {
  id: string; conversationId: string; content: string;
  sender: 'user' | 'agent' | 'ai'; timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string; orgId: string; customerName: string; customerPhone: string;
  channel: 'whatsapp' | 'email' | 'sms'; assignee: string; assigneeId: string;
  lastMessage: string; lastMessageAt: string; status: 'open' | 'resolved' | 'pending';
  unread: number; messages: Message[]; avatarColor: string;
}

export interface Task {
  id: string; title: string; description: string;
  assignee: string; assigneeId: string; dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  relatedLead?: string; tags: string[]; createdAt: string;
}

export interface InvoiceItem {
  id: string; description: string; qty: number; rate: number; amount: number;
}

export interface Invoice {
  id: string; orgId: string; invoiceNo: string;
  customerName: string; customerId: string;
  amount: number; taxAmount: number; dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[]; createdAt: string; paidAt?: string;
}

export interface Workflow {
  id: string; name: string; trigger: string; description: string;
  isActive: boolean; executions: number; lastRun: string; steps: number;
}

export interface Campaign {
  id: string; name: string; channel: 'whatsapp' | 'email' | 'sms';
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  audience: number; sent: number; delivered: number; opened: number;
  scheduledAt: string; createdAt: string; template: string;
}

export interface Employee {
  id: string; name: string; email: string; phone: string;
  role: string; department: string; joinDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  attendanceToday: 'present' | 'absent' | 'half_day' | 'leave';
  avatarColor: string; salary: number;
}

export interface AttendanceRecord {
  id: string; employeeId: string; employeeName: string;
  date: string; checkIn: string; checkOut: string;
  status: 'present' | 'absent' | 'half_day' | 'leave'; hours: number;
  avatarColor: string;
}

export interface Notification {
  id: string; title: string; message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean; createdAt: string; icon: string;
}

export interface Permission {
  module: string; canView: boolean; canCreate: boolean;
  canEdit: boolean; canDelete: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  super_admin:  ['dashboard','crm','inbox','tasks','invoices','analytics','workflows','campaigns','team','attendance','settings','ai-reports'],
  org_owner:    ['dashboard','crm','inbox','tasks','invoices','analytics','workflows','campaigns','team','attendance','settings','ai-reports'],
  manager:      ['dashboard','crm','inbox','tasks','invoices','analytics','campaigns','team','attendance'],
  sales_agent:  ['dashboard','crm','inbox','tasks','invoices'],
  employee:     ['dashboard','tasks','attendance'],
  customer:     ['invoices'],
  ai_agent:     ['dashboard','crm','inbox','workflows'],
};
