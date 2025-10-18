/**
 * Edit Invoice Page
 */

'use client';

import React from 'react';
import { InvoiceForm } from '@/components/features/invoice';

interface EditInvoicePageProps {
  params: {
    id: string;
  };
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  return <InvoiceForm invoiceId={params.id} />;
}
