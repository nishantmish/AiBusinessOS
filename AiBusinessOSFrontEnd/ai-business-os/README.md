# 🚀 AI Business OS — Angular 21 Full-Stack SaaS UI

**Complete multi-module Angular 21 application** with mock data, role-based permissions, and all 12 modules fully implemented.

## ▶️ Run Locally

```bash
# Option 1: Angular dev server (hot reload)
cd ai-business-os
npm install
ng serve --port 4200
# Open http://localhost:4200

# Option 2: Serve built files (already built)
cd ai-business-os/dist/ai-business-os/browser
python3 -m http.server 4200
# Open http://localhost:4200
```

## 📦 Modules Included (12)
| Module | Route | Features |
|--------|-------|---------|
| Dashboard | /dashboard | KPIs, charts, pipeline, inbox, activity |
| CRM | /crm | Table + Kanban, lead scoring, add/view leads |
| WhatsApp Inbox | /inbox | Real-time chat, quick replies, AI assist |
| Tasks | /tasks | Kanban board, priorities, status toggle |
| Invoices | /invoices | CRUD, mark paid, detail modal |
| Analytics | /analytics | Chart.js charts, funnel, source breakdown |
| Workflows | /workflows | Toggle on/off, execution counts |
| Campaigns | /campaigns | WhatsApp/Email/SMS, stats |
| Team | /team | Employee cards, payroll |
| Attendance | /attendance | Check-in/out, weekly heatmap |
| AI Reports | /ai-reports | 4 AI-generated report types |
| Settings | /settings | 6 tabs: org, integrations, roles, billing, notifs, API |

## 🔐 Role-Based Permissions (7 Roles)
Switch roles via **top-right avatar → Switch Role** button:
- **Org Owner** — all 12 modules
- **Super Admin** — all 12 modules + system access
- **Manager** — 9 modules
- **Sales Agent** — 5 modules (CRM, Inbox, Tasks, Invoices, Dashboard)
- **Employee** — 3 modules (Dashboard, Tasks, Attendance)
- **Customer** — 1 module (Invoices)
- **AI Agent** — 4 modules

## 🛠️ Tech Stack
- Angular 21 (Standalone Components + Signals)
- TypeScript strict mode
- SCSS with CSS custom properties
- Chart.js for analytics
- Tabler Icons webfont
- Google Fonts (DM Sans + DM Mono)
