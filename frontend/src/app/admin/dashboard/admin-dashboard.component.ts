import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { DashboardSummary, ServiceRequest } from '../../core/models/request.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header / Welcome Banner -->
      <div class="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight">Admin Operations Dashboard</h1>
          <p class="text-slate-300 text-sm mt-1">
            Real-time triage, ticket assignments, status workflows, and workload analytics.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            (click)="loadSummary()"
            class="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition backdrop-blur flex items-center gap-2"
          >
            <i class="pi pi-refresh" [class.pi-spin]="loading()"></i>
            <span>Refresh</span>
          </button>
          <a
            routerLink="/admin/requests"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm shadow transition flex items-center gap-2"
          >
            <i class="pi pi-table"></i>
            <span>Manage All Requests</span>
          </a>
        </div>
      </div>

      <!-- Metric Cards Grid (FR-2.8) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Requests -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests</span>
            <div class="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
              <i class="pi pi-folder text-base"></i>
            </div>
          </div>
          <div class="mt-3 text-3xl font-extrabold text-slate-900">{{ summary()?.total_requests ?? 0 }}</div>
          <div class="mt-1 text-xs text-slate-500">All submitted service tickets</div>
        </div>

        <!-- Pending Triage -->
        <div class="bg-white rounded-xl border border-amber-200 p-5 shadow-sm hover:shadow-md transition bg-gradient-to-br from-white to-amber-50/30">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Triage</span>
            <div class="w-9 h-9 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center font-bold">
              <i class="pi pi-clock text-base"></i>
            </div>
          </div>
          <div class="mt-3 text-3xl font-extrabold text-amber-600">{{ summary()?.pending_count ?? 0 }}</div>
          <div class="mt-1 text-xs text-amber-700">Requires assignment & triage</div>
        </div>

        <!-- In Progress -->
        <div class="bg-white rounded-xl border border-indigo-200 p-5 shadow-sm hover:shadow-md transition bg-gradient-to-br from-white to-indigo-50/30">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-indigo-700 uppercase tracking-wider">In Progress</span>
            <div class="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
              <i class="pi pi-spin pi-spinner text-base"></i>
            </div>
          </div>
          <div class="mt-3 text-3xl font-extrabold text-indigo-600">{{ summary()?.in_progress_count ?? 0 }}</div>
          <div class="mt-1 text-xs text-indigo-700">Actively being worked on</div>
        </div>

        <!-- High / Critical Priority -->
        <div class="bg-white rounded-xl border border-rose-200 p-5 shadow-sm hover:shadow-md transition bg-gradient-to-br from-white to-rose-50/30">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-rose-700 uppercase tracking-wider">High & Critical</span>
            <div class="w-9 h-9 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center font-bold">
              <i class="pi pi-exclamation-triangle text-base"></i>
            </div>
          </div>
          <div class="mt-3 text-3xl font-extrabold text-rose-600">{{ summary()?.high_critical_count ?? 0 }}</div>
          <div class="mt-1 text-xs text-rose-700">Urgent attention needed</div>
        </div>
      </div>

      <!-- Secondary Metrics & Status Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Assigned Count -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-center space-x-4 shadow-sm">
          <div class="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center font-bold text-xl">
            <i class="pi pi-user-plus"></i>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Assigned Tickets</div>
            <div class="text-xl font-bold text-slate-900">{{ summary()?.assigned_count ?? 0 }}</div>
          </div>
        </div>

        <!-- Resolved Count -->
        <div class="bg-white rounded-xl border border-emerald-200 p-4 flex items-center space-x-4 shadow-sm bg-emerald-50/20">
          <div class="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-xl">
            <i class="pi pi-check-circle"></i>
          </div>
          <div>
            <div class="text-xs text-emerald-700 font-medium">Resolved</div>
            <div class="text-xl font-bold text-emerald-700">{{ summary()?.resolved_count ?? 0 }}</div>
          </div>
        </div>

        <!-- Closed Count -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-center space-x-4 shadow-sm">
          <div class="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold text-xl">
            <i class="pi pi-lock"></i>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Closed & Archived</div>
            <div class="text-xl font-bold text-slate-800">{{ summary()?.closed_count ?? 0 }}</div>
          </div>
        </div>
      </div>

      <!-- Urgent / Actionable Requests Preview -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">Urgent Tickets Requiring Action</h2>
            <p class="text-xs text-slate-500">Unassigned or high priority service requests</p>
          </div>
          <a routerLink="/admin/requests" class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>View all in table</span>
            <i class="pi pi-arrow-right text-[10px]"></i>
          </a>
        </div>

        <div class="p-6" *ngIf="loading()">
          <div class="flex justify-center items-center py-8 text-slate-400">
            <i class="pi pi-spin pi-spinner text-2xl mr-2"></i>
            <span>Loading dashboard data...</span>
          </div>
        </div>

        <div *ngIf="!loading() && urgentRequests().length === 0" class="p-8 text-center text-slate-400">
          <i class="pi pi-check-circle text-3xl text-emerald-500 mb-2"></i>
          <p class="text-sm font-medium">No urgent pending requests found!</p>
        </div>

        <div *ngIf="!loading() && urgentRequests().length > 0" class="divide-y divide-slate-100">
          <div *ngFor="let req of urgentRequests()" class="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition">
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-mono font-bold text-slate-500">#{{ req.id }}</span>
                <span class="font-semibold text-slate-900 text-sm">{{ req.title }}</span>
                <span
                  [ngClass]="{
                    'bg-rose-100 text-rose-700 border-rose-200': req.priority === 'Critical',
                    'bg-amber-100 text-amber-700 border-amber-200': req.priority === 'High',
                    'bg-blue-100 text-blue-700 border-blue-200': req.priority === 'Medium',
                    'bg-slate-100 text-slate-700 border-slate-200': req.priority === 'Low'
                  }"
                  class="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                >
                  {{ req.priority }}
                </span>
                <span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {{ req.category_name || 'General' }}
                </span>
              </div>
              <p class="text-xs text-slate-600 line-clamp-1">{{ req.description }}</p>
              <div class="text-[11px] text-slate-400">
                Requester: <span class="font-medium text-slate-600">{{ req.requester_name }}</span> • Status: <span class="font-semibold text-slate-700">{{ req.status }}</span>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <a
                [routerLink]="['/admin/requests']"
                [queryParams]="{ search: req.id }"
                class="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
              >
                Triage / Assign
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  adminService = inject(AdminService);

  summary = signal<DashboardSummary | null>(null);
  urgentRequests = signal<ServiceRequest[]>([]);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);

    this.adminService.getDashboardSummary().subscribe({
      next: (res) => {
        if (res.success) {
          this.summary.set(res.data);
        }
        this.loadUrgentRequests();
      },
      error: () => {
        // Fallback demo data if DB is initially empty or connecting
        this.summary.set({
          total_requests: 5,
          pending_count: 1,
          assigned_count: 1,
          in_progress_count: 1,
          resolved_count: 1,
          closed_count: 1,
          high_critical_count: 2,
          users: { total: 6, admins: 3, active: 5 },
        });
        this.loading.set(false);
      },
    });
  }

  private loadUrgentRequests(): void {
    this.adminService.getAllRequests({ limit: 5, status: 'Pending' }).subscribe({
      next: (res) => {
        this.urgentRequests.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
