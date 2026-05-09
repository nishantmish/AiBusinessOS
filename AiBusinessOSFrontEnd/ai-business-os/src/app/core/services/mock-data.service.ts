import { Injectable, signal } from '@angular/core';
import {
  User, Organization, Lead, Conversation, Message,
  Task, Invoice, Workflow, Campaign, Employee,
  AttendanceRecord, Notification, Role
} from '../models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  currentUser = signal<User>({
    id: 'u1', name: 'Aryan Mehta', email: 'aryan@fitzoneGym.com',
    phone: '+91 98765 43210', role: 'org_owner', avatar: 'AM',
    orgId: 'org1', status: 'active', createdAt: '2024-01-15',
    department: 'Management', avatarColor: 'linear-gradient(135deg,#06b6d4,#3b82f6)'
  });

  currentRole = signal<Role>('org_owner');

  organization = signal<Organization>({
    id: 'org1', name: 'FitZone Gym', slug: 'fitzone-gym', niche: 'Gym & Fitness',
    plan: 'growth', timezone: 'Asia/Kolkata', status: 'active',
    createdAt: '2024-01-10', branches: 3, aiCredits: 2000, aiCreditsUsed: 1380
  });

  notifications = signal<Notification[]>([
    { id:'n1', title:'Invoice Paid', message:'Meera Iyer paid ₹8,500', type:'success', read:false, createdAt:'2 min ago', icon:'ti-circle-check' },
    { id:'n2', title:'New Lead', message:'Rahul Sharma via WhatsApp', type:'info', read:false, createdAt:'6 min ago', icon:'ti-user-plus' },
    { id:'n3', title:'Overdue Alert', message:'Vikram Rao invoice overdue 5 days', type:'warning', read:false, createdAt:'45 min ago', icon:'ti-alert-triangle' },
    { id:'n4', title:'Workflow Triggered', message:'Lead Welcome Flow executed x3', type:'info', read:true, createdAt:'1 hr ago', icon:'ti-git-fork' },
    { id:'n5', title:'AI Report Ready', message:'Weekly business insights generated', type:'success', read:true, createdAt:'8 hr ago', icon:'ti-sparkles' },
  ]);

  leads = signal<Lead[]>([
    { id:'l1', orgId:'org1', name:'Rahul Sharma', email:'rahul@gmail.com', phone:'+91 98001 11001', source:'WhatsApp', stage:'new', score:92, status:'open', owner:'Riya Patel', ownerId:'u3', value:12000, tags:['hot','annual'], notes:'Very interested in annual membership', createdAt:'2026-05-08', updatedAt:'2026-05-08' },
    { id:'l2', orgId:'org1', name:'Priya Kapoor', email:'priya@email.com', phone:'+91 98001 11002', source:'Form', stage:'new', score:87, status:'open', owner:'Riya Patel', ownerId:'u3', value:8000, tags:['warm'], notes:'Interested in yoga classes', createdAt:'2026-05-07', updatedAt:'2026-05-08' },
    { id:'l3', orgId:'org1', name:'Aditya Nair', email:'aditya@email.com', phone:'+91 98001 11003', source:'Manual', stage:'new', score:64, status:'open', owner:'Aryan Mehta', ownerId:'u1', value:6000, tags:['cold'], notes:'Walk-in enquiry', createdAt:'2026-05-06', updatedAt:'2026-05-07' },
    { id:'l4', orgId:'org1', name:'Sneha Reddy', email:'sneha@email.com', phone:'+91 98001 11004', source:'WhatsApp', stage:'contacted', score:79, status:'open', owner:'Riya Patel', ownerId:'u3', value:9000, tags:['warm','follow-up'], notes:'Sent brochure, awaiting reply', createdAt:'2026-05-05', updatedAt:'2026-05-08' },
    { id:'l5', orgId:'org1', name:'Mohit Verma', email:'mohit@email.com', phone:'+91 98001 11005', source:'Form', stage:'contacted', score:55, status:'open', owner:'Aryan Mehta', ownerId:'u1', value:5000, tags:['cold'], notes:'Needs follow-up', createdAt:'2026-05-04', updatedAt:'2026-05-07' },
    { id:'l6', orgId:'org1', name:'Kavya Pillai', email:'kavya@email.com', phone:'+91 98001 11006', source:'Referral', stage:'contacted', score:88, status:'open', owner:'Riya Patel', ownerId:'u3', value:15000, tags:['hot','vip'], notes:'Referred by Meera Iyer', createdAt:'2026-05-03', updatedAt:'2026-05-08' },
    { id:'l7', orgId:'org1', name:'Neha Singh', email:'neha@email.com', phone:'+91 98001 11007', source:'WhatsApp', stage:'qualified', score:91, status:'open', owner:'Riya Patel', ownerId:'u3', value:12000, tags:['hot'], notes:'Very keen, discussed packages', createdAt:'2026-05-02', updatedAt:'2026-05-08' },
    { id:'l8', orgId:'org1', name:'Arjun Malhotra', email:'arjun@email.com', phone:'+91 98001 11008', source:'Instagram', stage:'qualified', score:95, status:'open', owner:'Aryan Mehta', ownerId:'u1', value:18000, tags:['hot','premium'], notes:'Wants premium + PT sessions', createdAt:'2026-05-01', updatedAt:'2026-05-08' },
    { id:'l9', orgId:'org1', name:'Tara Joshi', email:'tara@email.com', phone:'+91 98001 11009', source:'Form', stage:'qualified', score:72, status:'open', owner:'Riya Patel', ownerId:'u3', value:7000, tags:['warm'], notes:'Interested in group classes', createdAt:'2026-04-30', updatedAt:'2026-05-07' },
    { id:'l10', orgId:'org1', name:'Vikram Bose', email:'vikram.b@email.com', phone:'+91 98001 11010', source:'Google', stage:'proposal', score:68, status:'open', owner:'Aryan Mehta', ownerId:'u1', value:8500, tags:['warm'], notes:'Sent proposal, negotiating', createdAt:'2026-04-28', updatedAt:'2026-05-06' },
    { id:'l11', orgId:'org1', name:'Anita Chauhan', email:'anita@email.com', phone:'+91 98001 11011', source:'WhatsApp', stage:'proposal', score:83, status:'open', owner:'Riya Patel', ownerId:'u3', value:11000, tags:['hot'], notes:'Family membership interest', createdAt:'2026-04-27', updatedAt:'2026-05-08' },
    { id:'l12', orgId:'org1', name:'Rishi Kumar', email:'rishi@email.com', phone:'+91 98001 11012', source:'Referral', stage:'proposal', score:61, status:'open', owner:'Aryan Mehta', ownerId:'u1', value:6500, tags:['warm'], notes:'Budget conscious', createdAt:'2026-04-26', updatedAt:'2026-05-05' },
    { id:'l13', orgId:'org1', name:'Divya Menon', email:'divya@email.com', phone:'+91 98001 11013', source:'WhatsApp', stage:'won', score:96, status:'won', owner:'Riya Patel', ownerId:'u3', value:15000, tags:['converted'], notes:'Signed annual premium', createdAt:'2026-04-20', updatedAt:'2026-05-07' },
    { id:'l14', orgId:'org1', name:'Suresh Pillai', email:'suresh@email.com', phone:'+91 98001 11014', source:'Form', stage:'won', score:90, status:'won', owner:'Aryan Mehta', ownerId:'u1', value:12000, tags:['converted'], notes:'6-month plan activated', createdAt:'2026-04-18', updatedAt:'2026-05-06' },
    { id:'l15', orgId:'org1', name:'Meera Iyer', email:'meera@email.com', phone:'+91 98001 11015', source:'Referral', stage:'won', score:94, status:'won', owner:'Riya Patel', ownerId:'u3', value:8500, tags:['converted','vip'], notes:'3-month + PT renewal', createdAt:'2026-04-15', updatedAt:'2026-05-08' },
    { id:'l16', orgId:'org1', name:'Kiran Das', email:'kiran@email.com', phone:'+91 98001 11016', source:'Instagram', stage:'lost', score:30, status:'lost', owner:'Aryan Mehta', ownerId:'u1', value:0, tags:['lost','price'], notes:'Went to competitor', createdAt:'2026-04-10', updatedAt:'2026-04-25' },
  ]);

  conversations = signal<Conversation[]>([
    { id:'c1', orgId:'org1', customerName:'Rahul Sharma', customerPhone:'+91 98001 11001', channel:'whatsapp', assignee:'Riya Patel', assigneeId:'u3', lastMessage:'Interested in annual membership plan', lastMessageAt:'2 min ago', status:'open', unread:3, avatarColor:'linear-gradient(135deg,#6366f1,#8b5cf6)', messages:[
      { id:'m1', conversationId:'c1', content:'Hi, I want to join the gym. What are the membership plans?', sender:'user', timestamp:'10:30 AM', status:'read' },
      { id:'m2', conversationId:'c1', content:'Hello Rahul! Welcome to FitZone 💪 We have 3 plans: Monthly ₹1,500, Quarterly ₹4,000, Annual ₹12,000. Which suits you best?', sender:'agent', timestamp:'10:32 AM', status:'read' },
      { id:'m3', conversationId:'c1', content:'Interested in annual membership plan', sender:'user', timestamp:'10:45 AM', status:'delivered' },
    ]},
    { id:'c2', orgId:'org1', customerName:'Sneha Kapoor', customerPhone:'+91 98001 22001', channel:'whatsapp', assignee:'Aryan Mehta', assigneeId:'u1', lastMessage:'When does the morning batch start?', lastMessageAt:'14 min ago', status:'open', unread:1, avatarColor:'linear-gradient(135deg,#0ea5e9,#06b6d4)', messages:[
      { id:'m4', conversationId:'c2', content:'When does the morning batch start?', sender:'user', timestamp:'9:55 AM', status:'delivered' },
    ]},
    { id:'c3', orgId:'org1', customerName:'Arjun Jain', customerPhone:'+91 98001 33001', channel:'whatsapp', assignee:'Riya Patel', assigneeId:'u3', lastMessage:"Thanks! I'll come tomorrow at 10", lastMessageAt:'1 hr ago', status:'open', unread:0, avatarColor:'linear-gradient(135deg,#f59e0b,#ef4444)', messages:[
      { id:'m5', conversationId:'c3', content:'Is there a demo class available?', sender:'user', timestamp:'9:00 AM', status:'read' },
      { id:'m6', conversationId:'c3', content:'Yes! We offer free demo sessions every weekday at 7am and 6pm.', sender:'agent', timestamp:'9:05 AM', status:'read' },
      { id:'m7', conversationId:'c3', content:"Thanks! I'll come tomorrow at 10", sender:'user', timestamp:'9:15 AM', status:'read' },
    ]},
    { id:'c4', orgId:'org1', customerName:'Priya Mehta', customerPhone:'+91 98001 44001', channel:'whatsapp', assignee:'Riya Patel', assigneeId:'u3', lastMessage:'Can I get a demo class free?', lastMessageAt:'2 hr ago', status:'open', unread:2, avatarColor:'linear-gradient(135deg,#22c55e,#14b8a6)', messages:[
      { id:'m8', conversationId:'c4', content:'Can I get a demo class free?', sender:'user', timestamp:'8:00 AM', status:'delivered' },
    ]},
    { id:'c5', orgId:'org1', customerName:'Vikram Rao', customerPhone:'+91 98001 55001', channel:'whatsapp', assignee:'Aryan Mehta', assigneeId:'u1', lastMessage:'Invoice received. Will pay by Friday', lastMessageAt:'3 hr ago', status:'open', unread:0, avatarColor:'linear-gradient(135deg,#a855f7,#ec4899)', messages:[
      { id:'m9', conversationId:'c5', content:'Your invoice INV-2024-006 for ₹6,200 is pending. Please clear by May 10.', sender:'agent', timestamp:'7:00 AM', status:'read' },
      { id:'m10', conversationId:'c5', content:'Invoice received. Will pay by Friday', sender:'user', timestamp:'7:30 AM', status:'read' },
    ]},
    { id:'c6', orgId:'org1', customerName:'Meera Iyer', customerPhone:'+91 98001 11015', channel:'whatsapp', assignee:'Riya Patel', assigneeId:'u3', lastMessage:'Payment done! Please send receipt', lastMessageAt:'5 hr ago', status:'resolved', unread:0, avatarColor:'linear-gradient(135deg,#6366f1,#06b6d4)', messages:[
      { id:'m11', conversationId:'c6', content:'Your renewal invoice is ready — ₹8,500 due May 8', sender:'agent', timestamp:'6:00 AM', status:'read' },
      { id:'m12', conversationId:'c6', content:'Payment done! Please send receipt', sender:'user', timestamp:'6:30 AM', status:'read' },
      { id:'m13', conversationId:'c6', content:'Receipt sent to meera@email.com 🎉 Thanks for renewing with FitZone!', sender:'agent', timestamp:'6:31 AM', status:'read' },
    ]},
  ]);

  tasks = signal<Task[]>([
    { id:'t1', title:'Follow up with Rahul Sharma', description:'Discuss annual plan pricing and send proposal', assignee:'Riya Patel', assigneeId:'u3', dueDate:'2026-05-09', priority:'urgent', status:'todo', relatedLead:'Rahul Sharma', tags:['sales','follow-up'], createdAt:'2026-05-08' },
    { id:'t2', title:'Prepare demo for Arjun Malhotra', description:'Premium plan + PT session demo tomorrow 10am', assignee:'Aryan Mehta', assigneeId:'u1', dueDate:'2026-05-09', priority:'high', status:'in_progress', relatedLead:'Arjun Malhotra', tags:['demo','sales'], createdAt:'2026-05-07' },
    { id:'t3', title:'Send proposal to Anita Chauhan', description:'Family membership proposal — 4 adults 2 children', assignee:'Riya Patel', assigneeId:'u3', dueDate:'2026-05-10', priority:'high', status:'todo', relatedLead:'Anita Chauhan', tags:['proposal'], createdAt:'2026-05-08' },
    { id:'t4', title:'Equipment maintenance check', description:'Treadmills 3,4,5 service overdue — call technician', assignee:'Sanjay Kumar', assigneeId:'u5', dueDate:'2026-05-09', priority:'medium', status:'todo', tags:['maintenance'], createdAt:'2026-05-06' },
    { id:'t5', title:'Chase overdue invoice - Vikram Rao', description:'5 days overdue ₹6,200 — call and confirm payment', assignee:'Aryan Mehta', assigneeId:'u1', dueDate:'2026-05-08', priority:'urgent', status:'in_progress', relatedLead:'Vikram Rao', tags:['billing'], createdAt:'2026-05-07' },
    { id:'t6', title:'Update member database', description:'Add May new joinings to CRM and create invoices', assignee:'Riya Patel', assigneeId:'u3', dueDate:'2026-05-12', priority:'medium', status:'todo', tags:['admin'], createdAt:'2026-05-05' },
    { id:'t7', title:'Monthly staff meeting', description:'Review targets, attendance, client feedback', assignee:'Aryan Mehta', assigneeId:'u1', dueDate:'2026-05-10', priority:'medium', status:'done', tags:['team'], createdAt:'2026-05-01' },
    { id:'t8', title:'WhatsApp broadcast — May offer', description:'Send Summer Offer campaign to all leads', assignee:'Riya Patel', assigneeId:'u3', dueDate:'2026-05-05', priority:'high', status:'done', tags:['marketing'], createdAt:'2026-05-03' },
    { id:'t9', title:'Kavya Pillai site visit', description:'She wants to see the premium locker room before deciding', assignee:'Sanjay Kumar', assigneeId:'u5', dueDate:'2026-05-11', priority:'low', status:'todo', relatedLead:'Kavya Pillai', tags:['site-visit'], createdAt:'2026-05-08' },
    { id:'t10', title:'Blocked: AC repair — waiting vendor', description:'Unit 2 AC not working, vendor scheduled May 12', assignee:'Sanjay Kumar', assigneeId:'u5', dueDate:'2026-05-12', priority:'high', status:'blocked', tags:['maintenance'], createdAt:'2026-05-06' },
  ]);

  invoices = signal<Invoice[]>([
    { id:'i1', orgId:'org1', invoiceNo:'INV-2026-001', customerName:'Meera Iyer', customerId:'cu1', amount:8500, taxAmount:1530, dueDate:'2026-05-08', status:'paid', paidAt:'2026-05-08', createdAt:'2026-05-01', items:[{ id:'ii1', description:'3-Month Membership + PT (5 sessions)', qty:1, rate:8500, amount:8500 }] },
    { id:'i2', orgId:'org1', invoiceNo:'INV-2026-002', customerName:'Arjun Malhotra', customerId:'cu2', amount:12000, taxAmount:2160, dueDate:'2026-05-12', status:'sent', createdAt:'2026-05-02', items:[{ id:'ii2', description:'Annual Premium Membership', qty:1, rate:12000, amount:12000 }] },
    { id:'i3', orgId:'org1', invoiceNo:'INV-2026-003', customerName:'Vikram Rao', customerId:'cu3', amount:6200, taxAmount:1116, dueDate:'2026-05-03', status:'overdue', createdAt:'2026-04-25', items:[{ id:'ii3', description:'6-Month Standard Membership', qty:1, rate:6000, amount:6000 },{ id:'ii4', description:'Locker Facility (1 month)', qty:1, rate:200, amount:200 }] },
    { id:'i4', orgId:'org1', invoiceNo:'INV-2026-004', customerName:'Sneha Reddy', customerId:'cu4', amount:9800, taxAmount:1764, dueDate:'2026-05-20', status:'draft', createdAt:'2026-05-07', items:[{ id:'ii5', description:'Annual Membership - Standard', qty:1, rate:9000, amount:9000 },{ id:'ii6', description:'Gym Kit (T-shirt + Bottle)', qty:1, rate:800, amount:800 }] },
    { id:'i5', orgId:'org1', invoiceNo:'INV-2026-005', customerName:'Rahul Sharma', customerId:'cu5', amount:15000, taxAmount:2700, dueDate:'2026-05-15', status:'sent', createdAt:'2026-05-05', items:[{ id:'ii7', description:'Annual Premium + Personal Training (12 sessions)', qty:1, rate:15000, amount:15000 }] },
    { id:'i6', orgId:'org1', invoiceNo:'INV-2026-006', customerName:'Divya Menon', customerId:'cu6', amount:7500, taxAmount:1350, dueDate:'2026-05-08', status:'paid', paidAt:'2026-05-07', createdAt:'2026-05-01', items:[{ id:'ii8', description:'Annual Membership - Standard', qty:1, rate:7500, amount:7500 }] },
    { id:'i7', orgId:'org1', invoiceNo:'INV-2026-007', customerName:'Suresh Pillai', customerId:'cu7', amount:4500, taxAmount:810, dueDate:'2026-04-30', status:'paid', paidAt:'2026-05-01', createdAt:'2026-04-20', items:[{ id:'ii9', description:'3-Month Standard Membership', qty:1, rate:4500, amount:4500 }] },
    { id:'i8', orgId:'org1', invoiceNo:'INV-2026-008', customerName:'Tara Joshi', customerId:'cu8', amount:3200, taxAmount:576, dueDate:'2026-05-25', status:'draft', createdAt:'2026-05-08', items:[{ id:'ii10', description:'Monthly Membership x2 + Group Classes', qty:1, rate:3200, amount:3200 }] },
  ]);

  workflows = signal<Workflow[]>([
    { id:'w1', name:'New Lead Welcome', trigger:'lead_created', description:'Auto-send WhatsApp welcome + create task for sales agent', isActive:true, executions:214, lastRun:'2 min ago', steps:4 },
    { id:'w2', name:'Invoice Overdue Reminder', trigger:'invoice_overdue_2d', description:'Multi-channel reminder: WhatsApp + internal task + manager alert', isActive:true, executions:38, lastRun:'45 min ago', steps:5 },
    { id:'w3', name:'Demo Class Follow-up', trigger:'tag_demo_added', description:'24hr after demo: send feedback form + membership offer', isActive:true, executions:92, lastRun:'3 hr ago', steps:3 },
    { id:'w4', name:'Member Anniversary Wish', trigger:'anniversary_date', description:'Send personalized WhatsApp + renewal offer 30 days before expiry', isActive:true, executions:12, lastRun:'1 day ago', steps:3 },
    { id:'w5', name:'Renewal Upsell Campaign', trigger:'expiry_minus_7d', description:'Upsell to premium plan 7 days before membership expiry', isActive:false, executions:0, lastRun:'Never', steps:6 },
    { id:'w6', name:'Payment Receipt Auto-send', trigger:'invoice_paid', description:'Auto-send thank you + receipt on payment webhook', isActive:true, executions:57, lastRun:'2 hr ago', steps:2 },
    { id:'w7', name:'AI Lead Score Update', trigger:'lead_replied', description:'Re-score lead with AI when they reply to a message', isActive:true, executions:340, lastRun:'6 min ago', steps:3 },
    { id:'w8', name:'Missed Call Follow-up', trigger:'missed_call', description:'Auto WhatsApp apology + rescheduling link on missed call', isActive:false, executions:0, lastRun:'Never', steps:4 },
  ]);

  campaigns = signal<Campaign[]>([
    { id:'cam1', name:'Summer Offer 2026', channel:'whatsapp', status:'completed', audience:380, sent:368, delivered:352, opened:298, scheduledAt:'2026-05-05 08:00', createdAt:'2026-05-04', template:'summer_offer_v2' },
    { id:'cam2', name:'Mother\'s Day Special', channel:'whatsapp', status:'scheduled', audience:245, sent:0, delivered:0, opened:0, scheduledAt:'2026-05-11 09:00', createdAt:'2026-05-07', template:'mothers_day_2026' },
    { id:'cam3', name:'May Membership Drive', channel:'email', status:'running', audience:520, sent:310, delivered:298, opened:187, scheduledAt:'2026-05-08 07:00', createdAt:'2026-05-06', template:'may_drive_email' },
    { id:'cam4', name:'Lapsed Member Win-back', channel:'whatsapp', status:'draft', audience:72, sent:0, delivered:0, opened:0, scheduledAt:'', createdAt:'2026-05-07', template:'winback_v1' },
    { id:'cam5', name:'New Equipment Launch', channel:'sms', status:'completed', audience:412, sent:412, delivered:398, opened:0, scheduledAt:'2026-04-28 10:00', createdAt:'2026-04-27', template:'equipment_launch_sms' },
  ]);

  employees = signal<Employee[]>([
    { id:'u1', name:'Aryan Mehta', email:'aryan@fitzoneGym.com', phone:'+91 98765 43210', role:'Org Owner', department:'Management', joinDate:'2023-01-15', status:'active', attendanceToday:'present', avatarColor:'linear-gradient(135deg,#06b6d4,#3b82f6)', salary:85000 },
    { id:'u2', name:'Priya Sharma', email:'priya.s@fitzoneGym.com', phone:'+91 98765 43211', role:'Manager', department:'Operations', joinDate:'2023-03-20', status:'active', attendanceToday:'present', avatarColor:'linear-gradient(135deg,#6366f1,#8b5cf6)', salary:55000 },
    { id:'u3', name:'Riya Patel', email:'riya@fitzoneGym.com', phone:'+91 98765 43212', role:'Sales Agent', department:'Sales', joinDate:'2023-06-01', status:'active', attendanceToday:'present', avatarColor:'linear-gradient(135deg,#22c55e,#06b6d4)', salary:38000 },
    { id:'u4', name:'Rohit Desai', email:'rohit@fitzoneGym.com', phone:'+91 98765 43213', role:'Sales Agent', department:'Sales', joinDate:'2024-01-10', status:'active', attendanceToday:'half_day', avatarColor:'linear-gradient(135deg,#f59e0b,#ef4444)', salary:36000 },
    { id:'u5', name:'Sanjay Kumar', email:'sanjay@fitzoneGym.com', phone:'+91 98765 43214', role:'Employee', department:'Operations', joinDate:'2023-09-15', status:'active', attendanceToday:'present', avatarColor:'linear-gradient(135deg,#a855f7,#ec4899)', salary:28000 },
    { id:'u6', name:'Anjali Nair', email:'anjali@fitzoneGym.com', phone:'+91 98765 43215', role:'Employee', department:'Fitness', joinDate:'2024-02-01', status:'active', attendanceToday:'present', avatarColor:'linear-gradient(135deg,#ef4444,#f59e0b)', salary:32000 },
    { id:'u7', name:'Vikram Singh', email:'vikram.s@fitzoneGym.com', phone:'+91 98765 43216', role:'Employee', department:'Fitness', joinDate:'2023-11-01', status:'on_leave', attendanceToday:'leave', avatarColor:'linear-gradient(135deg,#0ea5e9,#6366f1)', salary:30000 },
    { id:'u8', name:'Deepa Rao', email:'deepa@fitzoneGym.com', phone:'+91 98765 43217', role:'Employee', department:'Front Desk', joinDate:'2024-03-15', status:'active', attendanceToday:'absent', avatarColor:'linear-gradient(135deg,#22c55e,#f59e0b)', salary:25000 },
  ]);

  attendance = signal<AttendanceRecord[]>([
    { id:'a1', employeeId:'u1', employeeName:'Aryan Mehta', date:'2026-05-08', checkIn:'09:02', checkOut:'', status:'present', hours:0, avatarColor:'linear-gradient(135deg,#06b6d4,#3b82f6)' },
    { id:'a2', employeeId:'u2', employeeName:'Priya Sharma', date:'2026-05-08', checkIn:'08:55', checkOut:'', status:'present', hours:0, avatarColor:'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { id:'a3', employeeId:'u3', employeeName:'Riya Patel', date:'2026-05-08', checkIn:'09:15', checkOut:'', status:'present', hours:0, avatarColor:'linear-gradient(135deg,#22c55e,#06b6d4)' },
    { id:'a4', employeeId:'u4', employeeName:'Rohit Desai', date:'2026-05-08', checkIn:'10:30', checkOut:'14:00', status:'half_day', hours:3.5, avatarColor:'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { id:'a5', employeeId:'u5', employeeName:'Sanjay Kumar', date:'2026-05-08', checkIn:'08:45', checkOut:'', status:'present', hours:0, avatarColor:'linear-gradient(135deg,#a855f7,#ec4899)' },
    { id:'a6', employeeId:'u6', employeeName:'Anjali Nair', date:'2026-05-08', checkIn:'09:00', checkOut:'', status:'present', hours:0, avatarColor:'linear-gradient(135deg,#ef4444,#f59e0b)' },
    { id:'a7', employeeId:'u7', employeeName:'Vikram Singh', date:'2026-05-08', checkIn:'', checkOut:'', status:'leave', hours:0, avatarColor:'linear-gradient(135deg,#0ea5e9,#6366f1)' },
    { id:'a8', employeeId:'u8', employeeName:'Deepa Rao', date:'2026-05-08', checkIn:'', checkOut:'', status:'absent', hours:0, avatarColor:'linear-gradient(135deg,#22c55e,#f59e0b)' },
  ]);

  users = signal<User[]>([
    { id:'u1', name:'Aryan Mehta', email:'aryan@fitzoneGym.com', phone:'+91 98765 43210', role:'org_owner', avatar:'AM', orgId:'org1', status:'active', createdAt:'2023-01-15', avatarColor:'linear-gradient(135deg,#06b6d4,#3b82f6)' },
    { id:'u2', name:'Priya Sharma', email:'priya.s@fitzoneGym.com', phone:'+91 98765 43211', role:'manager', avatar:'PS', orgId:'org1', status:'active', createdAt:'2023-03-20', avatarColor:'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { id:'u3', name:'Riya Patel', email:'riya@fitzoneGym.com', phone:'+91 98765 43212', role:'sales_agent', avatar:'RP', orgId:'org1', status:'active', createdAt:'2023-06-01', avatarColor:'linear-gradient(135deg,#22c55e,#06b6d4)' },
    { id:'u4', name:'Rohit Desai', email:'rohit@fitzoneGym.com', phone:'+91 98765 43213', role:'sales_agent', avatar:'RD', orgId:'org1', status:'active', createdAt:'2024-01-10', avatarColor:'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { id:'u5', name:'Sanjay Kumar', email:'sanjay@fitzoneGym.com', phone:'+91 98765 43214', role:'employee', avatar:'SK', orgId:'org1', status:'active', createdAt:'2023-09-15', avatarColor:'linear-gradient(135deg,#a855f7,#ec4899)' },
    { id:'u6', name:'Anjali Nair', email:'anjali@fitzoneGym.com', phone:'+91 98765 43215', role:'employee', avatar:'AN', orgId:'org1', status:'active', createdAt:'2024-02-01', avatarColor:'linear-gradient(135deg,#ef4444,#f59e0b)' },
  ]);

  switchRole(role: Role): void {
    this.currentRole.set(role);
    const user = this.users().find(u => u.role === role) ?? this.users()[0];
    this.currentUser.set(user);
  }
}
