# ResolveX – Smart Service Request & Issue Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68a063?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![Angular](https://img.shields.io/badge/Angular-17%2B-dd0031?style=for-the-badge&logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169e1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-UI_Kit-e24c4c?style=for-the-badge)](https://primeng.org)

**ResolveX** is an enterprise-grade, centralized service desk and issue management platform designed for organizations (universities, enterprises, institutions) to raise, triage, track, assign, and resolve internal IT, network, facility, and administrative service requests.

Built with a modern three-tier architecture featuring an **Angular SPA**, a **Node.js/Express TypeScript REST API**, and a **PostgreSQL** database.

---

## 📌 Key Capabilities

- 🔐 **Role-Based Access Control (RBAC)**: Distinct permissions for **Requesters (`user`)** and **Support Staff / Administrators (`admin`)** protected with stateless JWT authentication.
- ⚡ **Workflow State Machine**: Structured lifecycle transitions with backend validation:
  $$\text{Pending} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Resolved} \longrightarrow \text{Closed}$$
  *(Supports controlled reopen workflows).*
- 📊 **Real-Time Admin Operations Dashboard**: Live metric summary cards for Pending, Assigned, In-Progress, Resolved, and Critical tickets powered by SQL aggregate queries.
- 🔍 **Interactive Data Grid (PrimeNG)**: Multi-field filtering (Status, Priority, Category, Assignee), keyword search, and server-side pagination.
- 👥 **Staff Assignment Engine**: Dynamic modal dialogs to delegate service requests to designated support engineers with audit preservation.
- 📜 **Immutable Activity Audit Trail**: Automatic chronological logging of every state modification, assignment, and priority shift.
- 💬 **Collaborative Discussions**: Threaded request comments between requesters and assigned staff.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer (Angular 17+)"]
        A[User Request Portal] 
        B[Admin Operations Dashboard]
        C[PrimeNG Data Grids & Modals]
    end

    subgraph Server ["Backend Layer (Express + TypeScript)"]
        D[JWT Auth & RBAC Middleware]
        E[Request & Workflow State Machine]
        F[Assignment & User Management Engine]
        G[Activity Logger Service]
    end

    subgraph Database ["Data Layer (PostgreSQL)"]
        H[(Users & Roles)]
        I[(Requests & Categories)]
        J[(Assignments History)]
        K[(Immutable Activity Logs)]
        L[(Comments)]
    end

    Client -->|REST API / HTTPS JSON| Server
    Server -->|Parameterized SQL Queries| Database
```

---

## 👥 Module Distribution (Vertical Slice Ownership)

| Module | Scope / Responsibility | Key Deliverables |
| :--- | :--- | :--- |
| **Person 1** | **Authentication & User Requests** | User registration, JWT login, "Create Request" form, "My Requests" list, user ownership authorization. |
| **Person 2** | **Admin Dashboard, Assignment & Workflow** | All-Requests table with filters/search, assignment modal, status state machine (`requireRole('admin')`), priority management, user admin screen, dashboard metrics. |
| **Person 3** | **Comments, Activity & Analytics** | Discussion comments API & UI, immutable activity log helper (`logActivity`), PrimeNG Timeline component, Chart.js analytics dashboard. |

---

## 🗂️ Project Structure

```text
ResolveX/
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL pool connection & environment config
│   │   ├── middleware/      # JWT auth, requireRole('admin'), error handler
│   │   ├── modules/
│   │   │   ├── admin/       # Admin controller, service, routes, Zod schemas
│   │   │   ├── auth/        # Login/Register endpoints & token verification
│   │   │   ├── requests/    # User request CRUD & lifecycle actions
│   │   │   ├── comments/    # Comment discussion system
│   │   │   └── analytics/   # SQL aggregate reporting endpoints
│   │   ├── utils/           # logActivity() audit trail helper
│   │   ├── app.ts           # Express application configuration
│   │   └── server.ts        # Server bootstrap entry point
│   ├── .env.example         # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Models, AuthService, AdminService, JWT Interceptor, Guards
│   │   │   ├── admin/       # Admin Dashboard, All-Requests table, User Management
│   │   │   ├── auth/        # Login & Register views
│   │   │   ├── requests/    # Create Request & My Requests views
│   │   │   └── shared/      # Timeline, comments, toast notifications, navbar
│   │   └── styles.css       # Tailwind CSS & PrimeIcons configuration
│   └── package.json
│
├── database/
│   ├── schema.sql           # PostgreSQL table definitions & performance indexes
│   └── seed.sql             # Initial mock data (Users, categories, tickets, logs)
│
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL**: `15+` (Local instance or Cloud PostgreSQL e.g., Supabase, Neon)

---

### 2. Database Setup
1. Create a PostgreSQL database named `resolvex_db` (or use a cloud connection URL).
2. Execute the schema and seed scripts:
```bash
# Using psql command line
psql -U postgres -d resolvex_db -f database/schema.sql
psql -U postgres -d resolvex_db -f database/seed.sql
```

---

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your local environment configuration:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your PostgreSQL database credentials and JWT secret:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/resolvex_db
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=8h
   ```
4. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
   *Backend will run on:* `http://localhost:5000/api`

---

### 4. Frontend Setup
1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Angular application:
   ```bash
   npm start
   ```
   *Access the web application at:* `http://localhost:4200`

---

## 📡 REST API Reference

### 🛡️ Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user session |

### 🛠️ Admin & Workflow (`/api/admin`) — *Requires `admin` role*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard/summary` | Aggregate metrics (Total, Pending, In-Progress, Resolved, Critical) |
| `GET` | `/api/admin/requests` | Paginated ticket listing with search & multi-filters |
| `PATCH` | `/api/admin/requests/:id/status` | Execute state machine status transitions |
| `PATCH` | `/api/admin/requests/:id/priority` | Update ticket urgency (`Low`, `Medium`, `High`, `Critical`) |
| `POST` | `/api/admin/requests/:id/assign` | Assign ticket to support staff |
| `GET` | `/api/admin/users` | List all users with status & roles |
| `PATCH` | `/api/admin/users/:id/status` | Activate/Deactivate user or change role |

---

## 🌿 Git Branching Strategy

```text
main                    (Production / Demo-ready branch)
  └── dev               (Integration branch)
        ├── feature/auth-requests         (Person 1)
        ├── feature/admin-workflow/harsha (Person 2)
        └── feature/comments-analytics    (Person 3)
```

---

## 👨‍💻 Contributing Team
- **Person 1**: Authentication & User Request Management
- **Person 2**: Admin Dashboard, Assignment Workflow & State Machine
- **Person 3**: Comments, Activity Audit Logging & Analytics Charts

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).