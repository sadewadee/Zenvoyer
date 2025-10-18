/**
 * Invoice Validation Schemas
 * Zod schemas untuk invoice-related forms
 */

import { z } from 'zod';
import { InvoiceStatus, PaymentMethod, Currency } from '../constants/enums';

// Invoice item schema
export const invoiceItemSchema = z.object({
  productId: z.string().uuid().optional(),
  description: z
    .string()
    .min(1, 'Product description is required')
    .max(500, 'Description must be at most 500 characters'),
  quantity: z
    .number()
    .min(0.01, 'Quantity must be greater than 0')
    .max(999999, 'Quantity is too large'),
  unitPrice: z
    .number()
    .min(0, 'Unit price cannot be negative')
    .max(999999999, 'Unit price is too large'),
  discount: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(999999, 'Discount is too large')
    .optional()
    .default(0),
  tax: z
    .number()
    .min(0, 'Tax cannot be negative')
    .max(999999, 'Tax is too large')
    .optional()
    .default(0),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

// Create invoice schema
export const createInvoiceSchema = z
  .object({
    clientId: z.string().uuid('Please select a valid client'),
    invoiceDate: z.coerce.date().refine((date) => date <= new Date(), {
      message: 'Invoice date cannot be in the future',
    }),
    dueDate: z.coerce.date(),
    currency: z.nativeEnum(Currency).default(Currency.USD),
    taxRate: z
      .number()
      .min(0, 'Tax rate cannot be negative')
      .max(100, 'Tax rate cannot exceed 100%')
      .optional()
      .default(0),
    discountRate: z
      .number()
      .min(0, 'Discount rate cannot be negative')
      .max(100, 'Discount rate cannot exceed 100%')
      .optional()
      .default(0),
    notes: z
      .string()
      .max(1000, 'Notes must be at most 1000 characters')
      .optional()
      .or(z.literal('')),
    items: z
      .array(invoiceItemSchema)
      .min(1, 'Add at least one invoice item'),
  })
  .refine((data) => data.dueDate >= data.invoiceDate, {
    message: 'Due date must be on or after invoice date',
    path: ['dueDate'],
  });

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

// Update invoice schema (same as create but optional)
export const updateInvoiceSchema = createInvoiceSchema.partial();

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

// Record payment schema
export const recordPaymentSchema = z.object({
  amount: z
    .number()
    .min(0.01, 'Amount must be greater than 0')
    .max(999999999, 'Amount is too large'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionId: z
    .string()
    .max(100, 'Transaction ID is too long')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

// Share invoice schema
export const shareInvoiceSchema = z.object({
  expiresInDays: z
    .number()
    .min(1, 'Expiration must be at least 1 day')
    .max(365, 'Expiration cannot exceed 365 days')
    .optional(),
});

export type ShareInvoiceInput = z.infer<typeof shareInvoiceSchema>;
