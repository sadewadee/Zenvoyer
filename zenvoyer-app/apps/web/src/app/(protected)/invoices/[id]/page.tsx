/**
 * Invoice Detail Page
 */

'use client';

import React from 'react';
import { InvoiceDetail } from '@/components/features/invoice';

interface InvoicePageProps {
  params: {
    id: string;
  };
}

export default function InvoicePage({ params }: InvoicePageProps) {
  return <InvoiceDetail invoiceId={params.id} />;
}
