/**
 * Modal Component
 * Reusable modal dialog dengan consistent styling
 */

import React from 'react';
import { cn } from '../../lib/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeButton?: boolean;
}

/**
 * Modal backdrop
 */
const ModalBackdrop: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
      onClick={onClose}
    />
  );
};

/**
 * Modal component
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[size];

  return (
    <>
      <ModalBackdrop isOpen={isOpen} onClose={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={cn(
            'bg-white rounded-lg shadow-xl w-full animate-fade-in',
            sizeClass
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || closeButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
              {closeButton && (
                <button
                  onClick={onClose}
                  className="ml-auto text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
