export interface Comment {
  id: number;
  request_id?: number;
  message: string;
  created_at: string;
  user_id: number;
  author_name: string;
  author_role: string;
  author_department?: string;
}

export interface ActivityLog {
  id: number;
  request_id?: number;
  action_type: string;
  details: string;
  created_at: string;
  user_id?: number;
  actor_name: string;
  actor_role: string;
  actor_department?: string;
}

export interface AnalyticsSummary {
  total_requests: string | number;
  pending_requests: string | number;
  assigned_requests?: string | number;
  in_progress_requests: string | number;
  resolved_requests: string | number;
  closed_requests?: string | number;
  high_critical_requests: string | number; // Represents High & Urgent / Critical priorities
}

export interface CategoryCount {
  category: string;
  count: string | number;
}

export interface StatusCount {
  status: string;
  count: string | number;
}

export interface PriorityCount {
  priority: string;
  count: string | number;
}

export interface DepartmentCount {
  department: string;
  count: string | number;
}

export interface LocationCount {
  location: string;
  count: string | number;
}
