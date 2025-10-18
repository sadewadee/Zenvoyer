/**
 * ErrorBoundary Component
 * React Error Boundary untuk catch component errors
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { getErrorMessage } from '../../lib/api/utils/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Call callback if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-700 text-sm mb-4">
            {getErrorMessage(this.state.error)}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-red-600 mt-2">
              <summary className="cursor-pointer font-semibold mb-2">
                Error details (Development only)
              </summary>
              <pre className="bg-red-100 p-3 rounded overflow-auto">
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
