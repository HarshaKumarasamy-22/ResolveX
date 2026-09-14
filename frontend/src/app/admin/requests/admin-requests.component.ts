import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// PrimeNG Imports
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AdminService } from '../../core/services/admin.service';
import {
  ServiceRequest,
  Category,
  RequestStatus,
  RequestPriority,
} from '../../core/models/request.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>

    <div class="space-y-6">
      <!-- Top Title & Controls Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">All Service Requests</h1>
            <span class="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full">
              {{ totalRecords() }} Tickets
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Triage, assign, and manage lifecycle transitions for all organizational requests.</p>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Feature 2: Export CSV Button -->
          <button
            (click)="exportToCSV()"
            [disabled]="loading() || requests().length === 0"
            class="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
            title="Download current filtered requests as CSV"
          >
            <i class="pi pi-download text-emerald-600"></i>
            <span>Export CSV</span>
          </button>

          <button
            (click)="resetFilters()"
            class="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <i class="pi pi-filter-slash"></i>
            <span>Clear</span>
          </button>

          <button
            (click)="loadRequests()"
            class="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow transition flex items-center gap-1.5"
          >
            <i class="pi pi-refresh" [class.pi-spin]="loading()"></i>
            <span>Reload</span>
          </button>
        </div>
      </div>

      <!-- Filter Toolbar (FR-2.2) -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Search Input -->
        <div class="lg:col-span-2">
          <label class="block text-xs font-semibold text-slate-600 mb-1">Search Keywords</label>
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Search title, description or requester..."
              class="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Status</label>
          <select
            [(ngModel)]="selectedStatus"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
          <select
            [(ngModel)]="selectedPriority"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option *ngFor="let p of priorityOptions" [value]="p">{{ p }}</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Category</label>
          <select
            [(ngModel)]="selectedCategoryId"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:outline-none"
          >
            <option [ngValue]="null">All Categories</option>
            <option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <!-- PrimeNG Table (FR-2.1) -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <p-table
          [value]="requests()"
          [lazy]="true"
          (onLazyLoad)="onLazyLoad($event)"
          [paginator]="true"
          [rows]="pageSize"
          [totalRecords]="totalRecords()"
          [loading]="loading()"
          [rowsPerPageOptions]="[5, 10, 20, 50]"
          [tableStyle]="{ 'min-width': '65rem' }"
          styleClass="p-datatable-sm p-datatable-striped"
        >
          <!-- Table Header -->
          <ng-template pTemplate="header">
            <tr class="bg-slate-100/80 text-slate-700 text-xs font-semibold uppercase tracking-wider">
              <th pSortableColumn="id" class="w-16 py-3 px-4">
                ID <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th pSortableColumn="title" class="py-3 px-4">
                Issue Details <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th class="py-3 px-4">Category</th>
              <th pSortableColumn="priority" class="w-28 py-3 px-4">
                Priority <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th pSortableColumn="status" class="w-32 py-3 px-4">
                Status <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th class="py-3 px-4">Assignee</th>
              <th pSortableColumn="created_at" class="w-36 py-3 px-4">
                Created <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th class="w-36 py-3 px-4 text-center">Actions</th>
            </tr>
          </ng-template>

          <!-- Table Body -->
          <ng-template pTemplate="body" let-req>
            <tr class="hover:bg-slate-50/80 transition text-xs text-slate-800">
              <!-- ID -->
              <td class="py-3 px-4 font-mono font-bold text-slate-500">#{{ req.id }}</td>

              <!-- Issue Title & Description (Clickable to open Quick-View Drawer) -->
              <td class="py-3 px-4 max-w-xs">
                <div
                  (click)="openQuickViewDialog(req)"
                  class="font-bold text-slate-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition flex items-center gap-1.5"
                  title="Click to view full ticket details"
                >
                  <span>{{ req.title }}</span>
                  <i class="pi pi-external-link text-[10px] text-slate-400"></i>
                </div>
                <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{{ req.description }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">By: {{ req.requester_name }}</div>
              </td>

              <!-- Category -->
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  {{ req.category_name || 'General' }}
                </span>
              </td>

              <!-- Priority -->
              <td class="py-3 px-4">
                <button
                  (click)="openPriorityDialog(req)"
                  title="Click to change priority"
                  class="cursor-pointer font-medium"
                >
                  <span
                    [ngClass]="{
                      'bg-rose-100 text-rose-700 border-rose-200': req.priority === 'Critical',
                      'bg-amber-100 text-amber-700 border-amber-200': req.priority === 'High',
                      'bg-blue-100 text-blue-700 border-blue-200': req.priority === 'Medium',
                      'bg-slate-100 text-slate-600 border-slate-200': req.priority === 'Low'
                    }"
                    class="px-2 py-0.5 rounded-full border text-[11px] inline-flex items-center gap-1 font-semibold hover:opacity-80"
                  >
                    <span>{{ req.priority }}</span>
                    <i class="pi pi-chevron-down text-[8px]"></i>
                  </span>
                </button>
              </td>

              <!-- Status with Badge -->
              <td class="py-3 px-4">
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
                  {{ req.status }}
                </span>
              </td>

              <!-- Assignee Info -->
              <td class="py-3 px-4">
                <div *ngIf="req.assigned_to_name" class="flex items-center space-x-1.5">
                  <div class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[9px]">
                    {{ req.assigned_to_name.charAt(0) }}
                  </div>
                  <span class="font-medium text-slate-700">{{ req.assigned_to_name }}</span>
                </div>
                <div *ngIf="!req.assigned_to_name" class="text-slate-400 italic">
                  Unassigned
                </div>
              </td>

              <!-- Created Date -->
              <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">
                {{ req.created_at | date : 'MMM d, y, h:mm a' }}
              </td>

              <!-- Action Controls -->
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center space-x-1">
                  <!-- Feature 3: Quick View Detail Button -->
                  <button
                    (click)="openQuickViewDialog(req)"
                    title="Quick View Details"
                    class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition"
                  >
                    <i class="pi pi-eye text-sm"></i>
                  </button>

                  <!-- Assign Button -->
                  <button
                    (click)="openAssignDialog(req)"
                    title="Assign to Staff"
                    class="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition"
                  >
                    <i class="pi pi-user-plus text-sm"></i>
                  </button>

                  <!-- Status Workflow Button -->
                  <button
                    (click)="openStatusDialog(req)"
                    title="Update Status Workflow"
                    class="p-1.5 rounded-md hover:bg-amber-50 text-amber-600 transition"
                  >
                    <i class="pi pi-sliders-h text-sm"></i>
                  </button>

                  <!-- Quick Reopen if Resolved / Closed -->
                  <button
                    *ngIf="req.status === 'Resolved' || req.status === 'Closed'"
                    (click)="reopenRequest(req)"
                    title="Reopen Request"
                    class="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition"
                  >
                    <i class="pi pi-replay text-sm"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <!-- Empty State -->
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center py-10 text-slate-400">
                <i class="pi pi-inbox text-3xl mb-2"></i>
                <p class="font-medium">No service requests found matching your filters.</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- FEATURE 3: REQUEST QUICK-VIEW DETAILS MODAL -->
    <p-dialog
      [(visible)]="quickViewVisible"
      [modal]="true"
      [style]="{ width: '620px' }"
      header="Request Overview & Details"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="activeRequest" class="space-y-4 pt-2 text-slate-800 text-xs">
        <!-- Title & Badges Header -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="font-mono text-xs font-bold text-blue-600">Ticket #{{ activeRequest.id }}</span>
            <div class="flex items-center space-x-1.5">
              <span
                [ngClass]="{
                  'bg-amber-100 text-amber-800 border-amber-200': activeRequest.status === 'Pending',
                  'bg-sky-100 text-sky-800 border-sky-200': activeRequest.status === 'Assigned',
                  'bg-indigo-100 text-indigo-800 border-indigo-200': activeRequest.status === 'In Progress',
                  'bg-emerald-100 text-emerald-800 border-emerald-200': activeRequest.status === 'Resolved',
                  'bg-slate-100 text-slate-600 border-slate-200': activeRequest.status === 'Closed'
                }"
                class="px-2 py-0.5 rounded-full text-[11px] font-semibold border"
              >
                {{ activeRequest.status }}
              </span>
              <span
                [ngClass]="{
                  'bg-rose-100 text-rose-700': activeRequest.priority === 'Critical',
                  'bg-amber-100 text-amber-700': activeRequest.priority === 'High',
                  'bg-blue-100 text-blue-700': activeRequest.priority === 'Medium',
                  'bg-slate-100 text-slate-700': activeRequest.priority === 'Low'
                }"
                class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
              >
                {{ activeRequest.priority }} Priority
              </span>
            </div>
          </div>
          <h2 class="text-base font-bold text-slate-900">{{ activeRequest.title }}</h2>
          <div class="text-[11px] text-slate-500 mt-1">
            Category: <span class="font-semibold text-slate-700">{{ activeRequest.category_name || 'General' }}</span>
          </div>
        </div>

        <!-- Issue Description Box -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Issue Description</label>
          <div class="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
            {{ activeRequest.description }}
          </div>
        </div>

        <!-- Requester & Assignee Grid -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Requester Card -->
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requester</div>
            <div class="font-semibold text-slate-900 text-xs">{{ activeRequest.requester_name }}</div>
            <div class="text-[11px] text-slate-500">{{ activeRequest.requester_email }}</div>
          </div>

          <!-- Assignee Card -->
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Staff</div>
            <div *ngIf="activeRequest.assigned_to_name" class="font-semibold text-slate-900 text-xs flex items-center gap-1">
              <i class="pi pi-check text-emerald-600 text-[10px]"></i>
              <span>{{ activeRequest.assigned_to_name }}</span>
            </div>
            <div *ngIf="!activeRequest.assigned_to_name" class="text-amber-600 italic font-medium">
              Not Assigned Yet
            </div>
            <div class="text-[11px] text-slate-500" *ngIf="activeRequest.assigned_to_email">{{ activeRequest.assigned_to_email }}</div>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
          <div>Created: {{ activeRequest.created_at | date : 'medium' }}</div>
          <div *ngIf="activeRequest.resolved_at" class="text-emerald-700 font-semibold">
            Resolved: {{ activeRequest.resolved_at | date : 'medium' }}
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-between items-center w-full pt-2">
          <div class="flex space-x-2">
            <button
              (click)="openAssignDialog(activeRequest!); quickViewVisible = false"
              class="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition"
            >
              <i class="pi pi-user-plus mr-1"></i> Assign
            </button>
            <button
              (click)="openStatusDialog(activeRequest!); quickViewVisible = false"
              class="px-3 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg transition"
            >
              <i class="pi pi-sliders-h mr-1"></i> Change Status
            </button>
          </div>
          <button
            (click)="quickViewVisible = false"
            class="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- 1. ASSIGNMENT DIALOG (FR-2.3) -->
    <p-dialog
      [(visible)]="assignDialogVisible"
      [modal]="true"
      [style]="{ width: '450px' }"
      header="Assign Service Request"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="activeRequest" class="space-y-4 pt-2">
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div class="text-xs text-slate-500 font-mono">Ticket #{{ activeRequest.id }}</div>
          <div class="text-sm font-bold text-slate-900 mt-0.5">{{ activeRequest.title }}</div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">Select Staff Member / Admin</label>
          <select
            [(ngModel)]="selectedAssigneeId"
            class="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option [ngValue]="null" disabled>Choose a staff member...</option>
            <option *ngFor="let u of staffUsers()" [ngValue]="u.id">
              {{ u.full_name }} ({{ u.email }})
            </option>
          </select>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2 pt-2">
          <button
            (click)="assignDialogVisible = false"
            class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            (click)="submitAssignment()"
            [disabled]="!selectedAssigneeId || submittingAction()"
            class="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow disabled:opacity-50"
          >
            <i class="pi pi-check mr-1" *ngIf="!submittingAction()"></i>
            <span>{{ submittingAction() ? 'Assigning...' : 'Confirm Assignment' }}</span>
          </button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- 2. STATUS WORKFLOW TRANSITION DIALOG (FR-2.4) -->
    <p-dialog
      [(visible)]="statusDialogVisible"
      [modal]="true"
      [style]="{ width: '480px' }"
      header="Update Request Status"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="activeRequest" class="space-y-4 pt-2">
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div class="flex justify-between items-center">
            <span class="text-xs text-slate-500 font-mono">Ticket #{{ activeRequest.id }}</span>
            <span class="text-xs font-bold text-blue-600">Current: {{ activeRequest.status }}</span>
          </div>
          <div class="text-sm font-semibold text-slate-900 mt-1">{{ activeRequest.title }}</div>
        </div>

        <!-- Valid State Transitions Radio / Buttons -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-2">Select Next Allowed Status:</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              *ngFor="let nextStatus of getAllowedTransitions(activeRequest.status)"
              (click)="selectedNewStatus = nextStatus"
              [ngClass]="{
                'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 font-bold': selectedNewStatus === nextStatus,
                'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium': selectedNewStatus !== nextStatus
              }"
              class="p-2.5 border rounded-lg text-xs text-left transition flex items-center justify-between"
            >
              <span>{{ nextStatus }}</span>
              <i class="pi pi-arrow-right text-[10px]" *ngIf="selectedNewStatus === nextStatus"></i>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Optional Transition Note</label>
          <textarea
            [(ngModel)]="statusTransitionNote"
            rows="2"
            placeholder="Reason or notes regarding this status change..."
            class="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2 pt-2">
          <button
            (click)="statusDialogVisible = false"
            class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            (click)="submitStatusUpdate()"
            [disabled]="!selectedNewStatus || submittingAction()"
            class="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow disabled:opacity-50"
          >
            <span>{{ submittingAction() ? 'Updating...' : 'Update Status' }}</span>
          </button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- 3. PRIORITY DIALOG (FR-2.5) -->
    <p-dialog
      [(visible)]="priorityDialogVisible"
      [modal]="true"
      [style]="{ width: '400px' }"
      header="Update Ticket Priority"
      [draggable]="false"
    >
      <div *ngIf="activeRequest" class="space-y-4 pt-2">
        <p class="text-xs text-slate-600">Select priority level for ticket #{{ activeRequest.id }}:</p>
        <div class="space-y-2">
          <div
            *ngFor="let p of priorityOptions"
            (click)="selectedNewPriority = p"
            [ngClass]="{
              'border-blue-600 bg-blue-50 font-bold': selectedNewPriority === p,
              'border-slate-200 hover:bg-slate-50 font-medium': selectedNewPriority !== p
            }"
            class="p-2.5 border rounded-lg text-xs cursor-pointer flex items-center justify-between transition"
          >
            <span>{{ p }}</span>
            <i class="pi pi-check text-blue-600 text-xs" *ngIf="selectedNewPriority === p"></i>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2 pt-2">
          <button (click)="priorityDialogVisible = false" class="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
          <button
            (click)="submitPriorityUpdate()"
            [disabled]="!selectedNewPriority || submittingAction()"
            class="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow"
          >
            Save Priority
          </button>
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class AdminRequestsComponent implements OnInit {
  adminService = inject(AdminService);
  messageService = inject(MessageService);
  route = inject(ActivatedRoute);

  requests = signal<ServiceRequest[]>([]);
  categories = signal<Category[]>([]);
  staffUsers = signal<User[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);
  submittingAction = signal<boolean>(false);

  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedPriority = '';
  selectedCategoryId: number | null = null;
  pageSize = 10;
  currentPage = 1;
  sortBy = 'created_at';
  sortOrder = 'desc';

  // Constants
  statusOptions: RequestStatus[] = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  priorityOptions: RequestPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  // Allowed State Machine Map (FR-2.4)
  allowedTransitionsMap: Record<string, RequestStatus[]> = {
    Pending: ['Assigned', 'In Progress', 'Closed'],
    Assigned: ['In Progress', 'Pending', 'Closed'],
    'In Progress': ['Resolved', 'Assigned', 'Pending', 'Closed'],
    Resolved: ['Closed', 'In Progress'],
    Closed: ['In Progress'],
  };

  // Dialog States
  activeRequest: ServiceRequest | null = null;
  quickViewVisible = false;

  assignDialogVisible = false;
  selectedAssigneeId: number | null = null;

  statusDialogVisible = false;
  selectedNewStatus: RequestStatus | null = null;
  statusTransitionNote = '';

  priorityDialogVisible = false;
  selectedNewPriority: RequestPriority | null = null;

  ngOnInit(): void {
    this.loadCategories();
    this.loadStaffUsers();

    // Check query params (e.g. from dashboard click)
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      this.loadRequests();
    });
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (res) => this.categories.set(res.data || []),
      error: () => {},
    });
  }

  loadStaffUsers(): void {
    this.adminService.getUsers({ role: 'admin', is_active: true }).subscribe({
      next: (res) => this.staffUsers.set(res.data || []),
      error: () => {},
    });
  }

  loadRequests(): void {
    this.loading.set(true);

    this.adminService
      .getAllRequests({
        page: this.currentPage,
        limit: this.pageSize,
        status: this.selectedStatus || undefined,
        priority: this.selectedPriority || undefined,
        category_id: this.selectedCategoryId || undefined,
        search: this.searchQuery || undefined,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
      })
      .subscribe({
        next: (res) => {
          this.requests.set(res.data || []);
          this.totalRecords.set(res.pagination?.total || 0);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    if (event.first !== undefined && event.rows !== undefined && event.rows !== null) {
      this.currentPage = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }
    if (event.sortField) {
      this.sortBy = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;
      this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    }
    this.loadRequests();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.selectedCategoryId = null;
    this.currentPage = 1;
    this.loadRequests();
  }

  // Feature 3: Quick View Dialog
  openQuickViewDialog(req: ServiceRequest): void {
    this.activeRequest = req;
    this.quickViewVisible = true;
  }

  // Feature 2: Export CSV Implementation
  exportToCSV(): void {
    const list = this.requests();
    if (list.length === 0) return;

    const headers = [
      'Ticket ID',
      'Title',
      'Description',
      'Category',
      'Status',
      'Priority',
      'Requester Name',
      'Requester Email',
      'Assigned Staff',
      'Created At',
      'Resolved At',
    ];

    const rows = list.map((r) => [
      `#${r.id}`,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      `"${r.category_name || 'General'}"`,
      r.status,
      r.priority,
      `"${r.requester_name || ''}"`,
      r.requester_email || '',
      `"${r.assigned_to_name || 'Unassigned'}"`,
      r.created_at,
      r.resolved_at || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ResolveX_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.messageService.add({
      severity: 'success',
      summary: 'Export Successful',
      detail: `Exported ${list.length} service requests to CSV.`,
    });
  }

  // 1. Assignment Workflow
  openAssignDialog(req: ServiceRequest): void {
    this.activeRequest = req;
    this.selectedAssigneeId = req.assigned_to || null;
    this.assignDialogVisible = true;
  }

  submitAssignment(): void {
    if (!this.activeRequest || !this.selectedAssigneeId) return;

    this.submittingAction.set(true);
    this.adminService.assignRequest(this.activeRequest.id, this.selectedAssigneeId).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Assigned Successfully',
          detail: res.message,
        });
        this.assignDialogVisible = false;
        this.submittingAction.set(false);
        this.loadRequests();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Assignment Failed',
          detail: err.error?.message || 'Could not assign ticket',
        });
        this.submittingAction.set(false);
      },
    });
  }

  // 2. Status Transition Workflow
  getAllowedTransitions(currentStatus: string): RequestStatus[] {
    return this.allowedTransitionsMap[currentStatus] || [];
  }

  openStatusDialog(req: ServiceRequest): void {
    this.activeRequest = req;
    this.selectedNewStatus = null;
    this.statusTransitionNote = '';
    this.statusDialogVisible = true;
  }

  submitStatusUpdate(): void {
    if (!this.activeRequest || !this.selectedNewStatus) return;

    this.submittingAction.set(true);
    this.adminService
      .updateRequestStatus(this.activeRequest.id, this.selectedNewStatus, this.statusTransitionNote)
      .subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Status Updated',
            detail: res.message,
          });
          this.statusDialogVisible = false;
          this.submittingAction.set(false);
          this.loadRequests();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid Transition',
            detail: err.error?.message || 'State transition rejected',
          });
          this.submittingAction.set(false);
        },
      });
  }

  reopenRequest(req: ServiceRequest): void {
    this.adminService.updateRequestStatus(req.id, 'In Progress', 'Ticket reopened by Administrator').subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'info',
          summary: 'Ticket Reopened',
          detail: `Request #${req.id} is now In Progress.`,
        });
        this.loadRequests();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Reopen Failed',
          detail: err.error?.message,
        });
      },
    });
  }

  // 3. Priority Workflow
  openPriorityDialog(req: ServiceRequest): void {
    this.activeRequest = req;
    this.selectedNewPriority = req.priority;
    this.priorityDialogVisible = true;
  }

  submitPriorityUpdate(): void {
    if (!this.activeRequest || !this.selectedNewPriority) return;

    this.submittingAction.set(true);
    this.adminService.updateRequestPriority(this.activeRequest.id, this.selectedNewPriority).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Priority Updated',
          detail: res.message,
        });
        this.priorityDialogVisible = false;
        this.submittingAction.set(false);
        this.loadRequests();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Priority Update Failed',
          detail: err.error?.message,
        });
        this.submittingAction.set(false);
      },
    });
  }
}
