/**
 * Product API Services
 * Centralized functions untuk product-related API calls
 */

import { get, post, put, del } from '../client';
import { API_ENDPOINTS } from '../../constants';

export interface CreateProductPayload {
  name: string;
  description?: string;
  defaultPrice: number;
  sku?: string;
  category?: string;
  notes?: string;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface Product {
  id: string;
  name: string;
  description?: string;
  defaultPrice: number;
  sku?: string;
  category?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const productApi = {
  /**
   * Get all products
   */
  getProducts: () =>
    get<Product[]>(API_ENDPOINTS.PRODUCTS),

  /**
   * Get single product
   */
  getProduct: (id: string) =>
    get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id)),

  /**
   * Create new product
   */
  createProduct: (payload: CreateProductPayload) =>
    post<Product>(API_ENDPOINTS.PRODUCTS, payload),

  /**
   * Update product
   */
  updateProduct: (id: string, payload: UpdateProductPayload) =>
    put<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id), payload),

  /**
   * Delete product
   */
  deleteProduct: (id: string) =>
    del<{ message: string }>(API_ENDPOINTS.PRODUCT_BY_ID(id)),
};

export default productApi;
