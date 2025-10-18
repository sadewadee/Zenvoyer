/**
 * Class Name Utility
 * Helper untuk merge Tailwind classes dengan consistent handling
 */

import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names dengan support untuk conditional classes
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export default cn;
