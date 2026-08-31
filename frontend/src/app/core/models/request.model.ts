export type RequestStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  requester_id: number;
  requester_name?: string;
  requester_email?: string;
  status: RequestStatus;
  priority: RequestPriority;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
  assigned_to_email?: string | null;
}

export interface DashboardSummary {
  total_requests: number;
  pending_count: number;
  assigned_count: number;
  in_progress_count: number;
  resolved_count: number;
  closed_count: number;
  high_critical_count: number;
  users?: {
    total: number;
    admins: number;
    active: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
