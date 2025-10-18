/**
 * Error Handling Utilities
 * Reusable fungsi untuk error handling yang konsisten
 */

import { AppError, ErrorType, ApiError } from '../../../types/error';
import { NotificationType } from '../constants/enums';

/**
 * Convert error to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof ApiError) {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return 'Please check your input and try again';
      case ErrorType.AUTHENTICATION:
        return 'Your session has expired. Please log in again';
      case ErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action';
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found';
      case ErrorType.CONFLICT:
        return 'This resource already exists';
      case ErrorType.SERVER_ERROR:
        return 'Server error. Please try again later';
      case ErrorType.NETWORK_ERROR:
        return 'Network error. Please check your internet connection';
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Get error notification type based on error type
 */
export function getErrorNotificationType(error: unknown): NotificationType {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ErrorType.VALIDATION:
      case ErrorType.CONFLICT:
        return NotificationType.WARNING;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return NotificationType.ERROR;
      case ErrorType.SERVER_ERROR:
      case ErrorType.NETWORK_ERROR:
        return NotificationType.ERROR;
      default:
        return NotificationType.ERROR;
    }
  }

  return NotificationType.ERROR;
}

/**
 * Handle validation errors
 */
export function extractValidationErrors(error: unknown): Record<string, string> {
  const errors: Record<string, string> = {};

  if (error instanceof ApiError) {
    if (error.details && Array.isArray(error.details)) {
      error.details.forEach((detail: any) => {
        if (detail.field && detail.message) {
          errors[detail.field] = detail.message;
        }
      });
    }
  }

  return errors;
}

/**
 * Determine if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.SERVER_ERROR:
        return true;
      case ErrorType.VALIDATION:
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
      case ErrorType.NOT_FOUND:
      case ErrorType.CONFLICT:
        return false;
      default:
        return false;
    }
  }

  return false;
}

/**
 * Safe try-catch wrapper
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  onError?: (error: unknown) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    onError?.(error);
    return null;
  }
}

/**
 * Get HTTP status code from error
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof ApiError) {
    return error.statusCode;
  }

  return 500;
}

/**
 * Check if error is specific type
 */
export function isErrorType(error: unknown, type: ErrorType): boolean {
  return error instanceof ApiError && error.type === type;
}

/**
 * Is auth error (401 atau 403)
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return (
      error.type === ErrorType.AUTHENTICATION ||
      error.type === ErrorType.AUTHORIZATION
    );
  }

  return false;
}

/**
 * Is validation error (400 atau 422)
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.type === ErrorType.VALIDATION;
  }

  return false;
}

/**
 * Format error message dengan details
 */
export function formatErrorWithDetails(error: unknown): {
  message: string;
  details?: Record<string, string>;
} {
  const message = getErrorMessage(error);
  const details = extractValidationErrors(error);

  return {
    message,
    ...(Object.keys(details).length > 0 && { details }),
  };
}

export const errorHandling = {
  getErrorMessage,
  getErrorNotificationType,
  extractValidationErrors,
  isRetryableError,
  tryCatch,
  getErrorStatusCode,
  isErrorType,
  isAuthError,
  isValidationError,
  formatErrorWithDetails,
};

export default errorHandling;
