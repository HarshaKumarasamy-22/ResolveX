import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityLog } from '../models/person3.model';
import { ApiResponse } from './comments.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = 'http://localhost:5001/api/requests';

  constructor(private http: HttpClient) {}

  getActivityLogs(requestId: number): Observable<ApiResponse<ActivityLog[]>> {
    return this.http.get<ApiResponse<ActivityLog[]>>(`${this.apiUrl}/${requestId}/activity`);
  }
}
