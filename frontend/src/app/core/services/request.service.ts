import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ServiceRequest,
  CreateRequestPayload,
  UserSummary,
  AITMetadata,
  ApiResponse,
  PaginatedResponse,
} from '../models/request.model';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/requests';

  /**
   * 1. Get AIT Metadata (Categories, Departments, Locations, Support Teams, Priorities)
   */
  getMetadata(): Observable<ApiResponse<AITMetadata>> {
    return this.http.get<ApiResponse<AITMetadata>>(`${this.apiUrl}/meta`);
  }

  /**
   * 2. Get User Dashboard Summary (My summary)
   */
  getUserSummary(): Observable<ApiResponse<UserSummary>> {
    return this.http.get<ApiResponse<UserSummary>>(`${this.apiUrl}/my/summary`);
  }

  /**
   * 3. Get User's Own Requests (My Requests) with search, filter, pagination
   */
  getMyRequests(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category_id?: number;
    department?: string;
    location?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<PaginatedResponse<ServiceRequest>> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<ServiceRequest>>(`${this.apiUrl}/my`, { params });
  }

  /**
   * 4. Create a new Service Request
   */
  createRequest(payload: CreateRequestPayload): Observable<ApiResponse<ServiceRequest>> {
    return this.http.post<ApiResponse<ServiceRequest>>(this.apiUrl, payload);
  }

  /**
   * 5. Get Single Request Details by ID
   */
  getRequestById(id: number): Observable<ApiResponse<ServiceRequest>> {
    return this.http.get<ApiResponse<ServiceRequest>>(`${this.apiUrl}/${id}`);
  }
}
