/**
 * Client Validation Schemas
 * Zod schemas untuk client-related forms
 */

import { z } from 'zod';
import { Currency } from '../constants/enums';

const emailSchema = z.string().email('Invalid email address').trim().toLowerCase();
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Create client schema
export const createClientSchema = z.object({
  name: z
    .string()
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name must be at most 100 characters')
    .trim(),
  email: emailSchema,
  phoneNumber: z
    .string()
    .regex(phoneRegex, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(300, 'Address must be at most 300 characters')
    .optional()
    .or(z.literal('')),
  taxId: z
    .string()
    .max(50, 'Tax ID must be at most 50 characters')
    .optional()
    .or(z.literal('')),
  currency: z.nativeEnum(Currency).optional(),
  tags: z
    .array(z.string().max(50, 'Tag must be at most 50 characters'))
    .optional()
    .default([]),
  notes: z
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

// Update client schema (all fields optional)
export const updateClientSchema = createClientSchema.partial();

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// Import clients schema
export const importClientsSchema = z.object({
  clients: z
    .array(createClientSchema)
    .min(1, 'At least one client is required')
    .max(1000, 'Maximum 1000 clients can be imported at once'),
});

export type ImportClientsInput = z.infer<typeof importClientsSchema>;
