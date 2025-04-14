import { User } from './user';

export interface AuthResponse {
  token: string;
  user?: User;
  user_id?: number;
  username?: string;
  email?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}