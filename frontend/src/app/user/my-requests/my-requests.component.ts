import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// PrimeNG Imports
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { RequestService } from '../../core/services/request.service';
import {
  ServiceRequest,
  Category,
  RequestStatus,
  RequestPriority,
  AIT_DEPARTMENTS,
} from '../../core/models/request.model';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TableModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>

    <div class="space-y-6">
      <!-- Top Title & Action Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">My Service Requests</h1>
            <span class="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              {{ totalRecords() }} Raised
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Track and monitor the status and assignment lifecycle of all your submitted AIT requests.
          </p>
        </div>

        <div class="flex items-center space-x-2">
          <button
            (click)="resetFilters()"
            class="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <i class="pi pi-filter-slash"></i>
            <span>Clear</span>
          </button>

          <a
            routerLink="/create-request"
            class="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow transition flex items-center gap-1.5"
          >
            <i class="pi pi-plus"></i>
            <span>New Request</span>
          </a>
        </div>
      </div>

      <!-- Filter Toolbar -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Search Keyword -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Search Requests</label>
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Search code, title, room..."
              class="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Filter Status</label>
          <select
            [(ngModel)]="selectedStatus"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Filter Priority</label>
          <select
            [(ngModel)]="selectedPriority"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option *ngFor="let p of priorityOptions" [value]="p">{{ p }}</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Filter Category</label>
          <select
            [(ngModel)]="selectedCategoryId"
            (change)="loadRequests()"
            class="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:outline-none"
          >
            <option [ngValue]="null">All Categories</option>
            <option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <!-- PrimeNG Data Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <p-table
          [value]="requests()"
          [lazy]="true"
          (onLazyLoad)="onLazyLoad($event)"
          [paginator]="true"
          [rows]="pageSize"
          [totalRecords]="totalRecords()"
          [loading]="loading()"
          [rowsPerPageOptions]="[5, 10, 20]"
          [tableStyle]="{ 'min-width': '60rem' }"
          styleClass="p-datatable-sm p-datatable-striped"
        >
          <!-- Table Header -->
          <ng-template pTemplate="header">
            <tr class="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <th pSortableColumn="request_code" class="w-32 py-3 px-4">
                Ticket Code <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th pSortableColumn="title" class="py-3 px-4">
                Issue Description <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th class="py-3 px-4">Category</th>
              <th class="py-3 px-4">Location</th>
              <th pSortableColumn="priority" class="w-28 py-3 px-4">
                Priority <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th pSortableColumn="status" class="w-32 py-3 px-4">
                Status <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th pSortableColumn="created_at" class="w-36 py-3 px-4">
                Date <i class="pi pi-sort-alt text-[10px] ml-1 text-slate-400"></i>
              </th>
              <th class="w-24 py-3 px-4 text-center">Track</th>
            </tr>
          </ng-template>

          <!-- Table Body -->
          <ng-template pTemplate="body" let-req>
            <tr class="hover:bg-slate-50/80 transition text-xs text-slate-800">
              <!-- Request Code -->
              <td class="py-3 px-4 font-mono font-bold text-blue-600">
                {{ req.request_code || '#' + req.id }}
              </td>

              <!-- Title & Preview -->
              <td class="py-3 px-4 max-w-xs">
                <a
                  [routerLink]="['/requests', req.id]"
                  class="font-bold text-slate-900 hover:text-blue-600 transition line-clamp-1 block"
                >
                  {{ req.title }}
                </a>
                <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {{ req.description }}
                </div>
              </td>

              <!-- Category -->
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  {{ req.category_name || 'General' }}
                </span>
              </td>

              <!-- Location -->
              <td class="py-3 px-4">
                <div class="text-xs text-slate-700 font-medium">{{ req.location }}</div>
                <div class="text-[10px] text-slate-400" *ngIf="req.room_number">{{ req.room_number }}</div>
              </td>

              <!-- Priority -->
              <td class="py-3 px-4">
                <span
                  [ngClass]="{
                    'bg-rose-100 text-rose-700 border-rose-200': req.priority === 'Urgent' || req.priority === 'Critical',
                    'bg-amber-100 text-amber-700 border-amber-200': req.priority === 'High',
                    'bg-blue-100 text-blue-700 border-blue-200': req.priority === 'Medium',
                    'bg-slate-100 text-slate-600 border-slate-200': req.priority === 'Low'
                  }"
                  class="px-2 py-0.5 rounded-full border text-[11px] font-bold inline-flex items-center gap-1"
                >
                  {{ req.priority }}
                </span>
              </td>

              <!-- Status -->
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

              <!-- Created At -->
              <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">
                {{ req.created_at | date: 'MMM d, y, h:mm a' }}
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-center">
                <a
                  [routerLink]="['/requests', req.id]"
                  class="p-1.5 inline-flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="View Status Progress & Details"
                >
                  <i class="pi pi-arrow-right text-xs"></i>
                </a>
              </td>
            </tr>
          </ng-template>

          <!-- Empty State -->
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center py-10 text-slate-400">
                <i class="pi pi-inbox text-3xl mb-2 text-slate-300"></i>
                <p class="font-medium text-xs">No service requests found matching your filters.</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
})
export class MyRequestsComponent implements OnInit {
  requestService = inject(RequestService);

  requests = signal<ServiceRequest[]>([]);
  categories = signal<Category[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);

  searchQuery = '';
  selectedStatus = '';
  selectedPriority = '';
  selectedCategoryId: number | null = null;
  pageSize = 10;
  currentPage = 1;
  sortBy = 'created_at';
  sortOrder = 'desc';

  statusOptions: RequestStatus[] = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  priorityOptions: RequestPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  ngOnInit(): void {
    this.loadCategories();
    this.loadRequests();
  }

  loadCategories(): void {
    this.requestService.getMetadata().subscribe({
      next: (res) => this.categories.set(res.data.categories || []),
      error: () => {},
    });
  }

  loadRequests(): void {
    this.loading.set(true);

    this.requestService
      .getMyRequests({
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
}
