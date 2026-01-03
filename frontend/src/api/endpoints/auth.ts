import api from '../client';
import {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  User,
} from '../types';

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login/', data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<RegisterResponse>>('/auth/register/', data);
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await api.post<ApiResponse>('/auth/logout/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/me/');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<{ tokens: { access: string; refresh: string } }>>(
      '/auth/refresh/',
      { refresh: refreshToken }
    );
    return response.data;
  },
};