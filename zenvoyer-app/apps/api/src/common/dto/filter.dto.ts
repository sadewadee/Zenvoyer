import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceFilterDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by client ID' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Filter from date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter to date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Search by invoice number or client name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Minimum amount' })
  @IsOptional()
  @Type(() => Number)
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum amount' })
  @IsOptional()
  @Type(() => Number)
  maxAmount?: number;
}

export class ClientFilterDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by tags' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Filter active/inactive' })
  @IsOptional()
  isActive?: boolean;
}

export class ProductFilterDto {
  @ApiPropertyOptional({ description: 'Search by name or SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter active/inactive' })
  @IsOptional()
  isActive?: boolean;
}
