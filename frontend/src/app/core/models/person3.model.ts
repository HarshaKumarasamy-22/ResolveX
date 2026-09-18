export interface Comment {
  id: number;
  message: string;
  created_at: string;
  user_id: number;
  author_name: string;
  author_role: string;
}

export interface ActivityLog {
  id: number;
  action_type: string;
  details: string;
  created_at: string;
  actor_name: string;
  actor_role: string;
}

export interface AnalyticsSummary {
  total_requests: string;
  pending_requests: string;
  in_progress_requests: string;
  resolved_requests: string;
  high_critical_requests: string;
}

export interface CategoryCount {
  category: string;
  count: string;
}

export interface StatusCount {
  status: string;
  count: string;
}

export interface PriorityCount {
  priority: string;
  count: string;
}
