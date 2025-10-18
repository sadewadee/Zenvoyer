/**
 * Middleware untuk Auth Protection
 * Next.js middleware untuk protect routes
 */

import { type NextRequest, NextResponse } from 'next/server';
import { ROUTES } from './src/lib/constants';

/**
 * Routes yang tidak memerlukan authentication
 */
const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER, '/forgot-password'];

/**
 * Routes yang hanya untuk authenticated users
 */
const PROTECTED_ROUTES = [ROUTES.DASHBOARD, ROUTES.INVOICES, ROUTES.CLIENTS, ROUTES.PRODUCTS];

/**
 * Middleware untuk check auth
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('access_token')?.value;

  // Public routes - allow access
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Jika sudah login dan try akses login page, redirect ke dashboard
    if (token && pathname === ROUTES.LOGIN) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - check token
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Config untuk middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
