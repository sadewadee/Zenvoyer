/**
 * Application Constants
 * Centralized constants untuk menghindari magic numbers/strings
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const API_TIMEOUT = 30000; // 30 seconds

// Auth
export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user';

// Subscription limits
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    MAX_CLIENTS: 10,
    MAX_PRODUCTS: 10,
    MAX_INVOICES: Infinity,
  },
  PRO: {
    MAX_CLIENTS: Infinity,
    MAX_PRODUCTS: Infinity,
    MAX_INVOICES: Infinity,
  },
} as const;

// Invoice defaults
export const INVOICE_DEFAULTS = {
  CURRENCY: 'USD',
  TAX_RATE: 0,
  DISCOUNT_RATE: 0,
  DEFAULT_PAYMENT_METHOD: 'bank_transfer',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  DEFAULT_OFFSET: 0,
  MAX_LIMIT: 100,
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  SUCCESS: 'Operation successful',
  ERROR: 'Something went wrong',
  LOADING: 'Please wait...',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  INVOICES: '/invoices',
  INVOICE_CREATE: '/invoices/create',
  INVOICE_EDIT: '/invoices/:id/edit',
  INVOICE_VIEW: '/invoices/:id',
  CLIENTS: '/clients',
  CLIENT_CREATE: '/clients/create',
  CLIENT_EDIT: '/clients/:id/edit',
  PRODUCTS: '/products',
  PRODUCT_CREATE: '/products/create',
  PRODUCT_EDIT: '/products/:id/edit',
  PAYMENTS: '/payments',
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',
  SECURITY: '/settings/security',
} as const;

// API Endpoints (relative paths)
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  AUTH_CHANGE_PASSWORD: '/auth/change-password',

  // Invoices
  INVOICES: '/invoices',
  INVOICE_BY_ID: (id: string) => `/invoices/${id}`,
  INVOICE_SEND: (id: string) => `/invoices/${id}/send`,
  INVOICE_PAYMENTS: (id: string) => `/invoices/${id}/payments`,
  INVOICE_STATUS: (id: string) => `/invoices/${id}/status`,
  INVOICE_SHARE: (id: string) => `/invoices/${id}/share`,
  INVOICE_STATS: '/invoices/stats/summary',
  INVOICE_PUBLIC: (token: string) => `/invoices/public/${token}`,

  // Clients
  CLIENTS: '/clients',
  CLIENT_BY_ID: (id: string) => `/clients/${id}`,
  CLIENTS_IMPORT: '/clients/import',

  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,

  // Dashboard
  DASHBOARD_USER: '/dashboards/user',
  DASHBOARD_ADMIN: '/dashboards/admin',
  DASHBOARD_SUPER_ADMIN: '/dashboards/super-admin',

  // Users
  USER_PROFILE: '/users/profile',
  USER_SUB_USERS: '/users/sub-users',
  USER_SUB_USERS_INVITE: '/users/sub-users/invite',
  USER_SUB_USERS_ACCEPT: '/users/sub-users/accept-invitation',
  USER_SUB_USERS_PERMISSIONS: (id: string) => `/users/sub-users/${id}/permissions`,
  USER_SUB_USERS_REMOVE: (id: string) => `/users/sub-users/${id}`,

  // Payments
  PAYMENT_GATEWAY_SETUP: '/payments/gateway/setup',
  PAYMENT_GATEWAY: (gateway: string) => `/payments/gateway/${gateway}`,
  PAYMENT_GATEWAY_LIST: '/payments/gateway/list',
  PAYMENT_INITIATE: '/payments/initiate',
  PAYMENT_VERIFY: '/payments/verify',
  PAYMENT_LINK: (invoiceId: string, gateway: string) => `/payments/link/${invoiceId}/${gateway}`,
  PAYMENT_HISTORY: (invoiceId: string) => `/payments/history/${invoiceId}`,

  // Admin
  ADMIN_USERS: '/admin/super/users',
  ADMIN_USER_BY_ID: (id: string) => `/admin/super/users/${id}`,
  ADMIN_USER_BAN: (id: string) => `/admin/super/users/${id}/ban`,
  ADMIN_ADMINS: '/admin/super/admins',
  ADMIN_STATISTICS: '/admin/super/statistics',
  ADMIN_ACTIVITY_LOGS: '/admin/super/activity-logs',
  ADMIN_HEALTH: '/admin/super/health',
} as const;
