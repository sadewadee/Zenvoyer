/**
 * Product Validation Schemas
 * Zod schemas untuk product-related forms
 */

import { z } from 'zod';

// Create product schema
export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional()
    .or(z.literal('')),
  defaultPrice: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(999999999, 'Price is too large'),
  sku: z
    .string()
    .max(50, 'SKU must be at most 50 characters')
    .optional()
    .or(z.literal('')),
  category: z
    .string()
    .max(50, 'Category must be at most 50 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// Update product schema (all fields optional)
export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
