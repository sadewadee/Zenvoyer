import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class BanUserDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateSupportTicketDto {
  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsString()
  category: string;
}

export class RespondToTicketDto {
  @IsString()
  response: string;
}

export class AssignTicketDto {
  @IsString()
  adminId: string;
}
