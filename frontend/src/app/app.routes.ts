import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/dashboard/admin-dashboard.component';
import { AdminRequestsComponent } from './admin/requests/admin-requests.component';
import { AdminUsersComponent } from './admin/users/admin-users.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'admin',
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
        title: 'ResolveX - Admin Dashboard',
      },
      {
        path: 'requests',
        component: AdminRequestsComponent,
        title: 'ResolveX - Manage Requests',
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        title: 'ResolveX - User Management',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'admin/dashboard',
  },
];
