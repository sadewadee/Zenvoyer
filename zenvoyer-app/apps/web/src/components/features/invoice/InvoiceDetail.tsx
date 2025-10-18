/**
 * Invoice Detail Component
 * Display detailed invoice dengan payment dan action options
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';

import { useApi, useApiMutation } from '@/lib/hooks/useApi';
import { invoiceApi } from '@/lib/api/services/invoice';
import { useUIStore } from '@/lib/store/ui';
import { NotificationType } from '@/lib/constants/enums';
import { InvoiceStatus } from '@/lib/constants/enums';

import {
  Button,
  StatusBadge,
  LoadingSpinner,
  Modal,
} from '@/components/shared';

interface InvoiceDetailProps {
  invoiceId: string;
}

/**
 * Payment form modal component
 */
const RecordPaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  remainingAmount: number;
}> = ({ isOpen, onClose, invoiceId, remainingAmount }) => {
  const [amount, setAmount] = useState(remainingAmount);
  const { addNotification } = useUIStore();

  const mutation = useApiMutation(
    (data) => invoiceApi.recordPayment(invoiceId, data)
  );

  const handleSubmit = () => {
    mutation.mutate(
      {
        amount,
        paymentMethod: 'bank_transfer' as any,
      },
      {
        onSuccess: () => {
          addNotification({
            type: NotificationType.SUCCESS,
            message: 'Payment recorded!',
            duration: 3000,
          });
          onClose();
        },
        onError: (error: any) => {
          addNotification({
            type: NotificationType.ERROR,
            message: error?.message || 'Failed to record payment',
            duration: 5000,
          });
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            disabled={mutation.isPending}
            onClick={handleSubmit}
          >
            Record Payment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            max={remainingAmount}
          />
          <p className="text-sm text-gray-600 mt-1">
            Remaining: {remainingAmount.toFixed(2)}
          </p>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Invoice detail component
 */
export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoiceId }) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { addNotification } = useUIStore();

  // Fetch invoice
  const { data: invoice, isLoading, refetch } = useApi(
    ['invoice', invoiceId],
    () => invoiceApi.getInvoice(invoiceId)
  );

  // Send invoice mutation
  const sendMutation = useApiMutation(() => invoiceApi.sendInvoice(invoiceId));

  // Share invoice mutation
  const shareMutation = useApiMutation(() =>
    invoiceApi.generateShareLink(invoiceId)
  );

  /**
   * Handle send invoice
   */
  const handleSendInvoice = () => {
    sendMutation.mutate(undefined, {
      onSuccess: () => {
        addNotification({
          type: NotificationType.SUCCESS,
          message: 'Invoice sent!',
          duration: 3000,
        });
        refetch();
      },
      onError: (error: any) => {
        addNotification({
          type: NotificationType.ERROR,
          message: error?.message || 'Failed to send invoice',
          duration: 5000,
        });
      },
    });
  };

  /**
   * Handle share invoice
   */
  const handleShareInvoice = () => {
    shareMutation.mutate(undefined, {
      onSuccess: (data: any) => {
        // Copy link to clipboard
        navigator.clipboard.writeText(data.shareUrl);
        addNotification({
          type: NotificationType.SUCCESS,
          message: 'Share link copied to clipboard!',
          duration: 3000,
        });
      },
      onError: (error: any) => {
        addNotification({
          type: NotificationType.ERROR,
          message: error?.message || 'Failed to generate share link',
          duration: 5000,
        });
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading invoice..." />;
  }

  if (!invoice) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Invoice not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Invoice {invoice.invoiceNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
          </p>
        </div>
        <StatusBadge status={invoice.status} size="lg" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill To</h2>
            <div>
              <p className="font-medium text-gray-900">{invoice.client?.name}</p>
              <p className="text-gray-600">{invoice.client?.email}</p>
              {invoice.client?.address && (
                <p className="text-gray-600">{invoice.client.address}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {invoice.currency} {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 font-medium">
                      {invoice.currency}{' '}
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-medium">
                {invoice.currency} {invoice.subtotal.toFixed(2)}
              </span>
            </div>
            {invoice.totalDiscount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Discount:</span>
                <span className="font-medium">
                  -{invoice.currency} {invoice.totalDiscount.toFixed(2)}
                </span>
              </div>
            )}
            {invoice.totalTax > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Tax:</span>
                <span className="font-medium">
                  +{invoice.currency} {invoice.totalTax.toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-3 flex justify-between text-gray-900 font-semibold text-lg">
              <span>Total:</span>
              <span>
                {invoice.currency} {invoice.grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Payment Info */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="flex justify-between text-gray-700 mb-2">
                <span>Paid:</span>
                <span className="font-medium">
                  {invoice.currency} {invoice.paidAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Remaining:</span>
                <span className="font-medium">
                  {invoice.currency} {invoice.remainingAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {invoice.status === InvoiceStatus.DRAFT && (
              <Button fullWidth variant="primary">
                Edit Invoice
              </Button>
            )}

            {invoice.status !== InvoiceStatus.SENT &&
              invoice.status !== InvoiceStatus.VIEWED && (
                <Button
                  fullWidth
                  variant="secondary"
                  loading={sendMutation.isPending}
                  disabled={sendMutation.isPending}
                  onClick={handleSendInvoice}
                >
                  Send Invoice
                </Button>
              )}

            {invoice.remainingAmount > 0 && (
              <Button
                fullWidth
                variant="secondary"
                onClick={() => setPaymentModalOpen(true)}
              >
                Record Payment
              </Button>
            )}

            <Button
              fullWidth
              variant="secondary"
              loading={shareMutation.isPending}
              disabled={shareMutation.isPending}
              onClick={handleShareInvoice}
            >
              Share Link
            </Button>
          </div>

          {/* Due Date */}
          {invoice.dueDate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Due Date:</strong>{' '}
                {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <RecordPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoiceId={invoiceId}
        remainingAmount={invoice.remainingAmount}
      />
    </div>
  );
};

export default InvoiceDetail;
