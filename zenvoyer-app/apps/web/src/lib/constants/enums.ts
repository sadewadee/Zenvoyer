/**
 * Application Enums
 * Type-safe enums untuk semua pilihan tetap
 */

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERDUE = 'overdue',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  E_WALLET = 'e_wallet',
  CASH = 'cash',
}

export enum PaymentGateway {
  MIDTRANS = 'midtrans',
  XENDIT = 'xendit',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  SUB_USER = 'sub_user',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  IDR = 'IDR',
  AUD = 'AUD',
  CAD = 'CAD',
  SGD = 'SGD',
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

// Invoice status labels and colors
export const INVOICE_STATUS_CONFIG = {
  [InvoiceStatus.DRAFT]: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700',
    variant: 'secondary',
  },
  [InvoiceStatus.SENT]: {
    label: 'Sent',
    color: 'bg-blue-100 text-blue-700',
    variant: 'info',
  },
  [InvoiceStatus.VIEWED]: {
    label: 'Viewed',
    color: 'bg-purple-100 text-purple-700',
    variant: 'default',
  },
  [InvoiceStatus.PAID]: {
    label: 'Paid',
    color: 'bg-green-100 text-green-700',
    variant: 'success',
  },
  [InvoiceStatus.PARTIAL]: {
    label: 'Partial',
    color: 'bg-yellow-100 text-yellow-700',
    variant: 'warning',
  },
  [InvoiceStatus.OVERDUE]: {
    label: 'Overdue',
    color: 'bg-red-100 text-red-700',
    variant: 'destructive',
  },
} as const;

// Payment method labels
export const PAYMENT_METHOD_CONFIG = {
  [PaymentMethod.BANK_TRANSFER]: {
    label: 'Bank Transfer',
    icon: 'building-2',
  },
  [PaymentMethod.CREDIT_CARD]: {
    label: 'Credit Card',
    icon: 'credit-card',
  },
  [PaymentMethod.DEBIT_CARD]: {
    label: 'Debit Card',
    icon: 'credit-card',
  },
  [PaymentMethod.E_WALLET]: {
    label: 'E-Wallet',
    icon: 'wallet',
  },
  [PaymentMethod.CASH]: {
    label: 'Cash',
    icon: 'coins',
  },
} as const;

// Payment gateway labels
export const PAYMENT_GATEWAY_CONFIG = {
  [PaymentGateway.MIDTRANS]: {
    label: 'Midtrans',
    logo: '/logos/midtrans.png',
  },
  [PaymentGateway.XENDIT]: {
    label: 'Xendit',
    logo: '/logos/xendit.png',
  },
  [PaymentGateway.STRIPE]: {
    label: 'Stripe',
    logo: '/logos/stripe.png',
  },
  [PaymentGateway.PAYPAL]: {
    label: 'PayPal',
    logo: '/logos/paypal.png',
  },
} as const;
