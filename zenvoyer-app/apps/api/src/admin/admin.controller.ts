import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators';
import { UserRole } from '../database/entities/user.entity';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return {
      message: 'Admin dashboard',
      stats: {
        openTickets: 0,
        resolvedTickets: 0,
        activeUsers: 0,
      },
    };
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('activity-logs')
  async getActivityLogs() {
    return this.adminService.getActivityLogs();
  }

  @Post('support-tickets')
  async createSupportTicket(@Req() request: any) {
    return {
      message: 'Support ticket created',
      ticketId: '123',
    };
  }

  @Get('support-tickets')
  async getSupportTickets() {
    return [];
  }
}
