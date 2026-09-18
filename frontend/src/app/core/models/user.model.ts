export type UserRole = 'student' | 'lecturer' | 'staff' | 'support_staff' | 'admin' | 'user';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}
