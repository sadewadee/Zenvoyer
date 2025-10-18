/**
 * Protected Layout
 * Layout untuk authenticated pages dengan DashboardLayout
 */

'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
