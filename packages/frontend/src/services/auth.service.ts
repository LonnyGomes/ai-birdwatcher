import apiClient from './api.service';
import type { UserSafe } from '@shared/types/user.types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserSafe;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  }

  async getCurrentUser(): Promise<UserSafe> {
    const response = await apiClient.get<{ user: UserSafe }>('/api/auth/me');
    return response.data.user;
  }

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  }
}

export default new AuthService();
