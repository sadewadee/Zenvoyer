/**
 * Not Found Page (404)
 * Custom 404 error page
 */

'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600">404</h1>
          <div className="text-6xl mb-4">📄</div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Login
          </Link>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact support at{' '}
            <a 
              href="mailto:support@zenvoyer.com" 
              className="text-blue-600 hover:underline"
            >
              support@zenvoyer.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
