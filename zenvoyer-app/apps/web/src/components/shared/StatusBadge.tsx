/**
 * StatusBadge Component
 * Reusable component untuk menampilkan invoice/payment status
 */

import React from 'react';
import { INVOICE_STATUS_CONFIG, PAYMENT_METHOD_CONFIG } from '../../lib/constants/enums';
import { cn } from '../../lib/utils/cn';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'status' | 'method';
}

/**
 * Status badge dengan consistent styling
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
  variant = 'status',
}) => {
  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }[size];

  const config =
    variant === 'status'
      ? (INVOICE_STATUS_CONFIG as any)[status]
      : (PAYMENT_METHOD_CONFIG as any)[status];

  if (!config) {
    return null;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold whitespace-nowrap',
        config.color,
        sizeClass,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
