/**
 * Edit Product Page
 */

'use client';

import React from 'react';
import { ProductForm } from '@/components/features/product';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return <ProductForm productId={params.id} />;
}
