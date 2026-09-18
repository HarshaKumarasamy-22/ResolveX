import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      <!-- Top Navigation Bar -->
      <header class="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl sticky top-0 z-50 border-b border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Brand Logo & Badge -->
            <div class="flex items-center space-x-3.5">
              <a routerLink="/dashboard" class="flex items-center space-x-3 group">
                <div class="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg border border-blue-400/30 group-hover:scale-105 transition-transform">
                  <span class="text-white">AIT</span>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-black tracking-tight text-white group-hover:text-blue-200 transition">
                      ResolveX
                    </span>
                    <span class="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                      Admin Management Portal
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 font-medium tracking-wide">
                    Aurevia Institute of Technology • “Innovate. Connect. Resolve.”
                  </p>
                </div>
              </a>
            </div>

            <!-- Navigation Links -->
            <nav class="hidden md:flex items-center space-x-1">
              <a
                routerLink="/dashboard"
                routerLinkActive="bg-white/10 text-white font-bold shadow-inner"
                class="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition flex items-center space-x-1.5"
              >
                <i class="pi pi-th-large text-sm"></i>
                <span>Dashboard</span>
              </a>
              <a
                routerLink="/requests"
                routerLinkActive="bg-white/10 text-white font-bold shadow-inner"
                class="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition flex items-center space-x-1.5"
              >
                <i class="pi pi-list text-sm"></i>
                <span>All Requests</span>
              </a>
              <a
                routerLink="/users"
                routerLinkActive="bg-white/10 text-white font-bold shadow-inner"
                class="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition flex items-center space-x-1.5"
              >
                <i class="pi pi-users text-sm"></i>
                <span>User Directory</span>
              </a>
              <a
                routerLink="/structure"
                routerLinkActive="bg-white/10 text-white font-bold shadow-inner"
                class="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition flex items-center space-x-1.5"
              >
                <i class="pi pi-sitemap text-sm"></i>
                <span>AIT Structure</span>
              </a>
            </nav>

            <!-- Admin Profile Indicator -->
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-2.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-sm">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black shadow border border-white/20">
                  {{ currentUser()?.full_name?.charAt(0) || 'H' }}
                </div>
                <div class="text-left">
                  <div class="text-xs font-bold text-white leading-tight">
                    {{ currentUser()?.full_name || 'Harsha Bandara' }}
                  </div>
                  <div class="text-[10px] text-blue-300 font-mono flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Administrator • AIT Colombo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="md:hidden flex items-center justify-around py-2 border-t border-slate-800 bg-slate-950 text-xs">
          <a routerLink="/dashboard" routerLinkActive="text-blue-400 font-bold" class="flex flex-col items-center py-1 text-slate-400">
            <i class="pi pi-th-large"></i>
            <span class="text-[10px]">Dashboard</span>
          </a>
          <a routerLink="/requests" routerLinkActive="text-blue-400 font-bold" class="flex flex-col items-center py-1 text-slate-400">
            <i class="pi pi-list"></i>
            <span class="text-[10px]">All Requests</span>
          </a>
          <a routerLink="/users" routerLinkActive="text-blue-400 font-bold" class="flex flex-col items-center py-1 text-slate-400">
            <i class="pi pi-users"></i>
            <span class="text-[10px]">Users</span>
          </a>
          <a routerLink="/structure" routerLinkActive="text-blue-400 font-bold" class="flex flex-col items-center py-1 text-slate-400">
            <i class="pi pi-sitemap"></i>
            <span class="text-[10px]">AIT Structure</span>
          </a>
        </div>
      </header>

      <!-- Main Content View -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <router-outlet></router-outlet>
      </main>

      <!-- Institutional Footer -->
      <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-slate-800">ResolveX</span>
            <span class="text-slate-400">•</span>
            <span>Aurevia Institute of Technology (AIT) – Internal Service Desk System</span>
          </div>
          <div class="text-slate-400 text-[11px]">
            Person 1 (Harsha) – Core Request Management & Admin Management
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;
}
