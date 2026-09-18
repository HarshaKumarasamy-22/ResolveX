import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AnalyticsSummary,
  CategoryCount,
  StatusCount,
  PriorityCount,
  DepartmentCount,
  LocationCount,
} from '../models/person3.model';
import { ApiResponse } from './comments.service';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:5001/api/analytics';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<ApiResponse<AnalyticsSummary>> {
    return this.http.get<ApiResponse<AnalyticsSummary>>(`${this.apiUrl}/summary`);
  }

  getByCategory(): Observable<ApiResponse<CategoryCount[]>> {
    return this.http.get<ApiResponse<CategoryCount[]>>(`${this.apiUrl}/by-category`);
  }

  getByStatus(): Observable<ApiResponse<StatusCount[]>> {
    return this.http.get<ApiResponse<StatusCount[]>>(`${this.apiUrl}/by-status`);
  }

  getByPriority(): Observable<ApiResponse<PriorityCount[]>> {
    return this.http.get<ApiResponse<PriorityCount[]>>(`${this.apiUrl}/by-priority`);
  }

  getByDepartment(): Observable<ApiResponse<DepartmentCount[]>> {
    return this.http.get<ApiResponse<DepartmentCount[]>>(`${this.apiUrl}/by-department`);
  }

  getByLocation(): Observable<ApiResponse<LocationCount[]>> {
    return this.http.get<ApiResponse<LocationCount[]>>(`${this.apiUrl}/by-location`);
  }
}
