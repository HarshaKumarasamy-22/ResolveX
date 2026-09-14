import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ServiceRequest,
  DashboardSummary,
  PaginatedResponse,
  ApiResponse,
  Category,
  RequestStatus,
  RequestPriority,
} from '../models/request.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly API_URL = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  /**
   * 1. Get Dashboard Summary Statistics
   */
  getDashboardSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.API_URL}/dashboard/summary`);
  }

  /**
   * 2. Get All Requests with Filtering, Search & Pagination
   */
  getAllRequests(filters: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category_id?: number;
    assigned_to?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<PaginatedResponse<ServiceRequest>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<PaginatedResponse<ServiceRequest>>(`${this.API_URL}/requests`, { params });
  }

  /**
   * 3. Update Request Status (with state machine validation)
   */
  updateRequestStatus(id: number, status: RequestStatus, note?: string): Observable<ApiResponse<ServiceRequest>> {
    return this.http.patch<ApiResponse<ServiceRequest>>(`${this.API_URL}/requests/${id}/status`, {
      status,
      note,
    });
  }

  /**
   * 4. Update Request Priority
   */
  updateRequestPriority(id: number, priority: RequestPriority): Observable<ApiResponse<ServiceRequest>> {
    return this.http.patch<ApiResponse<ServiceRequest>>(`${this.API_URL}/requests/${id}/priority`, {
      priority,
    });
  }

  /**
   * 5. Assign Request to a Staff Member
   */
  assignRequest(id: number, assigned_to: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/requests/${id}/assign`, {
      assigned_to,
    });
  }

  /**
   * 6. Get Users for Assignment / Management
   */
  getUsers(options?: { role?: string; is_active?: boolean; search?: string }): Observable<ApiResponse<User[]>> {
    let params = new HttpParams();
    if (options?.role) params = params.set('role', options.role);
    if (options?.is_active !== undefined) params = params.set('is_active', options.is_active.toString());
    if (options?.search) params = params.set('search', options.search);

    return this.http.get<ApiResponse<User[]>>(`${this.API_URL}/users`, { params });
  }

  /**
   * 7. Update User Status / Role
   */
  updateUser(id: number, data: { is_active?: boolean; role?: 'user' | 'admin' }): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.API_URL}/users/${id}/status`, data);
  }

  /**
   * 8. Get Categories
   */
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.API_URL}/categories`);
  }
}
