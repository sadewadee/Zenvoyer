/**
 * Edit Client Page
 */

'use client';

import React from 'react';
import { use } from 'react';
import { ClientForm } from '@/components/features/client';

interface EditClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const { id } = use(params);
  return <ClientForm clientId={id} />;
}
