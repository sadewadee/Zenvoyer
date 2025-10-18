import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../database/entities/user.entity';
import { SubUserPermission } from '../database/entities/sub-user-permission.entity';
import {
  InviteSubUserDto,
  UpdateSubUserPermissionsDto,
  AcceptInvitationDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(SubUserPermission)
    private subUserPermissionRepository: Repository<SubUserPermission>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getSubUsers(userId: string) {
    const subUsers = await this.usersRepository.find({
      where: { parentUserId: userId },
    });

    // Fetch permissions for each sub-user
    const subUsersWithPermissions = await Promise.all(
      subUsers.map(async (subUser) => {
        const permissions = await this.subUserPermissionRepository.findOne({
          where: { subUserId: subUser.id },
        });
        const { password, ...userWithoutPassword } = subUser;
        return { ...userWithoutPassword, permissions };
      }),
    );

    return subUsersWithPermissions;
  }

  async inviteSubUser(userId: string, inviteSubUserDto: InviteSubUserDto) {
    const parentUser = await this.usersRepository.findOne({ where: { id: userId } });
    if (!parentUser) {
      throw new NotFoundException('Parent user not found');
    }

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: inviteSubUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if parent user can add sub-users (Pro feature if needed)
    const invitationToken = uuidv4();

    // Create sub-user with temporary password
    const subUser = this.usersRepository.create({
      email: inviteSubUserDto.email,
      firstName: inviteSubUserDto.firstName,
      lastName: inviteSubUserDto.lastName,
      phoneNumber: inviteSubUserDto.phoneNumber,
      role: UserRole.SUB_USER,
      parentUserId: userId,
      password: await bcrypt.hash(invitationToken, 10), // Temporary password
      emailVerificationToken: invitationToken,
    });

    const savedSubUser = await this.usersRepository.save(subUser);

    // Create permissions
    const permissions = this.subUserPermissionRepository.create({
      subUserId: savedSubUser.id,
      canViewInvoices: true,
      canCreateInvoice: false,
      canEditInvoice: false,
      canDeleteInvoice: false,
      canManageClients: false,
      canManageProducts: false,
      canViewReports: false,
      canEditSettings: false,
      ...inviteSubUserDto.permissions,
    });

    await this.subUserPermissionRepository.save(permissions);

    // In production, send email with invitation link
    return {
      id: savedSubUser.id,
      email: savedSubUser.email,
      invitationToken,
      message: 'Sub-user invited successfully. In production, an email would be sent.',
    };
  }

  async acceptInvitation(acceptInvitationDto: AcceptInvitationDto) {
    const { token, password, confirmPassword } = acceptInvitationDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const subUser = await this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!subUser) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (subUser.emailVerified) {
      throw new BadRequestException('This invitation has already been accepted');
    }

    subUser.password = await bcrypt.hash(password, 10);
    subUser.emailVerified = true;
    subUser.emailVerificationToken = null;

    await this.usersRepository.save(subUser);

    return { message: 'Invitation accepted successfully' };
  }

  async updateSubUserPermissions(
    userId: string,
    subUserId: string,
    updatePermissionsDto: UpdateSubUserPermissionsDto,
  ) {
    // Verify that the sub-user belongs to the parent user
    const subUser = await this.usersRepository.findOne({
      where: { id: subUserId },
    });

    if (!subUser || subUser.parentUserId !== userId) {
      throw new ForbiddenException('You do not have permission to update this sub-user');
    }

    const permissions = await this.subUserPermissionRepository.findOne({
      where: { subUserId },
    });

    if (!permissions) {
      throw new NotFoundException('Sub-user permissions not found');
    }

    Object.assign(permissions, updatePermissionsDto);
    await this.subUserPermissionRepository.save(permissions);

    return permissions;
  }

  async removeSubUser(userId: string, subUserId: string) {
    const subUser = await this.usersRepository.findOne({
      where: { id: subUserId },
    });

    if (!subUser || subUser.parentUserId !== userId) {
      throw new ForbiddenException('You do not have permission to remove this sub-user');
    }

    // Delete permissions first
    await this.subUserPermissionRepository.delete({ subUserId });

    // Delete the sub-user
    await this.usersRepository.delete(subUserId);

    return { message: 'Sub-user removed successfully' };
  }
}
