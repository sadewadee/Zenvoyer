import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../database/entities/user.entity';
import { AdminActivityLog, ActivityAction } from '../database/entities/admin-activity-log.entity';
import { CreateAdminDto, BanUserDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AdminActivityLog)
    private activityLogRepository: Repository<AdminActivityLog>,
  ) {}

  // SUPER ADMIN ENDPOINTS

  async getAllUsers() {
    return this.usersRepository.find({
      where: { role: UserRole.USER },
      select: ['id', 'email', 'firstName', 'lastName', 'subscriptionPlan', 'isBanned', 'createdAt'],
    });
  }

  async getUserById(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'subscriptionPlan', 'isBanned', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async banUser(superAdminId: string, userId: string, banUserDto: BanUserDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isBanned = true;
    user.banReason = banUserDto.reason || 'No reason provided';
    await this.usersRepository.save(user);

    // Log activity
    await this.logActivity(superAdminId, userId, ActivityAction.USER_BANNED, {
      reason: banUserDto.reason,
    });

    return user;
  }

  async unbanUser(superAdminId: string, userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isBanned = false;
    user.banReason = null;
    await this.usersRepository.save(user);

    // Log activity
    await this.logActivity(superAdminId, userId, ActivityAction.USER_UNBANNED);

    return user;
  }

  async deleteUser(superAdminId: string, userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.delete(userId);

    // Log activity
    await this.logActivity(superAdminId, userId, ActivityAction.USER_DELETED);

    return { message: 'User deleted successfully' };
  }

  async createAdmin(superAdminId: string, createAdminDto: CreateAdminDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).substring(7);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const admin = this.usersRepository.create({
      email: createAdminDto.email,
      firstName: createAdminDto.firstName,
      lastName: createAdminDto.lastName,
      phoneNumber: createAdminDto.phoneNumber,
      password: hashedPassword,
      role: UserRole.ADMIN,
      subscriptionPlan: 'pro',
      subscriptionActive: true,
    });

    const savedAdmin = await this.usersRepository.save(admin);

    // Log activity
    await this.logActivity(superAdminId, savedAdmin.id, ActivityAction.ADMIN_CREATED);

    return {
      ...savedAdmin,
      tempPassword,
      message: 'Admin created successfully. In production, a secure password email would be sent.',
    };
  }

  async getAllAdmins() {
    return this.usersRepository.find({
      where: { role: UserRole.ADMIN },
      select: ['id', 'email', 'firstName', 'lastName', 'createdAt'],
    });
  }

  async deleteAdmin(superAdminId: string, adminId: string) {
    const admin = await this.usersRepository.findOne({
      where: { id: adminId, role: UserRole.ADMIN },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.usersRepository.delete(adminId);

    // Log activity
    await this.logActivity(superAdminId, adminId, ActivityAction.ADMIN_DELETED);

    return { message: 'Admin deleted successfully' };
  }

  async getSystemStatistics() {
    const totalUsers = await this.usersRepository.count({ where: { role: UserRole.USER } });
    const totalAdmins = await this.usersRepository.count({ where: { role: UserRole.ADMIN } });
    const bannedUsers = await this.usersRepository.count({
      where: { isBanned: true, role: UserRole.USER },
    });
    const proUsers = await this.usersRepository.count({
      where: { subscriptionPlan: 'pro', role: UserRole.USER },
    });

    return {
      totalUsers,
      totalAdmins,
      bannedUsers,
      proUsers,
      freeUsers: totalUsers - proUsers,
    };
  }

  async getActivityLogs(limit: number = 100, offset: number = 0) {
    const [logs, total] = await this.activityLogRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { logs, total };
  }

  async logActivity(
    adminId: string,
    targetUserId: string | null,
    action: ActivityAction,
    metadata?: any,
  ) {
    const log = this.activityLogRepository.create({
      adminId,
      targetUserId,
      action,
      metadata,
    });

    await this.activityLogRepository.save(log);
  }
}
