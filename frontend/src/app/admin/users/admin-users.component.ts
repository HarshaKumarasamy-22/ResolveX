import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>

    <div class="space-y-6">
      <!-- Title Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">User Administration</h1>
          <p class="text-sm text-slate-500">Manage user accounts, roles, and system activation status.</p>
        </div>
        <button
          (click)="loadUsers()"
          class="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow transition flex items-center gap-1.5 self-start"
        >
          <i class="pi pi-refresh" [class.pi-spin]="loading()"></i>
          <span>Reload Users</span>
        </button>
      </div>

      <!-- Filter / Search Bar -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Search by Name or Email</label>
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="loadUsers()"
              placeholder="Search user..."
              class="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Role Filter</label>
          <select
            [(ngModel)]="selectedRole"
            (change)="loadUsers()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="user">Requester (User)</option>
            <option value="admin">Administrator / Support Staff</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Account Status</label>
          <select
            [(ngModel)]="selectedStatus"
            (change)="loadUsers()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Accounts Only</option>
            <option value="false">Deactivated Only</option>
          </select>
        </div>
      </div>

      <!-- Users Table (FR-2.6) -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <p-table
          [value]="users()"
          [loading]="loading()"
          [paginator]="true"
          [rows]="10"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-sm p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr class="bg-slate-100/80 text-slate-700 text-xs font-semibold uppercase tracking-wider">
              <th class="w-16 py-3 px-4">ID</th>
              <th class="py-3 px-4">User Details</th>
              <th class="w-36 py-3 px-4">Role</th>
              <th class="w-32 py-3 px-4">Account Status</th>
              <th class="w-40 py-3 px-4">Registered Date</th>
              <th class="w-48 py-3 px-4 text-center">Manage Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-u>
            <tr class="hover:bg-slate-50 transition text-xs text-slate-800">
              <td class="py-3 px-4 font-mono font-bold text-slate-500">#{{ u.id }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                  <div class="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                    {{ u.full_name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-semibold text-slate-900">{{ u.full_name }}</div>
                    <div class="text-[11px] text-slate-500">{{ u.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Role with Selector -->
              <td class="py-3 px-4">
                <span
                  [ngClass]="{
                    'bg-purple-100 text-purple-700 border-purple-200': u.role === 'admin',
                    'bg-slate-100 text-slate-700 border-slate-200': u.role === 'user'
                  }"
                  class="px-2.5 py-1 rounded-md text-[11px] font-semibold border uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <i class="pi pi-shield text-[10px]" *ngIf="u.role === 'admin'"></i>
                  <i class="pi pi-user text-[10px]" *ngIf="u.role === 'user'"></i>
                  <span>{{ u.role }}</span>
                </span>
              </td>

              <!-- Status -->
              <td class="py-3 px-4">
                <span
                  [ngClass]="{
                    'bg-emerald-100 text-emerald-800 border-emerald-200': u.is_active,
                    'bg-rose-100 text-rose-800 border-rose-200': !u.is_active
                  }"
                  class="px-2.5 py-1 rounded-md text-[11px] font-semibold border inline-flex items-center gap-1"
                >
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="u.is_active ? 'bg-emerald-600' : 'bg-rose-600'"></span>
                  <span>{{ u.is_active ? 'Active' : 'Deactivated' }}</span>
                </span>
              </td>

              <!-- Created At -->
              <td class="py-3 px-4 font-mono text-[11px] text-slate-500">
                {{ u.created_at | date : 'mediumDate' }}
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <!-- Toggle Active / Deactivate -->
                  <button
                    (click)="toggleUserActive(u)"
                    [ngClass]="{
                      'bg-rose-50 text-rose-700 hover:bg-rose-100': u.is_active,
                      'bg-emerald-50 text-emerald-700 hover:bg-emerald-100': !u.is_active
                    }"
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                  >
                    {{ u.is_active ? 'Deactivate' : 'Reactivate' }}
                  </button>

                  <!-- Toggle Role -->
                  <button
                    (click)="toggleUserRole(u)"
                    class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                  >
                    Set as {{ u.role === 'admin' ? 'User' : 'Admin' }}
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-8 text-slate-400">
                No users found.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  adminService = inject(AdminService);
  messageService = inject(MessageService);

  users = signal<User[]>([]);
  loading = signal<boolean>(false);

  searchQuery = '';
  selectedRole = '';
  selectedStatus = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService
      .getUsers({
        search: this.searchQuery || undefined,
        role: this.selectedRole || undefined,
        is_active: this.selectedStatus !== '' ? this.selectedStatus === 'true' : undefined,
      })
      .subscribe({
        next: (res) => {
          this.users.set(res.data || []);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  toggleUserActive(user: User): void {
    const updatedStatus = !user.is_active;
    this.adminService.updateUser(user.id, { is_active: updatedStatus }).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Status Updated',
          detail: `User account is now ${updatedStatus ? 'Active' : 'Deactivated'}`,
        });
        this.loadUsers();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: err.error?.message,
        });
      },
    });
  }

  toggleUserRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    this.adminService.updateUser(user.id, { role: newRole }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Role Changed',
          detail: `${user.full_name}'s role updated to ${newRole.toUpperCase()}`,
        });
        this.loadUsers();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Role Update Failed',
          detail: err.error?.message,
        });
      },
    });
  }
}
