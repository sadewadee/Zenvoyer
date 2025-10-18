import { IsEmail, IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateUserDto {
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

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class InviteSubUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];
}

export class UpdateSubUserPermissionsDto {
  @IsBoolean()
  canViewInvoices: boolean;

  @IsBoolean()
  canCreateInvoice: boolean;

  @IsBoolean()
  canEditInvoice: boolean;

  @IsBoolean()
  canDeleteInvoice: boolean;

  @IsBoolean()
  canManageClients: boolean;

  @IsBoolean()
  canManageProducts: boolean;

  @IsBoolean()
  canViewReports: boolean;

  @IsBoolean()
  canEditSettings: boolean;
}

export class AcceptInvitationDto {
  @IsString()
  token: string;

  @IsString()
  password: string;

  @IsString()
  confirmPassword: string;
}
