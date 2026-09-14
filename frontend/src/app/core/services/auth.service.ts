import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, AuthState } from '../models/user.model';
import { ApiResponse } from '../models/request.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5000/api/auth';
  private readonly TOKEN_KEY = 'resolvex_jwt_token';
  private readonly USER_KEY = 'resolvex_user_data';

  // Reactive state using Angular Signals
  private authState = signal<AuthState>({
    token: this.getInitialToken(),
    user: this.getInitialUser(),
  });

  currentUser = computed(() => this.authState().user);
  isLoggedIn = computed(() => !!this.authState().token);
  isAdmin = computed(() => this.authState().user?.role === 'admin');

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<ApiResponse<{ token: string; user: User }>> {
    return this.http.post<ApiResponse<{ token: string; user: User }>>(`${this.API_URL}/login`, {
      email,
      password,
    }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setSession(res.data.token, res.data.user);
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

  private getInitialUser(): any {
    const raw = localStorage.getItem(this.USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
