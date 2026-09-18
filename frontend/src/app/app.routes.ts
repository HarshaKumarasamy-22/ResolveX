import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/dashboard/admin-dashboard.component';
import { AnalyticsDashboardComponent } from './admin/analytics-dashboard/analytics-dashboard.component';
import { AdminRequestsComponent } from './admin/requests/admin-requests.component';
import { AdminUsersComponent } from './admin/users/admin-users.component';
import { AitStructureComponent } from './admin/structure/ait-structure.component';

export const routes: Routes = [
  // 1. Primary Admin Portal Routes (Person 1 - Harsha Module)
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        title: 'ResolveX - AIT Admin Operations Dashboard',
      },
      {
        path: 'analytics',
        component: AnalyticsDashboardComponent,
        title: 'ResolveX - Analytics',
      },
      {
        path: 'requests',
        component: AdminRequestsComponent,
        title: 'ResolveX - All Service Requests Management',
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        title: 'ResolveX - AIT User & Staff Management',
      },
      {
        path: 'structure',
        component: AitStructureComponent,
        title: 'ResolveX - AIT University Hierarchy & Structure',
      },
    ],
  },

  // 2. Fallback
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
