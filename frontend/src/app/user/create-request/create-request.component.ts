import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Category,
  RequestPriority,
  AIT_DEPARTMENTS,
  AIT_LOCATIONS,
} from '../../core/models/request.model';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>

    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Breadcrumb Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <a routerLink="/dashboard" class="hover:text-blue-600 transition">Dashboard</a>
            <span>/</span>
            <span class="text-slate-800 font-semibold">Create Service Request</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">
            Raise AIT Service Request
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Report internal IT, equipment, facility, or administrative issues to AIT support teams.
          </p>
        </div>

        <a
          routerLink="/my-requests"
          class="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
        >
          <i class="pi pi-list"></i>
          <span>View My Requests</span>
        </a>
      </div>

      <!-- Main Request Creation Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <form (ngSubmit)="submitRequest()" #requestForm="ngForm" class="space-y-6">
          
          <!-- 1. Issue Title -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Request Title <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              [(ngModel)]="form.title"
              required
              minlength="5"
              placeholder="e.g. Broken Projector HDMI connector in Lecture Hall B / Wi-Fi dropping in Lab 3"
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
              #titleModel="ngModel"
            />
            <div *ngIf="titleModel.invalid && (titleModel.dirty || titleModel.touched)" class="text-rose-500 text-[11px] mt-1 font-medium">
              Please provide a descriptive title (at least 5 characters).
            </div>
          </div>

          <!-- 2. Two-Column Row: Category & Department -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Category Selection -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Service Category <span class="text-rose-500">*</span>
              </label>
              <select
                name="category_id"
                [(ngModel)]="form.category_id"
                required
                class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
              >
                <option [ngValue]="null" disabled selected>Select Category...</option>
                <option *ngFor="let cat of categories()" [ngValue]="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- AIT Faculty / Division -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                AIT Faculty / Division <span class="text-rose-500">*</span>
              </label>
              <select
                name="department"
                [(ngModel)]="form.department"
                required
                class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
              >
                <option value="" disabled selected>Select Faculty/Division...</option>
                <option *ngFor="let dept of departments" [value]="dept">
                  {{ dept }}
                </option>
              </select>
            </div>
          </div>

          <!-- 3. Two-Column Row: Campus Location & Room/Lab No -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Campus Building Location -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Location / Building <span class="text-rose-500">*</span>
              </label>
              <select
                name="location"
                [(ngModel)]="form.location"
                required
                class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
              >
                <option value="" disabled selected>Select Location...</option>
                <option *ngFor="let loc of locations" [value]="loc">
                  {{ loc }}
                </option>
              </select>
            </div>

            <!-- Specific Room or Lab Number -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Specific Room / Lab / Area (Optional)
              </label>
              <input
                type="text"
                name="room_number"
                [(ngModel)]="form.room_number"
                placeholder="e.g. Lab 402, Lecture Hall 2, Staff Room 104"
                class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>

          <!-- 4. Priority Selection (Cards UI) -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Priority Urgency <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                *ngFor="let p of priorityOptions"
                (click)="form.priority = p.value"
                [ngClass]="{
                  'ring-2 ring-blue-600 bg-blue-50/70 border-blue-600': form.priority === p.value,
                  'border-slate-200 hover:bg-slate-50 bg-white': form.priority !== p.value
                }"
                class="p-3 border rounded-xl cursor-pointer transition text-left space-y-1 select-none"
              >
                <div class="flex items-center justify-between">
                  <span
                    [ngClass]="p.badgeClass"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    {{ p.value }}
                  </span>
                  <i
                    class="pi pi-check-circle text-xs text-blue-600"
                    *ngIf="form.priority === p.value"
                  ></i>
                </div>
                <div class="text-[11px] text-slate-500 leading-tight">
                  {{ p.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Issue Description -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description <span class="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              [(ngModel)]="form.description"
              required
              minlength="10"
              rows="4"
              placeholder="Describe the issue in detail, including steps to reproduce, affected equipment or workstation numbers, and any troubleshooting already performed..."
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
              #descModel="ngModel"
            ></textarea>
            <div *ngIf="descModel.invalid && (descModel.dirty || descModel.touched)" class="text-rose-500 text-[11px] mt-1 font-medium">
              Please provide at least 10 characters detailing the request.
            </div>
          </div>

          <!-- Requester Auto-Assigned Banner -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <div class="flex items-center space-x-2">
              <i class="pi pi-user-check text-blue-600 text-sm"></i>
              <span>
                Raising as: <strong>{{ currentUser()?.full_name }}</strong> ({{ currentUser()?.email }})
              </span>
            </div>
            <span class="text-[10px] text-slate-400 capitalize font-mono">{{ currentUser()?.role }}</span>
          </div>

          <!-- Form Action Buttons -->
          <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <a
              routerLink="/dashboard"
              class="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </a>

            <button
              type="submit"
              [disabled]="requestForm.invalid || submitting()"
              class="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="pi pi-spin pi-spinner" *ngIf="submitting()"></i>
              <i class="pi pi-send" *ngIf="!submitting()"></i>
              <span>{{ submitting() ? 'Submitting Request...' : 'Submit Service Request' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CreateRequestComponent implements OnInit {
  requestService = inject(RequestService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  router = inject(Router);

  currentUser = this.authService.currentUser;
  categories = signal<Category[]>([]);
  submitting = signal<boolean>(false);

  departments = AIT_DEPARTMENTS;
  locations = AIT_LOCATIONS;

  priorityOptions: { value: RequestPriority; description: string; badgeClass: string }[] = [
    {
      value: 'Low',
      description: 'Minor inquiry or non-critical item',
      badgeClass: 'bg-slate-100 text-slate-700',
    },
    {
      value: 'Medium',
      description: 'Standard service request or minor defect',
      badgeClass: 'bg-blue-100 text-blue-700',
    },
    {
      value: 'High',
      description: 'Disrupting ongoing academic work or lectures',
      badgeClass: 'bg-amber-100 text-amber-700',
    },
    {
      value: 'Urgent',
      description: 'Critical outage affecting campus or exams',
      badgeClass: 'bg-rose-100 text-rose-700',
    },
  ];

  form = {
    title: '',
    category_id: null as number | null,
    department: '',
    location: '',
    room_number: '',
    priority: 'Medium' as RequestPriority,
    description: '',
  };

  ngOnInit(): void {
    // Load categories
    this.requestService.getMetadata().subscribe({
      next: (res) => {
        this.categories.set(res.data.categories || []);
      },
      error: () => {},
    });

    // Auto-select department from user's profile if available
    const userDept = this.currentUser()?.department;
    if (userDept && this.departments.includes(userDept as any)) {
      this.form.department = userDept;
    }
  }

  submitRequest(): void {
    if (!this.form.title || !this.form.category_id || !this.form.department || !this.form.location || !this.form.description) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Incomplete Form',
        detail: 'Please fill in all required fields.',
      });
      return;
    }

    this.submitting.set(true);

    this.requestService
      .createRequest({
        title: this.form.title,
        category_id: this.form.category_id,
        department: this.form.department,
        location: this.form.location,
        room_number: this.form.room_number || undefined,
        priority: this.form.priority,
        description: this.form.description,
      })
      .subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Request Submitted',
            detail: res.message || 'Service request created successfully.',
          });

          setTimeout(() => {
            this.router.navigate(['/my-requests']);
          }, 1000);
        },
        error: (err) => {
          this.submitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Submission Failed',
            detail: err.error?.message || 'Could not submit request. Please try again.',
          });
        },
      });
  }
}
