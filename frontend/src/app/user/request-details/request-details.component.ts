import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { RequestService } from '../../core/services/request.service';
import { ServiceRequest, RequestStatus } from '../../core/models/request.model';

import { CommentsComponent } from '../../shared/components/comments/comments.component';
import { ActivityTimelineComponent } from '../../shared/components/activity-timeline/activity-timeline.component';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ToastModule, CommentsComponent, ActivityTimelineComponent],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>

    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Breadcrumbs & Action Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <a routerLink="/dashboard" class="hover:text-blue-600 transition">Dashboard</a>
            <span>/</span>
            <a routerLink="/my-requests" class="hover:text-blue-600 transition">My Requests</a>
            <span>/</span>
            <span class="text-slate-800 font-semibold font-mono">{{ request()?.request_code || '#' + requestId }}</span>
          </div>
          <div class="flex items-center space-x-3">
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">
              {{ request()?.title || 'Service Request Details' }}
            </h1>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <a
            routerLink="/my-requests"
            class="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <i class="pi pi-arrow-left"></i>
            <span>Back to List</span>
          </a>

          <button
            (click)="loadDetails()"
            class="p-2 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg shadow-sm transition"
            title="Refresh Request Status"
          >
            <i class="pi pi-refresh" [class.pi-spin]="loading()"></i>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <i class="pi pi-spin pi-spinner text-3xl text-blue-600 mb-3"></i>
        <p class="text-xs font-medium">Fetching request tracking details...</p>
      </div>

      <div *ngIf="!loading() && request()" class="space-y-6">
        <!-- 1. Visual 5-Stage Status Progress Stepper -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Request Lifecycle & Resolution Progress
          </h2>

          <div class="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <!-- Progress Track Line (desktop) -->
            <div class="hidden sm:block absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-slate-100 z-0"></div>
            <div
              class="hidden sm:block absolute top-1/2 left-8 h-1 -translate-y-1/2 bg-blue-600 transition-all duration-500 z-0"
              [style.width.%]="getStageProgressPercent(request()!.status)"
            ></div>

            <!-- Stage 1: Pending -->
            <div class="relative z-10 flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto">
              <div
                [ngClass]="{
                  'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-100': isStageActiveOrPassed('Pending'),
                  'bg-slate-100 text-slate-400 border border-slate-300': !isStageActiveOrPassed('Pending')
                }"
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition"
              >
                <i class="pi pi-file-edit"></i>
              </div>
              <div class="text-left sm:text-center">
                <div class="text-xs font-bold text-slate-800">1. Pending</div>
                <div class="text-[10px] text-slate-400">Request Raised</div>
              </div>
            </div>

            <!-- Stage 2: Assigned -->
            <div class="relative z-10 flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto">
              <div
                [ngClass]="{
                  'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-100': isStageActiveOrPassed('Assigned'),
                  'bg-slate-100 text-slate-400 border border-slate-300': !isStageActiveOrPassed('Assigned')
                }"
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition"
              >
                <i class="pi pi-user-plus"></i>
              </div>
              <div class="text-left sm:text-center">
                <div class="text-xs font-bold text-slate-800">2. Assigned</div>
                <div class="text-[10px] text-slate-400">Staff Assigned</div>
              </div>
            </div>

            <!-- Stage 3: In Progress -->
            <div class="relative z-10 flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto">
              <div
                [ngClass]="{
                  'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-4 ring-indigo-100': isStageActiveOrPassed('In Progress'),
                  'bg-slate-100 text-slate-400 border border-slate-300': !isStageActiveOrPassed('In Progress')
                }"
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition"
              >
                <i class="pi pi-cog" [class.pi-spin]="request()!.status === 'In Progress'"></i>
              </div>
              <div class="text-left sm:text-center">
                <div class="text-xs font-bold text-slate-800">3. In Progress</div>
                <div class="text-[10px] text-slate-400">Under Investigation</div>
              </div>
            </div>

            <!-- Stage 4: Resolved -->
            <div class="relative z-10 flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto">
              <div
                [ngClass]="{
                  'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-100': isStageActiveOrPassed('Resolved'),
                  'bg-slate-100 text-slate-400 border border-slate-300': !isStageActiveOrPassed('Resolved')
                }"
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition"
              >
                <i class="pi pi-check"></i>
              </div>
              <div class="text-left sm:text-center">
                <div class="text-xs font-bold text-slate-800">4. Resolved</div>
                <div class="text-[10px] text-slate-400">Solution Applied</div>
              </div>
            </div>

            <!-- Stage 5: Closed -->
            <div class="relative z-10 flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto">
              <div
                [ngClass]="{
                  'bg-slate-800 text-white shadow-md ring-4 ring-slate-200': request()!.status === 'Closed',
                  'bg-slate-100 text-slate-400 border border-slate-300': request()!.status !== 'Closed'
                }"
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition"
              >
                <i class="pi pi-lock"></i>
              </div>
              <div class="text-left sm:text-center">
                <div class="text-xs font-bold text-slate-800">5. Closed</div>
                <div class="text-[10px] text-slate-400">Verified & Completed</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Main Details Two-Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Details & Description (2 cols) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Issue Overview Card -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    {{ request()!.request_code || '#' + request()!.id }}
                  </span>
                  <span class="text-xs font-semibold text-slate-600">
                    Category: {{ request()!.category_name }}
                  </span>
                </div>

                <div class="flex items-center space-x-2">
                  <span
                    [ngClass]="{
                      'bg-rose-100 text-rose-700': request()!.priority === 'Urgent' || request()!.priority === 'Critical',
                      'bg-amber-100 text-amber-700': request()!.priority === 'High',
                      'bg-blue-100 text-blue-700': request()!.priority === 'Medium',
                      'bg-slate-100 text-slate-700': request()!.priority === 'Low'
                    }"
                    class="text-xs font-bold px-2.5 py-1 rounded-full"
                  >
                    {{ request()!.priority }} Priority
                  </span>
                </div>
              </div>

              <div>
                <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Problem Description
                </h2>
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {{ request()!.description }}
                </div>
              </div>

              <!-- Campus Location Details -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AIT Faculty / Division</div>
                  <div class="text-xs font-bold text-slate-800">{{ request()!.department }}</div>
                </div>

                <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Location & Room</div>
                  <div class="text-xs font-bold text-slate-800">
                    {{ request()!.location }}
                    <span *ngIf="request()!.room_number" class="text-blue-600 font-normal">({{ request()!.room_number }})</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Person 3 Integration: Comments System -->
            <app-comments [requestId]="requestId"></app-comments>

            <!-- Person 3 Integration: Read-Only Activity Timeline -->
            <app-activity-timeline [requestId]="requestId"></app-activity-timeline>
          </div>

          <!-- Right Column: Requester, Assignee & Timestamps -->
          <div class="space-y-6">
            <!-- Assignment Status Card -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Support Assignment
              </h3>

              <div class="space-y-3">
                <!-- Assigned Support Team -->
                <div class="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                  <div class="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Routing Support Team</div>
                  <div class="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                    <i class="pi pi-shield text-blue-600 text-xs"></i>
                    <span>{{ request()!.assigned_team || 'General IT Support' }}</span>
                  </div>
                </div>

                <!-- Assigned Support Engineer -->
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Engineer</div>
                  <div *ngIf="request()!.assigned_to_name" class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <i class="pi pi-user-check text-emerald-600 text-xs"></i>
                    <span>{{ request()!.assigned_to_name }}</span>
                  </div>
                  <div *ngIf="!request()!.assigned_to_name" class="text-xs text-amber-600 font-semibold italic">
                    Awaiting Engineer Assignment
                  </div>
                  <div *ngIf="request()!.assigned_to_email" class="text-[11px] text-slate-400">
                    {{ request()!.assigned_to_email }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Requester Card -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Requester Details
              </h3>

              <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {{ request()!.requester_name?.charAt(0) || 'U' }}
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900">{{ request()!.requester_name }}</div>
                  <div class="text-[11px] text-slate-500">{{ request()!.requester_email }}</div>
                  <div class="text-[10px] text-blue-600 capitalize font-medium">{{ request()!.requester_role }}</div>
                </div>
              </div>
            </div>

            <!-- Timestamps Card -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2 text-xs text-slate-500 font-mono">
              <div class="flex justify-between items-center py-1 border-b border-slate-100">
                <span class="text-slate-400">Created:</span>
                <span class="font-bold text-slate-700">{{ request()!.created_at | date: 'medium' }}</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-slate-100">
                <span class="text-slate-400">Last Updated:</span>
                <span class="font-bold text-slate-700">{{ request()!.updated_at | date: 'medium' }}</span>
              </div>
              <div *ngIf="request()!.resolved_at" class="flex justify-between items-center py-1 text-emerald-700">
                <span>Resolved:</span>
                <span class="font-bold">{{ request()!.resolved_at | date: 'medium' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RequestDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  requestService = inject(RequestService);
  messageService = inject(MessageService);

  requestId = 0;
  request = signal<ServiceRequest | null>(null);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.requestId = parseInt(params['id'], 10);
      if (this.requestId) {
        this.loadDetails();
      }
    });
  }

  loadDetails(): void {
    this.loading.set(true);
    this.requestService.getRequestById(this.requestId).subscribe({
      next: (res) => {
        this.request.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to Load Request',
          detail: err.error?.message || 'Unable to retrieve service request details.',
        });
      },
    });
  }

  isStageActiveOrPassed(stage: RequestStatus): boolean {
    const order: RequestStatus[] = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
    const current = this.request()?.status || 'Pending';
    return order.indexOf(current) >= order.indexOf(stage);
  }

  getStageProgressPercent(status: RequestStatus): number {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Assigned':
        return 25;
      case 'In Progress':
        return 50;
      case 'Resolved':
        return 75;
      case 'Closed':
        return 100;
      default:
        return 0;
    }
  }
}
