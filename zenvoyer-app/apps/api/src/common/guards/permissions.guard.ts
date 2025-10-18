import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PERMISSIONS_KEY } from '../decorators';
import { UserRole } from '../../database/entities/user.entity';
import { SubUserPermission } from '../../database/entities/sub-user-permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(SubUserPermission)
    private subUserPermissionRepository: Repository<SubUserPermission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super Admin and Admin have all permissions
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) {
      return true;
    }

    // Regular users have all permissions
    if (user.role === UserRole.USER) {
      return true;
    }

    // Sub-users need to check specific permissions
    if (user.role === UserRole.SUB_USER) {
      const permissions = await this.subUserPermissionRepository.findOne({
        where: { subUserId: user.id },
      });

      if (!permissions) {
        throw new ForbiddenException('No permissions assigned to this sub-user');
      }

      const hasPermission = requiredPermissions.every((permission) => {
        return permissions[permission] === true;
      });

      if (!hasPermission) {
        throw new ForbiddenException(
          `Sub-user does not have required permissions: ${requiredPermissions.join(', ')}`,
        );
      }

      return true;
    }

    throw new ForbiddenException('Insufficient permissions for this resource');
  }
}
