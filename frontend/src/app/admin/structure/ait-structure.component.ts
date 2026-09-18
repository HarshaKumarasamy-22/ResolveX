import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RequestService } from '../../core/services/request.service';
import {
  AIT_DEPARTMENTS,
  AIT_LOCATIONS,
  AIT_SUPPORT_TEAMS,
  Category,
} from '../../core/models/request.model';

@Component({
  selector: 'app-ait-structure',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Title Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <a routerLink="/admin/dashboard" class="hover:text-blue-600 transition">Admin Dashboard</a>
            <span>/</span>
            <span class="text-slate-800 font-semibold">AIT University Structure</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">
            Aurevia Institute of Technology (AIT) Hierarchy & Routing
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Internal organizational mapping for academic divisions, campus locations, support teams, and categories.
          </p>
        </div>
      </div>

      <!-- Grid: 4 Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 1. Academic & Support Divisions (5 Faculties) -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div class="w-9 h-9 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-bold text-sm">
              <i class="pi pi-building"></i>
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-900">5 Academic & Support Divisions</h2>
              <p class="text-[11px] text-slate-500">Primary faculties and student divisions</p>
            </div>
          </div>

          <div class="space-y-2.5">
            <div *ngFor="let dept of departments; let i = index" class="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div class="flex items-center space-x-2.5">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-mono font-bold text-[10px]">
                  {{ i + 1 }}
                </span>
                <span class="font-bold text-slate-800">{{ dept }}</span>
              </div>
              <span class="text-[10px] text-slate-400 font-mono">Active</span>
            </div>
          </div>
        </div>

        <!-- 2. Support Teams (5 Teams) -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div class="w-9 h-9 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-sm">
              <i class="pi pi-shield"></i>
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-900">5 Specialized Support Teams</h2>
              <p class="text-[11px] text-slate-500">Service desk assignment queues</p>
            </div>
          </div>

          <div class="space-y-2.5">
            <div *ngFor="let team of supportTeams; let i = index" class="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div class="flex items-center space-x-2.5">
                <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-mono font-bold text-[10px]">
                  {{ i + 1 }}
                </span>
                <span class="font-bold text-slate-800">{{ team }}</span>
              </div>
              <span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-semibold">
                Tier 1 / 2
              </span>
            </div>
          </div>
        </div>

        <!-- 3. Campus Buildings & Locations (11 Locations) -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div class="w-9 h-9 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold text-sm">
              <i class="pi pi-map-marker"></i>
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-900">11 Campus Locations & Facilities</h2>
              <p class="text-[11px] text-slate-500">AIT Colombo Campus Buildings & Labs</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div *ngFor="let loc of locations" class="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs flex items-center space-x-2">
              <i class="pi pi-compass text-[10px] text-amber-600"></i>
              <span class="font-semibold text-slate-800">{{ loc }}</span>
            </div>
          </div>
        </div>

        <!-- 4. 8 Official AIT Categories -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div class="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm">
              <i class="pi pi-tags"></i>
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-900">8 Official Request Categories</h2>
              <p class="text-[11px] text-slate-500">Configured taxonomy for request triage</p>
            </div>
          </div>

          <div class="space-y-2">
            <div *ngFor="let cat of categories()" class="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
              <div class="font-bold text-slate-800 flex items-center space-x-1.5">
                <i class="pi" [ngClass]="cat.icon || 'pi-cog'"></i>
                <span>{{ cat.name }}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">{{ cat.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AitStructureComponent implements OnInit {
  requestService = inject(RequestService);

  departments = AIT_DEPARTMENTS;
  locations = AIT_LOCATIONS;
  supportTeams = AIT_SUPPORT_TEAMS;
  categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.requestService.getMetadata().subscribe({
      next: (res) => this.categories.set(res.data.categories || []),
      error: () => {},
    });
  }
}
