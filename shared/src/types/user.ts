export type Role = 'GUEST' | 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role: Role;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}
