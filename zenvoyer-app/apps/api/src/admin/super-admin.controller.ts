import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators';
import { UserRole } from '../database/entities/user.entity';
import { CreateAdminDto, BanUserDto } from './dto/admin.dto';

@Controller('admin/super')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private adminService: AdminService) {}

  // User management
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Post('users/:id/ban')
  async banUser(
    @Req() request: any,
    @Param('id') userId: string,
    @Body() banUserDto: BanUserDto,
  ) {
    return this.adminService.banUser(request.user.id, userId, banUserDto);
  }

  @Post('users/:id/unban')
  async unbanUser(@Req() request: any, @Param('id') userId: string) {
    return this.adminService.unbanUser(request.user.id, userId);
  }

  @Delete('users/:id')
  async deleteUser(@Req() request: any, @Param('id') userId: string) {
    return this.adminService.deleteUser(request.user.id, userId);
  }

  // Admin management
  @Post('admins')
  async createAdmin(@Req() request: any, @Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(request.user.id, createAdminDto);
  }

  @Get('admins')
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Delete('admins/:id')
  async deleteAdmin(@Req() request: any, @Param('id') adminId: string) {
    return this.adminService.deleteAdmin(request.user.id, adminId);
  }

  // Statistics & Reports
  @Get('statistics')
  async getSystemStatistics() {
    return this.adminService.getSystemStatistics();
  }

  @Get('activity-logs')
  async getActivityLogs() {
    return this.adminService.getActivityLogs();
  }

  @Get('health')
  async getSystemHealth() {
    return {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
    };
  }
}
