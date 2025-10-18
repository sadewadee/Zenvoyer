/**
 * Invoice Store (Zustand)
 * Global state untuk invoice drafts dan cache
 */

import { create } from 'zustand';
import { CreateInvoiceInput } from '../validations/invoice.schema';
import { Invoice } from '../api/services/invoice';

export interface InvoiceDraft extends Partial<CreateInvoiceInput> {
  id: string;
  lastModified: number;
}

export interface InvoiceState {
  // Drafts
  drafts: Record<string, InvoiceDraft>;
  saveDraft: (draft: InvoiceDraft) => void;
  deleteDraft: (id: string) => void;
  getDraft: (id: string) => InvoiceDraft | undefined;
  clearDrafts: () => void;

  // Current viewing invoice
  currentInvoice: Invoice | null;
  setCurrentInvoice: (invoice: Invoice | null) => void;

  // Filters
  statusFilter: string[];
  dateRangeFilter: { from?: string; to?: string };
  setStatusFilter: (statuses: string[]) => void;
  setDateRangeFilter: (range: { from?: string; to?: string }) => void;
  clearFilters: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  // Drafts
  drafts: {},

  saveDraft: (draft) =>
    set((state) => ({
      drafts: {
        ...state.drafts,
        [draft.id]: {
          ...draft,
          lastModified: Date.now(),
        },
      },
    })),

  deleteDraft: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.drafts;
      return { drafts: rest };
    }),

  getDraft: (id) => get().drafts[id],

  clearDrafts: () =>
    set({
      drafts: {},
    }),

  // Current invoice
  currentInvoice: null,

  setCurrentInvoice: (invoice) =>
    set({
      currentInvoice: invoice,
    }),

  // Filters
  statusFilter: [],
  dateRangeFilter: {},

  setStatusFilter: (statuses) =>
    set({
      statusFilter: statuses,
    }),

  setDateRangeFilter: (range) =>
    set({
      dateRangeFilter: range,
    }),

  clearFilters: () =>
    set({
      statusFilter: [],
      dateRangeFilter: {},
    }),
}));

export default useInvoiceStore;
