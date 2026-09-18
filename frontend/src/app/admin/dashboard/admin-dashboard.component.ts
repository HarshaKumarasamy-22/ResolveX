import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
      <div class="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 font-mono">
              Aurevia Institute of Technology (AIT)
            </span>
            <span class="text-xs text-slate-300">ResolveX Administration Center</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight mt-1.5">AIT Admin Operations Dashboard</h1>
          <p class="text-slate-300 text-xs sm:text-sm mt-1">
            University-wide request triage, workload allocation, and department performance metrics.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            (click)="loadSummary()"
            class="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition backdrop-blur flex items-center gap-2 border border-white/10"
          >
            <i class="pi pi-refresh" [class.pi-spin]="loading()"></i>
            <span>Refresh</span>
          </button>
          <a
            routerLink="/requests"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-md transition flex items-center gap-2"
          >
            <i class="pi pi-table"></i>
            <span>Manage All Requests</span>
          </a>
        </div>
      </div>

      <!-- Metric Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Requests -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div class="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Requests</span>
            <div class="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
              <i class="pi pi-folder text-base"></i>
            </div>
          </div>
          <div class="mt-3 text-3xl font-extrabold text-slate-900">{{ summary()?.total_requests ?? 0 }}</div>
          <div class="mt-2 flex items-center text-xs text-slate-500">
            <span class="font-medium text-slate-700">{{ summary()?.users?.total ?? 0 }} registered university members</span>
          </div>
        </div>

        <!-- Pending Triage -->
        <div class="bg-white rounded-xl border border-amber-200 p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group bg-gradient-to-br from-white to-amber-50/40">
          <div class="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Triage</span>
            <div class="w-9 h-9 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold">
              <i class="pi pi-clock text-base"></i>
            </div>
          </div>
          <div class="mt-3 text-3xl font-extrabold text-amber-600">{{ summary()?.pending_count ?? 0 }}</div>
          <div class="mt-2 text-xs text-amber-700 font-medium">Awaiting team/staff assignment</div>
        </div>

        <!-- In Progress -->
        <div class="bg-white rounded-xl border border-indigo-200 p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group bg-gradient-to-br from-white to-indigo-50/40">
          <div class="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-indigo-800 uppercase tracking-wider">Active Workload</span>
            <div class="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold">
              <i class="pi pi-spin pi-spinner text-base"></i>
            </div>
          </div>
          <div class="mt-3 text-3xl font-extrabold text-indigo-600">
            {{ (summary()?.in_progress_count ?? 0) + (summary()?.assigned_count ?? 0) }}
          </div>
          <div class="mt-2 text-xs text-indigo-700 font-medium">Under active resolution</div>
        </div>

        <!-- High / Urgent Priority -->
        <div class="bg-white rounded-xl border border-rose-200 p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group bg-gradient-to-br from-white to-rose-50/40">
          <div class="absolute top-0 left-0 right-0 h-1 bg-rose-600"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-rose-800 uppercase tracking-wider">Urgent & High</span>
            <div class="w-9 h-9 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center font-bold">
              <i class="pi pi-exclamation-triangle text-base"></i>
            </div>
          </div>
          <div class="mt-3 text-3xl font-extrabold text-rose-600">{{ summary()?.urgent_high_count ?? 0 }}</div>
          <div class="mt-2 text-xs text-rose-700 font-medium">Urgent lecture/lab incidents</div>
        </div>
      </div>

      <!-- Lifecycle Distribution & Operational Health -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Status Distribution Progress -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-slate-900">Request Lifecycle Distribution</h2>
              <p class="text-xs text-slate-500">Breakdown of all AIT service tickets by current lifecycle state</p>
            </div>
            <span class="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {{ summary()?.total_requests ?? 0 }} Total
            </span>
          </div>

          <!-- Multi-Segment Visual Progress Bar -->
          <div class="w-full bg-slate-100 rounded-full h-4 flex overflow-hidden shadow-inner my-4">
            <div
              [style.width.%]="getStatusPercentage('Pending')"
              class="bg-amber-500 transition-all duration-500"
              title="Pending"
            ></div>
            <div
              [style.width.%]="getStatusPercentage('Assigned')"
              class="bg-sky-500 transition-all duration-500"
              title="Assigned"
            ></div>
            <div
              [style.width.%]="getStatusPercentage('In Progress')"
              class="bg-indigo-600 transition-all duration-500"
              title="In Progress"
            ></div>
            <div
              [style.width.%]="getStatusPercentage('Resolved')"
              class="bg-emerald-500 transition-all duration-500"
              title="Resolved"
            ></div>
            <div
              [style.width.%]="getStatusPercentage('Closed')"
              class="bg-slate-400 transition-all duration-500"
              title="Closed"
            ></div>
          </div>

          <!-- Status Legend & Counts -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div class="space-y-1">
              <div class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span class="text-slate-600 font-medium">Pending</span>
              </div>
              <div class="text-base font-bold text-slate-900">{{ summary()?.pending_count ?? 0 }}</div>
              <div class="text-[10px] text-slate-400">{{ getStatusPercentage('Pending') | number : '1.0-1' }}%</div>
            </div>

            <div class="space-y-1">
              <div class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span class="text-slate-600 font-medium">Assigned</span>
              </div>
              <div class="text-base font-bold text-slate-900">{{ summary()?.assigned_count ?? 0 }}</div>
              <div class="text-[10px] text-slate-400">{{ getStatusPercentage('Assigned') | number : '1.0-1' }}%</div>
            </div>

            <div class="space-y-1">
              <div class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span class="text-slate-600 font-medium">In Progress</span>
              </div>
              <div class="text-base font-bold text-slate-900">{{ summary()?.in_progress_count ?? 0 }}</div>
              <div class="text-[10px] text-slate-400">{{ getStatusPercentage('In Progress') | number : '1.0-1' }}%</div>
            </div>

            <div class="space-y-1">
              <div class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span class="text-slate-600 font-medium">Resolved</span>
              </div>
              <div class="text-base font-bold text-slate-900">{{ summary()?.resolved_count ?? 0 }}</div>
              <div class="text-[10px] text-slate-400">{{ getStatusPercentage('Resolved') | number : '1.0-1' }}%</div>
            </div>

            <div class="space-y-1">
              <div class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span class="text-slate-600 font-medium">Closed</span>
              </div>
              <div class="text-base font-bold text-slate-900">{{ summary()?.closed_count ?? 0 }}</div>
              <div class="text-[10px] text-slate-400">{{ getStatusPercentage('Closed') | number : '1.0-1' }}%</div>
            </div>
          </div>
        </div>

        <!-- Operational Health & Team Summary -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">AIT Service Desk Health</h2>
            <p class="text-xs text-slate-500 mt-0.5">Key resolution & team efficiency metrics</p>

            <div class="mt-5 space-y-4">
              <!-- Resolution Rate -->
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-slate-700">Resolution Rate</span>
                  <span class="text-emerald-600 font-bold">{{ resolutionRate() }}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                  <div [style.width.%]="resolutionRate()" class="bg-emerald-500 h-2 rounded-full transition-all duration-500"></div>
                </div>
              </div>

              <!-- University Support Staff Breakdown -->
              <div class="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-slate-600">Students Registered:</span>
                  <span class="font-bold text-slate-900">{{ summary()?.users?.students ?? 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-600">Academic Lecturers:</span>
                  <span class="font-bold text-slate-900">{{ summary()?.users?.lecturers ?? 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-600">Active Support Engineers:</span>
                  <span class="font-bold text-indigo-600">{{ summary()?.users?.support_staff ?? 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-100">
            <a
              routerLink="/users"
              class="w-full block text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
            >
              Manage University Accounts
            </a>
          </div>
        </div>
      </div>

      <!-- Departmental & Category Breakdown Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" *ngIf="summary()?.by_department">
        <!-- Faculty / Department Distribution -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-900">Requests by AIT Faculty / Division</h2>
            <span class="text-[10px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded font-bold">
              5 Divisions
            </span>
          </div>

          <div class="space-y-3">
            <div *ngFor="let d of summary()?.by_department" class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="font-semibold text-slate-700 truncate max-w-xs">{{ d.department }}</span>
                <span class="font-bold text-slate-900 font-mono">{{ d.count }} tickets</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div
                  [style.width.%]="(d.count / (summary()?.total_requests || 1)) * 100"
                  class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Category Distribution -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-900">Requests by Service Category</h2>
            <span class="text-[10px] bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded font-bold">
              8 Categories
            </span>
          </div>

          <div class="space-y-3">
            <div *ngFor="let c of summary()?.by_category" class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="font-semibold text-slate-700 truncate max-w-xs">{{ c.category }}</span>
                <span class="font-bold text-slate-900 font-mono">{{ c.count }} tickets</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div
                  [style.width.%]="(c.count / (summary()?.total_requests || 1)) * 100"
                  class="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Urgent / Actionable Requests Preview -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <div>
              <h2 class="text-base font-bold text-slate-900">Urgent Tickets Requiring Triage</h2>
              <p class="text-xs text-slate-500">Unassigned or high priority campus requests</p>
            </div>
          </div>
          <a routerLink="/requests" class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>Open All in Management Table</span>
            <i class="pi pi-arrow-right text-[10px]"></i>
          </a>
        </div>

        <div class="p-6" *ngIf="loading()">
          <div class="flex justify-center items-center py-8 text-slate-400">
            <i class="pi pi-spin pi-spinner text-2xl mr-2"></i>
            <span>Loading live data from Supabase...</span>
          </div>
        </div>

        <div *ngIf="!loading() && urgentRequests().length === 0" class="p-8 text-center text-slate-400">
          <i class="pi pi-check-circle text-3xl text-emerald-500 mb-2"></i>
          <p class="text-sm font-medium">All high priority requests have been handled!</p>
        </div>

        <div *ngIf="!loading() && urgentRequests().length > 0" class="divide-y divide-slate-100">
          <div *ngFor="let req of urgentRequests()" class="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition">
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-mono font-bold text-blue-600">
                  {{ req.request_code || '#' + req.id }}
                </span>
                <span class="font-semibold text-slate-900 text-sm">{{ req.title }}</span>
                <span
                  [ngClass]="{
                    'bg-rose-100 text-rose-700 border-rose-200': req.priority === 'Urgent' || req.priority === 'Critical',
                    'bg-amber-100 text-amber-700 border-amber-200': req.priority === 'High',
                    'bg-blue-100 text-blue-700 border-blue-200': req.priority === 'Medium',
                    'bg-slate-100 text-slate-700 border-slate-200': req.priority === 'Low'
                  }"
                  class="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                >
                  {{ req.priority }}
                </span>
                <span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {{ req.category_name || 'General' }}
                </span>
              </div>
              <p class="text-xs text-slate-600 line-clamp-1">{{ req.description }}</p>
              <div class="text-[11px] text-slate-400 flex items-center space-x-2">
                <span>Requester: <strong class="text-slate-600">{{ req.requester_name }}</strong></span>
                <span>•</span>
                <span>Location: <strong class="text-slate-600">{{ req.location }}</strong></span>
                <span>•</span>
                <span>Status: <strong class="text-slate-700">{{ req.status }}</strong></span>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <a
                [routerLink]="['/requests']"
                [queryParams]="{ search: req.request_code || req.id }"
                class="px-3.5 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition"
              >
                Triage & Assign
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

  resolutionRate = computed(() => {
    const s = this.summary();
    if (!s || s.total_requests === 0) return 0;
    const completed = (s.resolved_count || 0) + (s.closed_count || 0);
    return Math.round((completed / s.total_requests) * 100);
  });

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);

    this.adminService.getDashboardSummary().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.summary.set(res.data);
        }
        this.loadUrgentRequests();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getStatusPercentage(status: string): number {
    const s = this.summary();
    if (!s || s.total_requests === 0) return 0;

    let count = 0;
    switch (status) {
      case 'Pending':
        count = s.pending_count;
        break;
      case 'Assigned':
        count = s.assigned_count;
        break;
      case 'In Progress':
        count = s.in_progress_count;
        break;
      case 'Resolved':
        count = s.resolved_count;
        break;
      case 'Closed':
        count = s.closed_count;
        break;
    }

    return (count / s.total_requests) * 100;
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
