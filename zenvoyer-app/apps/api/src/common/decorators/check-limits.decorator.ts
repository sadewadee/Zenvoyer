import { SetMetadata } from '@nestjs/common';

export const LIMIT_KEY = 'resourceLimit';

export interface ResourceLimit {
  resource: 'clients' | 'products' | 'invoices';
  free: number;
  pro: number;
}

export const CheckLimit = (limit: ResourceLimit) => SetMetadata(LIMIT_KEY, limit);
