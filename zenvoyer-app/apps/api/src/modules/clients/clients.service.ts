import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../database/entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async getAllClients(userId: string) {
    return this.clientsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getClientById(userId: string, clientId: string) {
    const client = await this.clientsRepository.findOne({
      where: { id: clientId, userId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async createClient(userId: string, createClientDto: CreateClientDto) {
    const client = this.clientsRepository.create({
      ...createClientDto,
      userId,
    });

    return this.clientsRepository.save(client);
  }

  async updateClient(
    userId: string,
    clientId: string,
    updateClientDto: UpdateClientDto,
  ) {
    const client = await this.clientsRepository.findOne({
      where: { id: clientId, userId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    Object.assign(client, updateClientDto);
    return this.clientsRepository.save(client);
  }

  async deleteClient(userId: string, clientId: string) {
    const client = await this.clientsRepository.findOne({
      where: { id: clientId, userId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    await this.clientsRepository.delete(clientId);
    return { message: 'Client deleted successfully' };
  }

  async importClients(userId: string, clients: CreateClientDto[]) {
    const createdClients = clients.map((clientData) =>
      this.clientsRepository.create({
        ...clientData,
        userId,
      }),
    );

    return this.clientsRepository.save(createdClients);
  }
}
