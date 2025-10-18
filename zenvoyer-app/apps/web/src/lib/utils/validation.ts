/**
 * Validation Utilities
 * Helper functions untuk validate data
 */

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number (basic)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate currency amount
 */
export function isValidAmount(amount: any): boolean {
  return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(percent: any): boolean {
  return typeof percent === 'number' && !isNaN(percent) && percent >= 0 && percent <= 100;
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate;
}

/**
 * Validate UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Check if email exists in array
 */
export function emailExists(email: string, emails: string[]): boolean {
  return emails.some((e) => e.toLowerCase() === email.toLowerCase());
}

/**
 * Check if string is not empty
 */
export function isNotEmpty(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if array is not empty
 */
export function isArrayNotEmpty(arr: any): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Check if object has required keys
 */
export function hasRequiredKeys<T>(obj: any, keys: (keyof T)[]): obj is T {
  return keys.every((key) => key in obj && obj[key] !== undefined && obj[key] !== null);
}

/**
 * Validate object structure
 */
export function validateStructure<T>(
  obj: any,
  schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'array' | 'object'>
): obj is T {
  return Object.entries(schema).every(([key, type]) => {
    const value = obj[key];
    if (value === undefined || value === null) return false;

    if (type === 'array') return Array.isArray(value);
    if (type === 'object') return typeof value === 'object' && !Array.isArray(value);
    return typeof value === type;
  });
}

export const validation = {
  isValidEmail,
  isValidUrl,
  isValidPhoneNumber,
  isValidAmount,
  isValidPercentage,
  isValidDateRange,
  isValidUUID,
  emailExists,
  isNotEmpty,
  isArrayNotEmpty,
  hasRequiredKeys,
  validateStructure,
};

export default validation;
