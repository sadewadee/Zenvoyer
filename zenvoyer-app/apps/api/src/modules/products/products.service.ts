import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async getAllProducts(userId: string) {
    return this.productsRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getProductById(userId: string, productId: string) {
    const product = await this.productsRepository.findOne({
      where: { id: productId, userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Alias for import controller
  async create(userId: string, createProductDto: CreateProductDto) {
    return this.createProduct(userId, createProductDto);
  }

  async createProduct(userId: string, createProductDto: CreateProductDto) {
    const product = this.productsRepository.create({
      ...createProductDto,
      userId,
    });

    return this.productsRepository.save(product);
  }

  async updateProduct(
    userId: string,
    productId: string,
    updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsRepository.findOne({
      where: { id: productId, userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async deleteProduct(userId: string, productId: string) {
    const product = await this.productsRepository.findOne({
      where: { id: productId, userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.delete(productId);
    return { message: 'Product deleted successfully' };
  }
}
