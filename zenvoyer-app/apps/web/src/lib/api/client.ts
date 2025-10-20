/**
 * API Client
 * Centralized HTTP client dengan error handling yang konsisten
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT, TOKEN_KEY } from '../constants';
import { AppError, ErrorType, isApiError } from '../../types/error';

// Axios instance
let axiosInstance: AxiosInstance;

// Error mapping
const mapHttpStatusToErrorType = (status: number): ErrorType => {
  switch (status) {
    case 400:
    case 422:
      return ErrorType.VALIDATION;
    case 401:
      return ErrorType.AUTHENTICATION;
    case 403:
      return ErrorType.AUTHORIZATION;
    case 404:
      return ErrorType.NOT_FOUND;
    case 409:
      return ErrorType.CONFLICT;
    case 500:
    case 502:
    case 503:
      return ErrorType.SERVER_ERROR;
    default:
      return ErrorType.UNKNOWN_ERROR;
  }
};

// Initialize axios instance
export const initializeApiClient = () => {
  axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const statusCode = error.response?.status || 0;
      const errorType = mapHttpStatusToErrorType(statusCode);
      const message = (error.response?.data as any)?.message || error.message || 'An error occurred';
      const details = (error.response?.data as any)?.details;

      const appError = new AppError(
        errorType,
        message,
        statusCode,
        details
      );

      // Handle auth errors globally
      if (statusCode === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          // Dispatch event untuk handle logout
          window.dispatchEvent(new CustomEvent('auth-error'));
        }
      }

      return Promise.reject(appError);
    }
  );

  return axiosInstance;
};

// Get or initialize client
const getClient = (): AxiosInstance => {
  if (!axiosInstance) {
    initializeApiClient();
  }
  return axiosInstance;
};

// API Client Interface
export interface ApiClientConfig extends AxiosRequestConfig {
  skipErrorHandling?: boolean;
}

/**
 * Generic API client function
 * @template T - Response data type
 * @param url - API endpoint
 * @param config - Axios config
 */
export async function apiClient<T = any>(
  url: string,
  config?: ApiClientConfig
): Promise<T> {
  try {
    const client = getClient();
    const response = await client.request<T>({
      url,
      ...config,
    });
    return response.data;
  } catch (error) {
    // Re-throw if it's already an ApiError
    if (isApiError(error)) {
      throw error;
    }

    // Handle network errors
    if (error instanceof Error) {
      if (error.message === 'Network Error' || error.message.includes('ECONNABORTED')) {
        throw new AppError(
          ErrorType.NETWORK_ERROR,
          'Network connection failed. Please check your internet connection.',
          0
        );
      }
    }

    // Fallback for unknown errors
    throw new AppError(
      ErrorType.UNKNOWN_ERROR,
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );
  }
}

/**
 * GET request
 */
export async function get<T = any>(
  url: string,
  config?: ApiClientConfig
): Promise<T> {
  return apiClient<T>(url, { ...config, method: 'GET' });
}

/**
 * POST request
 */
export async function post<T = any>(
  url: string,
  data?: any,
  config?: ApiClientConfig
): Promise<T> {
  return apiClient<T>(url, { ...config, method: 'POST', data });
}

/**
 * PUT request
 */
export async function put<T = any>(
  url: string,
  data?: any,
  config?: ApiClientConfig
): Promise<T> {
  return apiClient<T>(url, { ...config, method: 'PUT', data });
}

/**
 * PATCH request
 */
export async function patch<T = any>(
  url: string,
  data?: any,
  config?: ApiClientConfig
): Promise<T> {
  return apiClient<T>(url, { ...config, method: 'PATCH', data });
}

/**
 * DELETE request
 */
export async function del<T = any>(
  url: string,
  config?: ApiClientConfig
): Promise<T> {
  return apiClient<T>(url, { ...config, method: 'DELETE' });
}

/**
 * Set auth token
 */
export function setAuthToken(token: string | null) {
  initializeApiClient();
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Clear auth token
 */
export function clearAuthToken() {
  initializeApiClient();
  delete axiosInstance.defaults.headers.common['Authorization'];
  localStorage.removeItem(TOKEN_KEY);
}

export default {
  get,
  post,
  put,
  patch,
  del,
  apiClient,
  initializeApiClient,
  setAuthToken,
  clearAuthToken,
};
