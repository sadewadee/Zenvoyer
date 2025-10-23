import { Controller, Post, Body, UseGuards, Get, Req, Patch, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, AuthResponseDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getCurrentUser(@Req() request: any) {
    return this.authService.getCurrentUser(request.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  async changePassword(@Req() request: any, @Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(request.user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async resendVerification(@Req() request: any) {
    return this.authService.resendVerificationEmail(request.user.id);
  }
}
