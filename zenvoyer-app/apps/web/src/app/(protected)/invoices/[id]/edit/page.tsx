/**
 * Edit Invoice Page
 */

'use client';

import React from 'react';
import { use } from 'react';
import { InvoiceForm } from '@/components/features/invoice';

interface EditInvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = use(params);
  return <InvoiceForm invoiceId={id} />;
}
