export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  token: string | null;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: 'user' | 'admin';
  } | null;
}
