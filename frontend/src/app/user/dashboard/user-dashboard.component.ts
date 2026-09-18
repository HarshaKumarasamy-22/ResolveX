import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RequestService } from '../../core/services/request.service';
import { ServiceRequest, UserSummary } from '../../core/models/request.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Welcome Hero Banner -->
      <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-blue-800/40 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1.5">
            <div class="flex items-center space-x-2">
              <span class="text-xs bg-blue-500/30 text-blue-200 font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                Aurevia Institute of Technology
              </span>
              <span class="text-xs text-slate-300 capitalize font-mono">
                {{ currentUser()?.role }} Portal
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {{ currentUser()?.full_name || 'AIT Member' }}
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {{ currentUser()?.department || 'Faculty of Computing & Software Engineering' }} • Colombo Campus
            </p>
          </div>

          <!-- Quick Action Button -->
          <a
            routerLink="/create-request"
            class="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
          >
            <i class="pi pi-plus-circle text-base"></i>
            <span>Raise New Request</span>
          </a>
        </div>
      </div>

      <!-- User KPI Metric Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Submitted -->
        <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div class="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg font-bold">
            <i class="pi pi-inbox"></i>
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-500">Total Submitted</div>
            <div class="text-xl font-extrabold text-slate-900 mt-0.5">
              {{ summary()?.total_submitted || 0 }}
            </div>
          </div>
        </div>

        <!-- Pending Triage -->
        <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div class="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-lg font-bold">
            <i class="pi pi-clock"></i>
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-500">Pending Review</div>
            <div class="text-xl font-extrabold text-amber-600 mt-0.5">
              {{ summary()?.pending_count || 0 }}
            </div>
          </div>
        </div>

        <!-- In Progress -->
        <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div class="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg font-bold">
            <i class="pi pi-spin pi-spinner"></i>
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-500">In Progress</div>
            <div class="text-xl font-extrabold text-indigo-600 mt-0.5">
              {{ (summary()?.in_progress_count || 0) + (summary()?.assigned_count || 0) }}
            </div>
          </div>
        </div>

        <!-- Resolved -->
        <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div class="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg font-bold">
            <i class="pi pi-check-circle"></i>
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-500">Resolved / Closed</div>
            <div class="text-xl font-extrabold text-emerald-600 mt-0.5">
              {{ (summary()?.resolved_count || 0) + (summary()?.closed_count || 0) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Two Column Grid: Recent Requests & AIT Helpdesk Contacts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Requests Section (2 cols) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <h2 class="text-base font-bold text-slate-900">Your Recent Service Requests</h2>
              <span class="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                {{ recentRequests().length }} Requests
              </span>
            </div>
            <a
              routerLink="/my-requests"
              class="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <i class="pi pi-arrow-right text-[10px]"></i>
            </a>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading()" class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            <i class="pi pi-spin pi-spinner text-2xl text-blue-600 mb-2"></i>
            <p class="text-xs">Loading your service requests...</p>
          </div>

          <!-- Empty State -->
          <div
            *ngIf="!loading() && recentRequests().length === 0"
            class="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 space-y-3"
          >
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl">
              <i class="pi pi-file-edit"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-sm">No Service Requests Found</h3>
              <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You haven't raised any university issue or service requests yet.
              </p>
            </div>
            <a
              routerLink="/create-request"
              class="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow transition"
            >
              <i class="pi pi-plus"></i>
              <span>Create Your First Request</span>
            </a>
          </div>

          <!-- Requests List Cards -->
          <div *ngIf="!loading() && recentRequests().length > 0" class="space-y-3">
            <div
              *ngFor="let req of recentRequests()"
              class="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div class="space-y-1 flex-1">
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-mono font-bold text-blue-600">
                    {{ req.request_code || '#' + req.id }}
                  </span>
                  <span
                    [ngClass]="{
                      'bg-rose-100 text-rose-700': req.priority === 'Urgent' || req.priority === 'Critical',
                      'bg-amber-100 text-amber-700': req.priority === 'High',
                      'bg-blue-100 text-blue-700': req.priority === 'Medium',
                      'bg-slate-100 text-slate-700': req.priority === 'Low'
                    }"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    {{ req.priority }}
                  </span>
                  <span class="text-[11px] text-slate-400">•</span>
                  <span class="text-[11px] text-slate-500 font-medium">
                    {{ req.category_name || 'IT & Software' }}
                  </span>
                </div>

                <h3 class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                  {{ req.title }}
                </h3>

                <div class="text-[11px] text-slate-500 flex items-center space-x-2">
                  <span class="flex items-center gap-1">
                    <i class="pi pi-map-marker text-[10px] text-slate-400"></i>
                    <span>{{ req.location }}</span>
                    <span *ngIf="req.room_number">({{ req.room_number }})</span>
                  </span>
                  <span>•</span>
                  <span>{{ req.created_at | date: 'MMM d, y, h:mm a' }}</span>
                </div>
              </div>

              <!-- Status Badge & View Button -->
              <div class="flex items-center space-x-2.5 self-end sm:self-center">
                <span
                  [ngClass]="{
                    'bg-amber-100 text-amber-800 border-amber-200': req.status === 'Pending',
                    'bg-sky-100 text-sky-800 border-sky-200': req.status === 'Assigned',
                    'bg-indigo-100 text-indigo-800 border-indigo-200': req.status === 'In Progress',
                    'bg-emerald-100 text-emerald-800 border-emerald-200': req.status === 'Resolved',
                    'bg-slate-100 text-slate-600 border-slate-200': req.status === 'Closed'
                  }"
                  class="px-2.5 py-1 rounded-md text-[11px] font-semibold border inline-flex items-center gap-1"
                >
                  <i
                    class="pi text-[9px]"
                    [ngClass]="{
                      'pi-clock': req.status === 'Pending',
                      'pi-user': req.status === 'Assigned',
                      'pi-cog pi-spin': req.status === 'In Progress',
                      'pi-check': req.status === 'Resolved',
                      'pi-lock': req.status === 'Closed'
                    }"
                  ></i>
                  <span>{{ req.status }}</span>
                </span>

                <a
                  [routerLink]="['/requests', req.id]"
                  class="p-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg border border-slate-200 transition"
                  title="Track Request Status"
                >
                  <i class="pi pi-chevron-right text-xs"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: AIT Service Desk Info & Common Contacts -->
        <div class="space-y-4">
          <h2 class="text-base font-bold text-slate-900">AIT Service Support</h2>

          <!-- Service Hub Card -->
          <div class="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-sm">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                <i class="pi pi-building"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900">AIT Central Helpdesk</div>
                <div class="text-[10px] text-slate-500">Student Centre, Level 1</div>
              </div>
            </div>

            <div class="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
              Service requests raised through ResolveX are automatically routed to our specialized support teams across campus.
            </div>

            <!-- Support Teams Overview -->
            <div class="space-y-2 border-t border-slate-100 pt-2.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-600 font-medium flex items-center gap-1.5">
                  <i class="pi pi-desktop text-blue-500 text-xs"></i>
                  <span>IT & LMS Support</span>
                </span>
                <span class="font-mono text-[11px] text-slate-500">Ext. 101</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-600 font-medium flex items-center gap-1.5">
                  <i class="pi pi-wifi text-indigo-500 text-xs"></i>
                  <span>Network & Wi-Fi Desk</span>
                </span>
                <span class="font-mono text-[11px] text-slate-500">Ext. 102</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-600 font-medium flex items-center gap-1.5">
                  <i class="pi pi-wrench text-amber-500 text-xs"></i>
                  <span>Facilities & Maintenance</span>
                </span>
                <span class="font-mono text-[11px] text-slate-500">Ext. 105</span>
              </div>
            </div>
          </div>

          <!-- Quick Tip Box -->
          <div class="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-950 space-y-1.5">
            <div class="font-bold flex items-center gap-1 text-indigo-900">
              <i class="pi pi-info-circle text-sm text-indigo-600"></i>
              <span>AIT Campus Guidelines</span>
            </div>
            <p class="text-[11px] text-indigo-800/90 leading-relaxed">
              For urgent classroom equipment or laboratory issues during active lectures, mark priority as <strong>Urgent</strong> for immediate technician dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UserDashboardComponent implements OnInit {
  authService = inject(AuthService);
  requestService = inject(RequestService);

  currentUser = this.authService.currentUser;
  summary = signal<UserSummary | null>(null);
  recentRequests = signal<ServiceRequest[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    this.requestService.getUserSummary().subscribe({
      next: (res) => this.summary.set(res.data),
      error: () => {},
    });

    this.requestService.getMyRequests({ page: 1, limit: 5, sortBy: 'created_at', sortOrder: 'desc' }).subscribe({
      next: (res) => {
        this.recentRequests.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
