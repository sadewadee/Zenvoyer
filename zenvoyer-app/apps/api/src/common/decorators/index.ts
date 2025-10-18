import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../database/entities/user.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const SUBSCRIPTION_KEY = 'subscriptionPlan';

export const RequireSubscription = (...plans: string[]) =>
  SetMetadata(SUBSCRIPTION_KEY, plans);
