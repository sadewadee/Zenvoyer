import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../database/entities/user.entity';
import { LoginDto, RegisterDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, confirmPassword, firstName, lastName, phoneNumber } = registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      role: UserRole.USER,
      subscriptionPlan: 'free',
      subscriptionActive: true,
      subscriptionStartDate: new Date(),
    });

    await this.usersRepository.save(user);

    const accessToken = this.generateAccessToken(user);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException(`Account is banned. Reason: ${user.banReason || 'No reason provided'}`);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    const accessToken = this.generateAccessToken(user);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      accessToken,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

  async getCurrentUser(userId: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionActive: user.subscriptionActive,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string; token?: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If email exists, password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiration (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await this.usersRepository.save(user);

    // TODO: Send email with reset link
    // In development, return token for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return {
      message: 'If email exists, password reset link has been sent',
      ...(isDevelopment && { token: resetToken }), // Only in dev
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Hash the token to match database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersRepository.findOne({
      where: { passwordResetToken: hashedToken },
    });

    if (!user || !user.passwordResetExpires) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is expired
    if (user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Update password and clear reset token
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.usersRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    const { token } = verifyEmailDto;

    const user = await this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    await this.usersRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(userId: string): Promise<{ message: string; token?: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    await this.usersRepository.save(user);

    // TODO: Send verification email
    const isDevelopment = process.env.NODE_ENV === 'development';

    return {
      message: 'Verification email sent',
      ...(isDevelopment && { token: verificationToken }), // Only in dev
    };
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
