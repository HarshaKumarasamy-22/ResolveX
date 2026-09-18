import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header class="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl sticky top-0 z-50 border-b border-indigo-900/40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-3.5">
              <a routerLink="/dashboard" class="flex items-center space-x-2.5 group">
                <div class="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                  <span class="text-white">AIT</span>
                </div>
                <div>
                  <div class="flex items-center space-x-1.5">
                    <span class="text-lg font-black tracking-tight text-white">ResolveX</span>
                    <span class="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded font-mono font-medium">AIT Portal</span>
                  </div>
                  <p class="text-[10px] text-slate-400 font-medium">Aurevia Institute of Technology • Colombo</p>
                </div>
              </a>
            </div>

            <nav class="flex items-center space-x-2">
              <a routerLink="/dashboard" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white">Dashboard</a>
              <a routerLink="/requests" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white">All Requests</a>
            </nav>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class UserLayoutComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;
}
