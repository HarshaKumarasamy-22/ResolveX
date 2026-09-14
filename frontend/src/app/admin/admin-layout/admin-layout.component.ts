import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col">
      <!-- Top Navigation Bar -->
      <header class="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Brand Logo & Badge -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <div class="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow">
                  RX
                </div>
                <span class="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent">
                  ResolveX
                </span>
              </div>
              <span class="bg-blue-900/60 text-blue-300 border border-blue-700/50 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Admin Portal
              </span>
            </div>

            <!-- Navigation Links -->
            <nav class="hidden md:flex items-center space-x-1">
              <a
                routerLink="/admin/dashboard"
                routerLinkActive="bg-slate-800 text-blue-400 font-semibold"
                class="px-3.5 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center space-x-1.5"
              >
                <i class="pi pi-th-large text-sm"></i>
                <span>Dashboard</span>
              </a>
              <a
                routerLink="/admin/requests"
                routerLinkActive="bg-slate-800 text-blue-400 font-semibold"
                class="px-3.5 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center space-x-1.5"
              >
                <i class="pi pi-list text-sm"></i>
                <span>All Requests</span>
              </a>
              <a
                routerLink="/admin/users"
                routerLinkActive="bg-slate-800 text-blue-400 font-semibold"
                class="px-3.5 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center space-x-1.5"
              >
                <i class="pi pi-users text-sm"></i>
                <span>Users</span>
              </a>
            </nav>

            <!-- User Status & Demo Switcher -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2 text-right">
                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                  {{ currentUser()?.full_name?.charAt(0) || 'A' }}
                </div>
                <div class="hidden sm:block text-left">
                  <div class="text-xs font-semibold text-white">{{ currentUser()?.full_name || 'Admin Harsha' }}</div>
                  <div class="text-[10px] text-slate-400 capitalize">{{ currentUser()?.role || 'Admin' }}</div>
                </div>
              </div>

              <!-- Quick Demo Token Auto-Set (For smooth testing without separate login form) -->
              <button
                *ngIf="!isLoggedIn()"
                (click)="setMockAdminSession()"
                class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-md shadow transition"
              >
                Activate Admin Mode
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content View -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        ResolveX – Smart Service Request & Issue Management System • Admin Module (Person 2)
      </footer>
    </div>
  `,
})
export class AdminLayoutComponent {
  authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  isLoggedIn = this.authService.isLoggedIn;

  setMockAdminSession(): void {
    // Generate a temporary mock admin session for frontend preview if backend is starting
    this.authService.setSession('demo_token', {
      id: 1,
      full_name: 'Admin Harsha',
      email: 'admin@resolvex.com',
      role: 'admin',
    });
  }
}
