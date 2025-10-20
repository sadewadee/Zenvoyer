/**
 * Auth API Services
 * Centralized functions untuk auth-related API calls
 */

import { get, post, patch } from '../client';
import { API_ENDPOINTS } from '../../constants';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscription: {
    plan: string;
    status: string;
  };
  accessToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  subscription: {
    plan: string;
    status: string;
  };
  createdAt: string;
}

export const authApi = {
  /**
   * Register new user
   */
  register: (payload: RegisterPayload) =>
    post<AuthResponse>(API_ENDPOINTS.AUTH_REGISTER, payload),

  /**
   * Login user
   */
  login: (payload: LoginPayload) =>
    post<AuthResponse>(API_ENDPOINTS.AUTH_LOGIN, payload),

  /**
   * Get current user profile
   */
  getCurrentUser: () =>
    get<UserProfile>(API_ENDPOINTS.AUTH_ME),

  /**
   * Change password
   */
  changePassword: (payload: ChangePasswordPayload) =>
    patch<{ message: string }>(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, payload),
};

export default authApi;
