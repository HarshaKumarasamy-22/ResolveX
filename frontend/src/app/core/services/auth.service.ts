import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { ApiResponse } from '../models/request.model';

export interface AuthState {
  token: string | null;
  user: User | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5001/api/auth';
  private readonly TOKEN_KEY = 'resolvex_jwt_token';
  private readonly USER_KEY = 'resolvex_user_data';

  // Default to Admin Harsha for Person 1 module
  private defaultAdminUser: User = {
    id: 1,
    full_name: 'Harsha Bandara',
    email: 'admin@ait.lk',
    role: 'admin',
    department: 'Student Affairs & Support Services',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  // Reactive state using Angular Signals
  private authState = signal<AuthState>({
    token: this.getInitialToken() || 'admin_jwt_token',
    user: this.getInitialUser() || this.defaultAdminUser,
  });

  currentUser = computed(() => this.authState().user);
  isLoggedIn = computed(() => !!this.authState().token);
  isAdmin = computed(() => this.authState().user?.role === 'admin');
  isSupportStaff = computed(() => this.authState().user?.role === 'support_staff');
  isSupportOrAdmin = computed(() => {
    const role = this.authState().user?.role;
    return role === 'admin' || role === 'support_staff';
  });

  constructor(private http: HttpClient) {
    // Authenticate with backend admin credentials
    this.login('admin@ait.lk', 'Password@123').subscribe({
      next: (res) => {
        // Authenticated with backend token
      },
      error: () => {
        // Retain fallback admin session
        this.setSession('admin_jwt_token', this.defaultAdminUser);
      },
    });
  }

  login(email: string, password: string = 'Password@123'): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, {
      email,
      password,
    }).pipe(
      tap((res) => {
        if (res.success && res.token) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  setSession(token: string, user: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.authState.set({ token, user });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.authState.set({ token: null, user: null });
  }

  getToken(): string | null {
    return this.authState().token;
  }

  private getInitialToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getInitialUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
