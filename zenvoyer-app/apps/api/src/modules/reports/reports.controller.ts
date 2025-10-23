import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RequireSubscription } from '../../common/decorators';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('profit-loss')
  @UseGuards(SubscriptionGuard)
  @RequireSubscription('pro')
  @ApiOperation({ summary: 'Generate Profit & Loss Report (Pro only)' })
  @ApiQuery({ name: 'startDate', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2024-12-31' })
  async getProfitLossReport(
    @Req() request: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    return this.reportsService.generateProfitLossReport(request.user.id, start, end);
  }

  @Get('tax-summary')
  @UseGuards(SubscriptionGuard)
  @RequireSubscription('pro')
  @ApiOperation({ summary: 'Generate Tax Summary Report (Pro only)' })
  @ApiQuery({ name: 'startDate', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2024-12-31' })
  async getTaxSummary(
    @Req() request: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    return this.reportsService.generateTaxSummary(request.user.id, start, end);
  }

  @Get('client-revenue')
  @UseGuards(SubscriptionGuard)
  @RequireSubscription('pro')
  @ApiOperation({ summary: 'Generate Client Revenue Report (Pro only)' })
  async getClientRevenueReport(@Req() request: any) {
    return this.reportsService.generateClientRevenueReport(request.user.id);
  }

  @Get('revenue-trend')
  @ApiOperation({ summary: 'Generate Revenue Trend Report' })
  @ApiQuery({ name: 'startDate', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2024-12-31' })
  async getRevenueTrend(
    @Req() request: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    return this.reportsService.generateRevenueTrend(request.user.id, start, end);
  }
}
