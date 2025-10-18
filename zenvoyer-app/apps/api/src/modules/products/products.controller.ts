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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async getAllProducts(@Req() request: any) {
    return this.productsService.getAllProducts(request.user.id);
  }

  @Get(':id')
  async getProductById(@Req() request: any, @Param('id') productId: string) {
    return this.productsService.getProductById(request.user.id, productId);
  }

  @Post()
  async createProduct(@Req() request: any, @Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(request.user.id, createProductDto);
  }

  @Put(':id')
  async updateProduct(
    @Req() request: any,
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(request.user.id, productId, updateProductDto);
  }

  @Delete(':id')
  async deleteProduct(@Req() request: any, @Param('id') productId: string) {
    return this.productsService.deleteProduct(request.user.id, productId);
  }
}
