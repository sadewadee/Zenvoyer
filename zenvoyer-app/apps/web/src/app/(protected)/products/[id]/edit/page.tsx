/**
 * Edit Product Page
 */

'use client';

import React from 'react';
import { use } from 'react';
import { ProductForm } from '@/components/features/product';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  return <ProductForm productId={id} />;
}
