/**
 * Invoice API Services
 * Centralized functions untuk invoice-related API calls
 */

import { get, post, put, del } from '../client';
import { API_ENDPOINTS } from '../../constants';
import { InvoiceStatus, PaymentMethod } from '../../constants/enums';

export interface InvoiceItem {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
}

export interface CreateInvoicePayload {
  clientId: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  taxRate?: number;
  discountRate?: number;
  notes?: string;
  items: InvoiceItem[];
}

export interface UpdateInvoicePayload extends Partial<CreateInvoicePayload> {}

export interface RecordPaymentPayload {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

export interface UpdateInvoiceStatusPayload {
  status: InvoiceStatus;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: any;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  discountRate: number;
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalUnpaid: number;
  statusCounts: Record<string, number>;
}

export interface ShareResponse {
  shareToken: string;
  expiresAt: string;
  shareUrl: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  status?: InvoiceStatus;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const invoiceApi = {
  /**
   * Get all invoices with pagination and filters
   */
  getInvoices: (params?: PaginationParams) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.clientId) query.append('clientId', params.clientId);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);

    const url = query.toString() ? `${API_ENDPOINTS.INVOICES}?${query}` : API_ENDPOINTS.INVOICES;
    return get<Invoice[]>(url);
  },

  /**
   * Get single invoice
   */
  getInvoice: (id: string) =>
    get<Invoice>(API_ENDPOINTS.INVOICE_BY_ID(id)),

  /**
   * Create new invoice
   */
  createInvoice: (payload: CreateInvoicePayload) =>
    post<Invoice>(API_ENDPOINTS.INVOICES, payload),

  /**
   * Update invoice (draft only)
   */
  updateInvoice: (id: string, payload: UpdateInvoicePayload) =>
    put<Invoice>(API_ENDPOINTS.INVOICE_BY_ID(id), payload),

  /**
   * Delete invoice (draft only)
   */
  deleteInvoice: (id: string) =>
    del<{ message: string }>(API_ENDPOINTS.INVOICE_BY_ID(id)),

  /**
   * Send invoice
   */
  sendInvoice: (id: string) =>
    post<Invoice>(API_ENDPOINTS.INVOICE_SEND(id)),

  /**
   * Record payment for invoice
   */
  recordPayment: (id: string, payload: RecordPaymentPayload) =>
    post<Invoice>(API_ENDPOINTS.INVOICE_PAYMENTS(id), payload),

  /**
   * Update invoice status
   */
  updateStatus: (id: string, payload: UpdateInvoiceStatusPayload) =>
    put<Invoice>(API_ENDPOINTS.INVOICE_STATUS(id), payload),

  /**
   * Generate share link
   */
  generateShareLink: (id: string, expiresInDays?: number) =>
    post<ShareResponse>(API_ENDPOINTS.INVOICE_SHARE(id), { expiresInDays }),

  /**
   * Get invoice statistics
   */
  getStats: () =>
    get<InvoiceStats>(API_ENDPOINTS.INVOICE_STATS),

  /**
   * Get public invoice without auth
   */
  getPublicInvoice: (token: string) =>
    get<Invoice>(API_ENDPOINTS.INVOICE_PUBLIC(token)),
};

export default invoiceApi;
