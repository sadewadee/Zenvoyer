/**
 * Invoice Detail Page
 */

'use client';

import React from 'react';
import { use } from 'react';
import { InvoiceDetail } from '@/components/features/invoice';

interface InvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function InvoicePage({ params }: InvoicePageProps) {
  const { id } = use(params);
  return <InvoiceDetail invoiceId={id} />;
}
