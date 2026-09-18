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

import { CommentsComponent } from '../../shared/components/comments/comments.component';
import { ActivityTimelineComponent } from '../../shared/components/activity-timeline/activity-timeline.component';

import { AdminService } from '../../core/services/admin.service';
import {
  ServiceRequest,
  Category,
  RequestStatus,
  RequestPriority,
  AIT_DEPARTMENTS,
  AIT_LOCATIONS,
  AIT_SUPPORT_TEAMS,
} from '../../core/models/request.model';
import { User, UserRole } from '../../core/models/user.model';

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
    CommentsComponent,
    ActivityTimelineComponent
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>

    <div class="space-y-6">
      <!-- Top Title & Controls Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">All AIT Service Requests</h1>
            <span class="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              {{ totalRecords() }} Tickets
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Admin console: Filter requests by role (Students, Lecturers, Staff), department, location, status, priority, and assign support teams.
          </p>
        </div>

        <div class="flex items-center space-x-2">
          <!-- CSV Export Button -->
          <button
            (click)="exportToCSV()"
            [disabled]="loading() || requests().length === 0"
            class="px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
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
            <span>Clear Filters</span>
          </button>

          <button
            (click)="loadRequests()"
            class="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow transition flex items-center gap-1.5"
          >
            <i class="pi pi-refresh" [class.pi-spin]="loading()"></i>
            <span>Reload</span>
          </button>
        </div>
      </div>

      <!-- Enhanced Multi-Field Filter Toolbar (With Requester Role Filter) -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <!-- Search Input -->
        <div class="lg:col-span-2">
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Search Keyword</label>
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Search code, title, requester or room..."
              class="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
            />
          </div>
        </div>

        <!-- 1. Requester Role Filter (Student, Lecturer, Staff, etc.) -->
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Requester Role
          </label>
          <select
            [(ngModel)]="selectedRole"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50/30 text-blue-950 font-semibold focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="lecturer">Lecturers / Faculty</option>
            <option value="staff">University Staff</option>
            <option value="support_staff">Support Staff</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <!-- 2. Status Filter -->
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Status</label>
          <select
            [(ngModel)]="selectedStatus"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>
          </select>
        </div>

        <!-- 3. Priority Filter -->
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Priority</label>
          <select
            [(ngModel)]="selectedPriority"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option *ngFor="let p of priorityOptions" [value]="p">{{ p }}</option>
          </select>
        </div>

        <!-- 4. Category Filter -->
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Category</label>
          <select
            [(ngModel)]="selectedCategoryId"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:outline-none"
          >
            <option [ngValue]="null">All Categories</option>
            <option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- 5. Department Filter -->
        <div class="lg:col-span-3">
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">AIT Faculty / Division</label>
          <select
            [(ngModel)]="selectedDepartment"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:outline-none"
          >
            <option value="">All 5 Academic & Support Divisions</option>
            <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
          </select>
        </div>

        <!-- 6. Campus Location Filter -->
        <div class="lg:col-span-3">
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Campus Location</label>
          <select
            [(ngModel)]="selectedLocation"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:outline-none"
          >
            <option value="">All 11 Campus Locations & Buildings</option>
            <option *ngFor="let loc of locations" [value]="loc">{{ loc }}</option>
          </select>
        </div>
      </div>

      <!-- PrimeNG Table with Clear Requester Role Indicator -->
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
          [tableStyle]="{ 'min-width': '80rem' }"
          styleClass="p-datatable-sm p-datatable-striped"
        >
          <!-- Table Header -->
          <ng-template pTemplate="header">
            <tr class="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <th pSortableColumn="request_code" class="w-32 py-3 px-4">
                Code <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th pSortableColumn="title" class="py-3 px-4">
                Issue & Requester <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th class="w-28 py-3 px-4">Role</th>
              <th class="py-3 px-4">Category</th>
              <th class="py-3 px-4">Department & Location</th>
              <th pSortableColumn="priority" class="w-28 py-3 px-4">
                Priority <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th pSortableColumn="status" class="w-32 py-3 px-4">
                Status <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th class="py-3 px-4">Assigned Support</th>
              <th pSortableColumn="created_at" class="w-32 py-3 px-4">
                Created <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th class="w-36 py-3 px-4 text-center">Actions</th>
            </tr>
          </ng-template>

          <!-- Table Body -->
          <ng-template pTemplate="body" let-req>
            <tr class="hover:bg-slate-50/80 transition text-xs text-slate-800">
              <!-- Code -->
              <td class="py-3 px-4 font-mono font-bold text-blue-600">
                {{ req.request_code || '#' + req.id }}
              </td>

              <!-- Title & Requester -->
              <td class="py-3 px-4 max-w-xs">
                <div
                  (click)="openQuickViewDialog(req)"
                  class="font-bold text-slate-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition flex items-center gap-1.5"
                  title="Click to view details"
                >
                  <span>{{ req.title }}</span>
                  <i class="pi pi-external-link text-[10px] text-slate-400"></i>
                </div>
                <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{{ req.description }}</div>
                <div class="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <span>By:</span>
                  <strong class="text-slate-700">{{ req.requester_name }}</strong>
                  <span class="text-slate-400">({{ req.requester_email }})</span>
                </div>
              </td>

              <!-- Requester Role Badge -->
              <td class="py-3 px-4">
                <span
                  [ngClass]="{
                    'bg-blue-100 text-blue-800 border-blue-200': req.requester_role === 'student',
                    'bg-purple-100 text-purple-800 border-purple-200': req.requester_role === 'lecturer',
                    'bg-emerald-100 text-emerald-800 border-emerald-200': req.requester_role === 'staff',
                    'bg-indigo-100 text-indigo-800 border-indigo-200': req.requester_role === 'support_staff',
                    'bg-slate-100 text-slate-800 border-slate-300': req.requester_role === 'admin'
                  }"
                  class="px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <i
                    class="pi text-[8px]"
                    [ngClass]="{
                      'pi-id-card': req.requester_role === 'student',
                      'pi-book': req.requester_role === 'lecturer',
                      'pi-briefcase': req.requester_role === 'staff',
                      'pi-cog': req.requester_role === 'support_staff',
                      'pi-shield': req.requester_role === 'admin'
                    }"
                  ></i>
                  <span>{{ req.requester_role || 'user' }}</span>
                </span>
              </td>

              <!-- Category -->
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  {{ req.category_name || 'General' }}
                </span>
              </td>

              <!-- Department & Location -->
              <td class="py-3 px-4 max-w-[14rem]">
                <div class="font-semibold text-slate-800 truncate" title="{{ req.department }}">
                  {{ req.department }}
                </div>
                <div class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <i class="pi pi-map-marker text-[9px]"></i>
                  <span>{{ req.location }}</span>
                  <span *ngIf="req.room_number" class="text-blue-600 font-mono">({{ req.room_number }})</span>
                </div>
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
                      'bg-rose-100 text-rose-700 border-rose-200': req.priority === 'Urgent' || req.priority === 'Critical',
                      'bg-amber-100 text-amber-700 border-amber-200': req.priority === 'High',
                      'bg-blue-100 text-blue-700 border-blue-200': req.priority === 'Medium',
                      'bg-slate-100 text-slate-600 border-slate-200': req.priority === 'Low'
                    }"
                    class="px-2 py-0.5 rounded-full border text-[11px] inline-flex items-center gap-1 font-bold hover:opacity-80"
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

              <!-- Assigned Team & Staff -->
              <td class="py-3 px-4">
                <div *ngIf="req.assigned_team" class="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                  <i class="pi pi-shield text-[10px]"></i>
                  <span>{{ req.assigned_team }}</span>
                </div>
                <div *ngIf="req.assigned_to_name" class="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                  <i class="pi pi-user text-[9px]"></i>
                  <span>{{ req.assigned_to_name }}</span>
                </div>
                <div *ngIf="!req.assigned_team && !req.assigned_to_name" class="text-amber-600 italic text-[11px]">
                  Unassigned
                </div>
              </td>

              <!-- Created Date -->
              <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">
                {{ req.created_at | date : 'MMM d, h:mm a' }}
              </td>

              <!-- Action Controls -->
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center space-x-1">
                  <!-- Quick View Detail Button -->
                  <button
                    (click)="openQuickViewDialog(req)"
                    title="Quick View Details"
                    class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition"
                  >
                    <i class="pi pi-eye text-sm"></i>
                  </button>

                  <!-- View Comments & Activity Details -->
                  <button
                    (click)="viewDetails(req)"
                    title="View Request Details & Activity"
                    class="p-1.5 rounded-md hover:bg-purple-50 text-purple-600 transition"
                  >
                    <i class="pi pi-comments text-sm"></i>
                  </button>

                  <!-- Assign Button -->
                  <button
                    (click)="openAssignDialog(req)"
                    title="Assign to Support Team / Staff"
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
                </div>
              </td>
            </tr>
          </ng-template>

          <!-- Empty State -->
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="10" class="text-center py-10 text-slate-400">
                <i class="pi pi-inbox text-3xl mb-2 text-slate-300"></i>
                <p class="font-medium">No service requests found matching your filters.</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- 1. QUICK-VIEW DETAILS MODAL -->
    <p-dialog
      [(visible)]="quickViewVisible"
      [modal]="true"
      [style]="{ width: '650px' }"
      header="AIT Service Request Overview"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="activeRequest" class="space-y-4 pt-2 text-slate-800 text-xs">
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="font-mono text-xs font-bold text-blue-600">
              Ticket {{ activeRequest.request_code || '#' + activeRequest.id }}
            </span>
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
                  'bg-rose-100 text-rose-700': activeRequest.priority === 'Urgent' || activeRequest.priority === 'Critical',
                  'bg-amber-100 text-amber-700': activeRequest.priority === 'High',
                  'bg-blue-100 text-blue-700': activeRequest.priority === 'Medium',
                  'bg-slate-100 text-slate-700': activeRequest.priority === 'Low'
                }"
                class="px-2 py-0.5 rounded-full text-[11px] font-bold"
              >
                {{ activeRequest.priority }} Priority
              </span>
            </div>
          </div>
          <h2 class="text-sm font-bold text-slate-900">{{ activeRequest.title }}</h2>
          <div class="text-[11px] text-slate-500 mt-1">
            Category: <strong class="text-slate-700">{{ activeRequest.category_name || 'General' }}</strong>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Issue Description</label>
          <div class="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
            {{ activeRequest.description }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AIT Faculty</div>
            <div class="font-semibold text-slate-900 text-xs mt-0.5">{{ activeRequest.department }}</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Location</div>
            <div class="font-semibold text-slate-900 text-xs mt-0.5">
              {{ activeRequest.location }}
              <span *ngIf="activeRequest.room_number" class="text-blue-600 font-mono">({{ activeRequest.room_number }})</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requester (Role)</div>
            <div class="font-semibold text-slate-900 text-xs">
              {{ activeRequest.requester_name }}
              <span class="text-blue-600 font-bold uppercase text-[9px] ml-1">[{{ activeRequest.requester_role }}]</span>
            </div>
            <div class="text-[11px] text-slate-500">{{ activeRequest.requester_email }}</div>
          </div>

          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Support</div>
            <div *ngIf="activeRequest.assigned_team" class="text-blue-700 font-bold text-xs flex items-center gap-1">
              <i class="pi pi-shield text-[10px]"></i>
              <span>{{ activeRequest.assigned_team }}</span>
            </div>
            <div *ngIf="activeRequest.assigned_to_name" class="text-slate-800 font-medium text-[11px]">
              Engineer: {{ activeRequest.assigned_to_name }}
            </div>
            <div *ngIf="!activeRequest.assigned_team && !activeRequest.assigned_to_name" class="text-amber-600 italic">
              Unassigned
            </div>
          </div>
        </div>

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
              class="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition"
            >
              <i class="pi pi-user-plus mr-1"></i> Assign
            </button>
            <button
              (click)="openStatusDialog(activeRequest!); quickViewVisible = false"
              class="px-3 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg transition"
            >
              <i class="pi pi-sliders-h mr-1"></i> Status
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

    <!-- 0. DETAILS DIALOG (PERSON 3 INTEGRATION) -->
    <p-dialog
      [(visible)]="detailsDialogVisible"
      [modal]="true"
      [style]="{ width: '800px' }"
      header="Request Details & Activity"
      [draggable]="false"
    >
      <div *ngIf="activeRequest" class="space-y-4 pt-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <app-comments [requestId]="activeRequest.id"></app-comments>
          </div>
          <div>
            <app-activity-timeline [requestId]="activeRequest.id"></app-activity-timeline>
          </div>
        </div>
      </div>
    </p-dialog>

    <!-- 1. ASSIGNMENT DIALOG (FR-2.3) -->
    <p-dialog
      [(visible)]="assignDialogVisible"
      [modal]="true"
      [style]="{ width: '480px' }"
      header="Assign Support Team & Engineer"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="activeRequest" class="space-y-4 pt-2">
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div class="text-xs text-blue-600 font-mono font-bold">
            {{ activeRequest.request_code || '#' + activeRequest.id }}
          </div>
          <div class="text-sm font-bold text-slate-900 mt-0.5">{{ activeRequest.title }}</div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">1. Assign Support Team</label>
          <select
            [(ngModel)]="selectedAssignTeam"
            class="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Choose a team...</option>
            <option *ngFor="let team of supportTeams" [value]="team">{{ team }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">2. Assign Support Engineer (Optional)</label>
          <select
            [(ngModel)]="selectedAssigneeId"
            class="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option [ngValue]="null">Unassigned engineer (Team queue)</option>
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
            [disabled]="(!selectedAssignTeam && !selectedAssigneeId) || submittingAction()"
            class="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow disabled:opacity-50"
          >
            <i class="pi pi-check mr-1" *ngIf="!submittingAction()"></i>
            <span>{{ submittingAction() ? 'Assigning...' : 'Confirm Assignment' }}</span>
          </button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- 3. STATUS WORKFLOW TRANSITION DIALOG -->
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
            <span class="text-xs text-slate-500 font-mono font-bold">{{ activeRequest.request_code || '#' + activeRequest.id }}</span>
            <span class="text-xs font-bold text-blue-600">Current: {{ activeRequest.status }}</span>
          </div>
          <div class="text-sm font-bold text-slate-900 mt-1">{{ activeRequest.title }}</div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">Select Next Status:</label>
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
            class="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow disabled:opacity-50"
          >
            <span>{{ submittingAction() ? 'Updating...' : 'Update Status' }}</span>
          </button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- 4. PRIORITY DIALOG -->
    <p-dialog
      [(visible)]="priorityDialogVisible"
      [modal]="true"
      [style]="{ width: '400px' }"
      header="Update Ticket Priority"
      [draggable]="false"
    >
      <div *ngIf="activeRequest" class="space-y-4 pt-2">
        <p class="text-xs text-slate-600">Select priority urgency for ticket {{ activeRequest.request_code || '#' + activeRequest.id }}:</p>
        <div class="space-y-2">
          <div
            *ngFor="let p of priorityOptions"
            (click)="selectedNewPriority = p"
            [ngClass]="{
              'border-blue-600 bg-blue-50 font-bold text-blue-700': selectedNewPriority === p,
              'border-slate-200 hover:bg-slate-50 font-medium text-slate-700': selectedNewPriority !== p
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
            class="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow"
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

  // Constants
  departments = AIT_DEPARTMENTS;
  locations = AIT_LOCATIONS;
  supportTeams = AIT_SUPPORT_TEAMS;
  statusOptions: RequestStatus[] = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  priorityOptions: RequestPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  // Filters
  searchQuery = '';
  selectedRole = '';
  selectedStatus = '';
  selectedPriority = '';
  selectedCategoryId: number | null = null;
  selectedDepartment = '';
  selectedLocation = '';
  pageSize = 10;
  currentPage = 1;
  sortBy = 'created_at';
  sortOrder = 'desc';

  // Allowed State Machine Map
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
  selectedAssignTeam = '';
  selectedAssigneeId: number | null = null;

  statusDialogVisible = false;
  selectedNewStatus: RequestStatus | null = null;
  statusTransitionNote = '';

  priorityDialogVisible = false;
  selectedNewPriority: RequestPriority | null = null;

  detailsDialogVisible = false;

  ngOnInit(): void {
    this.loadCategories();
    this.loadStaffUsers();

    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      if (params['role']) {
        this.selectedRole = params['role'];
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
    this.adminService.getUsers({ is_active: true }).subscribe({
      next: (res) => {
        const privileged = (res.data || []).filter(
          (u) => u.role === 'admin' || u.role === 'support_staff'
        );
        this.staffUsers.set(privileged);
      },
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
        department: this.selectedDepartment || undefined,
        location: this.selectedLocation || undefined,
        requester_role: this.selectedRole || undefined,
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
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.selectedCategoryId = null;
    this.selectedDepartment = '';
    this.selectedLocation = '';
    this.currentPage = 1;
    this.loadRequests();
  }

  openQuickViewDialog(req: ServiceRequest): void {
    this.activeRequest = req;
    this.quickViewVisible = true;
  }

  // CSV Export
  exportToCSV(): void {
    const list = this.requests();
    if (list.length === 0) return;

    const headers = [
      'Ticket Code',
      'Title',
      'Category',
      'Faculty / Department',
      'Campus Location',
      'Room / Lab No',
      'Priority',
      'Status',
      'Assigned Team',
      'Assigned Staff',
      'Requester Name',
      'Requester Role',
      'Requester Email',
      'Created At',
      'Resolved At',
      'Description',
    ];

    const rows = list.map((r) => [
      `"${r.request_code || '#' + r.id}"`,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${r.category_name || 'General'}"`,
      `"${r.department || ''}"`,
      `"${r.location || ''}"`,
      `"${r.room_number || ''}"`,
      r.priority,
      r.status,
      `"${r.assigned_team || 'Unassigned'}"`,
      `"${r.assigned_to_name || 'Unassigned'}"`,
      `"${r.requester_name || ''}"`,
      `"${r.requester_role || 'student'}"`,
      r.requester_email || '',
      r.created_at,
      r.resolved_at || '',
      `"${(r.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AIT_ResolveX_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.messageService.add({
      severity: 'success',
      summary: 'CSV Export Successful',
      detail: `Exported ${list.length} AIT service requests to CSV.`,
    });
  }

  // 0. View Details
  viewDetails(req: ServiceRequest): void {
    this.activeRequest = req;
    this.detailsDialogVisible = true;
  }

  // 1. Assignment Workflow
  openAssignDialog(req: ServiceRequest): void {
    this.activeRequest = req;
    this.selectedAssignTeam = req.assigned_team || '';
    this.selectedAssigneeId = req.assigned_to || null;
    this.assignDialogVisible = true;
  }

  submitAssignment(): void {
    if (!this.activeRequest) return;

    this.submittingAction.set(true);
    this.adminService
      .assignRequest(this.activeRequest.id, {
        assigned_team: this.selectedAssignTeam || undefined,
        assigned_to: this.selectedAssigneeId || undefined,
      })
      .subscribe({
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

  // 2. Status Workflow
  openStatusDialog(req: ServiceRequest): void {
    this.activeRequest = req;
    this.selectedNewStatus = null;
    this.statusTransitionNote = '';
    this.statusDialogVisible = true;
  }

  getAllowedTransitions(currentStatus: RequestStatus): RequestStatus[] {
    return this.allowedTransitionsMap[currentStatus] || [];
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
            summary: 'Update Failed',
            detail: err.error?.message || 'Status transition failed',
          });
          this.submittingAction.set(false);
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
    this.adminService
      .updateRequestPriority(this.activeRequest.id, this.selectedNewPriority)
      .subscribe({
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
            summary: 'Update Failed',
            detail: err.error?.message || 'Failed to update priority',
          });
          this.submittingAction.set(false);
        },
      });
  }
}
