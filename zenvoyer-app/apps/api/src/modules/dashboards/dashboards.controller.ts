import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardsService } from './dashboards.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../database/entities/user.entity';

@Controller('dashboards')
@UseGuards(AuthGuard('jwt'))
export class DashboardsController {
  constructor(private dashboardsService: DashboardsService) {}

  /**
   * Get user dashboard
   * Available to regular users and sub-users
   */
  @Get('user')
  async getUserDashboard(@Req() request: any) {
    return this.dashboardsService.getUserDashboard(request.user.id);
  }

  /**
   * Get admin dashboard
   * Available only to admin users
   */
  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async getAdminDashboard() {
    return this.dashboardsService.getAdminDashboard();
  }

  /**
   * Get super admin dashboard
   * Available only to super admin
   */
  @Get('super-admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getSuperAdminDashboard() {
    return this.dashboardsService.getSuperAdminDashboard();
  }
}
