/**
 * useInvoiceCalculation Hook
 * Hook untuk calculate invoice totals (reusable logic)
 */

import { useMemo } from 'react';

export interface InvoiceItem {
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
}

export interface CalculationResult {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
}

/**
 * Calculate invoice totals
 */
function calculateTotals(items: InvoiceItem[]): CalculationResult {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const totalDiscount = items.reduce(
    (sum, item) => sum + (item.discount || 0),
    0
  );

  const totalTax = items.reduce(
    (sum, item) => sum + (item.tax || 0),
    0
  );

  const grandTotal = subtotal - totalDiscount + totalTax;

  return {
    subtotal,
    totalDiscount,
    totalTax,
    grandTotal: Math.max(0, grandTotal), // Ensure tidak negative
  };
}

/**
 * Hook untuk invoice calculation dengan memoization
 */
export function useInvoiceCalculation(items: InvoiceItem[]) {
  return useMemo(() => calculateTotals(items), [items]);
}

/**
 * Calculate single item subtotal
 */
export function calculateItemSubtotal(
  quantity: number,
  unitPrice: number,
  discount?: number,
  tax?: number
): number {
  const subtotal = quantity * unitPrice;
  const discounted = subtotal - (discount || 0);
  const total = discounted + (tax || 0);
  return Math.max(0, total);
}

/**
 * Apply percentage discount
 */
export function applyPercentageDiscount(amount: number, percentage: number): number {
  return amount - (amount * percentage) / 100;
}

/**
 * Apply percentage tax
 */
export function applyPercentageTax(amount: number, percentage: number): number {
  return amount + (amount * percentage) / 100;
}

export default useInvoiceCalculation;
