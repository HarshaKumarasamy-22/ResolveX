export type RequestStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';

export type AITDepartment =
  | 'Faculty of Computing & Software Engineering'
  | 'Faculty of Engineering & Technology'
  | 'Faculty of Business & Management'
  | 'Faculty of Design & Digital Media'
  | 'Student Affairs & Support Services';

export const AIT_DEPARTMENTS: AITDepartment[] = [
  'Faculty of Computing & Software Engineering',
  'Faculty of Engineering & Technology',
  'Faculty of Business & Management',
  'Faculty of Design & Digital Media',
  'Student Affairs & Support Services',
];

export const AIT_LOCATIONS = [
  'Computing Building',
  'Engineering Building',
  'Business Building',
  'Design Building',
  'Administration Building',
  'Student Centre',
  'Library',
  'Innovation Centre',
  'Cafeteria',
  'Lecture Halls',
  'Computer Laboratories',
];

export const AIT_SUPPORT_TEAMS = [
  'IT Support',
  'Network Support',
  'Facilities & Maintenance',
  'Laboratory Support',
  'Student Services',
];

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface ServiceRequest {
  id: number;
  request_code?: string;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  category_icon?: string;
  requester_id: number;
  requester_name?: string;
  requester_email?: string;
  requester_department?: string;
  requester_role?: string;
  department: string;
  location: string;
  room_number?: string;
  status: RequestStatus;
  priority: RequestPriority;
  assigned_team?: string | null;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
  assigned_to_email?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  category_id: number;
  department: string;
  location: string;
  room_number?: string;
  priority: RequestPriority;
}

export interface UserSummary {
  total_submitted: number;
  pending_count: number;
  assigned_count: number;
  in_progress_count: number;
  resolved_count: number;
  closed_count: number;
}

export interface DepartmentCount {
  department: string;
  count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface DashboardSummary {
  total_requests: number;
  pending_count: number;
  assigned_count: number;
  in_progress_count: number;
  resolved_count: number;
  closed_count: number;
  urgent_high_count: number;
  users?: {
    total: number;
    admins: number;
    support_staff: number;
    students: number;
    lecturers: number;
    active: number;
  };
  by_department?: DepartmentCount[];
  by_category?: CategoryCount[];
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

export interface AITMetadata {
  categories: Category[];
  departments: string[];
  locations: string[];
  support_teams: string[];
  priorities: RequestPriority[];
  statuses: RequestStatus[];
}
