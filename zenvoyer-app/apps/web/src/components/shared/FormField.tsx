/**
 * FormField Component
 * Reusable form field dengan consistent error handling
 */

import React from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '../../lib/utils/cn';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

/**
 * Form field dengan label, error handling, dan consistent styling
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</div>}

          <input
            ref={ref}
            className={cn(
              'w-full px-3 py-2 border rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-500 font-medium">{error.message}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
