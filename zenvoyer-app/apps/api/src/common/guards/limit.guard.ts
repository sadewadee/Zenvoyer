import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LIMIT_KEY, ResourceLimit } from '../decorators/check-limits.decorator';
import { Client } from '../../database/entities/client.entity';
import { Product } from '../../database/entities/product.entity';
import { Invoice } from '../../database/entities/invoice.entity';

@Injectable()
export class LimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limit = this.reflector.getAllAndOverride<ResourceLimit>(LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!limit) {
      return true; // No limit check needed
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Pro users have no limits
    if (user.subscriptionPlan === 'pro') {
      return true;
    }

    // Check free plan limits
    const maxAllowed = limit.free;
    let currentCount = 0;

    switch (limit.resource) {
      case 'clients':
        currentCount = await this.clientRepository.count({
          where: { userId: user.id },
        });
        break;
      case 'products':
        currentCount = await this.productRepository.count({
          where: { userId: user.id },
        });
        break;
      case 'invoices':
        currentCount = await this.invoiceRepository.count({
          where: { userId: user.id },
        });
        break;
    }

    if (currentCount >= maxAllowed) {
      throw new ForbiddenException(
        `Free plan limit reached (${maxAllowed} ${limit.resource}). Upgrade to Pro for unlimited access.`,
      );
    }

    return true;
  }
}
