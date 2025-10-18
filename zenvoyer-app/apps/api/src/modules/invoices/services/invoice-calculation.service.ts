import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoiceCalculationService {
  /**
   * Calculate invoice totals based on items, tax rate, and discount
   */
  calculateTotals(
    items: Array<{ quantity: number; unitPrice: number }>,
    taxRate: number = 0,
    discountRate: number = 0,
  ): {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
  } {
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    // Calculate tax on subtotal
    const taxAmount = (subtotal * taxRate) / 100;

    // Calculate discount on subtotal
    const discountAmount = (subtotal * discountRate) / 100;

    // Final total = subtotal + tax - discount
    const total = subtotal + taxAmount - discountAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Calculate profit margin (Pro feature)
   * profitMargin = total - costPrice
   * profitMarginPercentage = (profitMargin / costPrice) * 100
   */
  calculateProfitMargin(totalAmount: number, costPrice: number = 0): {
    profitMargin: number;
    profitMarginPercentage: number;
  } {
    if (costPrice === 0) {
      return { profitMargin: 0, profitMarginPercentage: 0 };
    }

    const profitMargin = totalAmount - costPrice;
    const profitMarginPercentage = (profitMargin / costPrice) * 100;

    return {
      profitMargin: Math.round(profitMargin * 100) / 100,
      profitMarginPercentage: Math.round(profitMarginPercentage * 100) / 100,
    };
  }

  /**
   * Calculate remaining amount due
   */
  calculateRemainingAmount(totalAmount: number, amountPaid: number): number {
    return Math.max(0, Math.round((totalAmount - amountPaid) * 100) / 100);
  }

  /**
   * Determine invoice status based on payment
   */
  determineInvoiceStatus(
    totalAmount: number,
    amountPaid: number,
    dueDate: Date,
  ): 'paid' | 'partial' | 'overdue' | 'draft' | 'sent' | 'viewed' {
    const remainingAmount = this.calculateRemainingAmount(totalAmount, amountPaid);

    if (remainingAmount === 0) {
      return 'paid';
    }

    if (amountPaid > 0 && remainingAmount > 0) {
      return 'partial';
    }

    if (dueDate < new Date() && remainingAmount > 0) {
      return 'overdue';
    }

    return 'sent';
  }

  /**
   * Validate invoice items
   */
  validateItems(items: any[]): boolean {
    if (!Array.isArray(items) || items.length === 0) {
      return false;
    }

    return items.every((item) => {
      return (
        item.quantity > 0 &&
        item.unitPrice >= 0 &&
        typeof item.description === 'string' &&
        item.description.trim().length > 0
      );
    });
  }
}
