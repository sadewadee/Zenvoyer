/**
 * Edit Client Page
 */

'use client';

import React from 'react';
import { ClientForm } from '@/components/features/client';

interface EditClientPageProps {
  params: {
    id: string;
  };
}

export default function EditClientPage({ params }: EditClientPageProps) {
  return <ClientForm clientId={params.id} />;
}
