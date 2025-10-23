import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { LimitGuard } from '../../common/guards/limit.guard';

@Controller('clients')
@UseGuards(AuthGuard('jwt'))
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  async getAllClients(@Req() request: any) {
    return this.clientsService.getAllClients(request.user.id);
  }

  @Get(':id')
  async getClientById(@Req() request: any, @Param('id') clientId: string) {
    return this.clientsService.getClientById(request.user.id, clientId);
  }

  @Post()
  @UseGuards(LimitGuard)
  async createClient(@Req() request: any, @Body() createClientDto: CreateClientDto) {
    // Check free plan limit: max 10 clients
    if (request.user.subscriptionPlan === 'free') {
      const count = await this.clientsService.getAllClients(request.user.id);
      if (count.length >= 10) {
        throw new ForbiddenException('Free plan limit: max 10 clients. Upgrade to Pro for unlimited.');
      }
    }
    return this.clientsService.createClient(request.user.id, createClientDto);
  }

  @Put(':id')
  async updateClient(
    @Req() request: any,
    @Param('id') clientId: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.updateClient(request.user.id, clientId, updateClientDto);
  }

  @Delete(':id')
  async deleteClient(@Req() request: any, @Param('id') clientId: string) {
    return this.clientsService.deleteClient(request.user.id, clientId);
  }

  @Post('import')
  async importClients(@Req() request: any, @Body('clients') clients: CreateClientDto[]) {
    return this.clientsService.importClients(request.user.id, clients);
  }
}
