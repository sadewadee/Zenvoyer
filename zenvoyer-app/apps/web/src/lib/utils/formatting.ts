/**
 * Formatting Utilities
 * Reusable functions untuk format data di UI
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { DATE_FORMATS } from '../constants';

/**
 * Format currency dengan locale support
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number dengan thousand separator
 */
export function formatNumber(
  num: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Format date untuk display
 */
export function formatDate(date: string | Date, formatStr: string = DATE_FORMATS.DISPLAY): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format date relative (e.g., "2 hours ago")
 */
export function formatDateRelative(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format ISO date untuk input[type=date]
 */
export function formatDateForInput(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.ISO);
  } catch {
    return '';
  }
}

/**
 * Truncate text dengan ellipsis
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Simple formatting: +1 (234) 567-8900
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Capitalize string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert enum value to display text
 */
export function enumToLabel(value: string): string {
  return value
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

export const formatting = {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateRelative,
  formatDateForInput,
  truncateText,
  formatPhoneNumber,
  capitalize,
  enumToLabel,
};

export default formatting;
