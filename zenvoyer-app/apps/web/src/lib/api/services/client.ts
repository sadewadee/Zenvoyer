/**
 * Client API Services
 * Centralized functions untuk client-related API calls
 */

import { get, post, put, del } from '../client';
import { API_ENDPOINTS } from '../../constants';

export interface CreateClientPayload {
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  taxId?: string;
  currency?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {}

export interface Client {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  taxId?: string;
  currency?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportClientsPayload {
  clients: CreateClientPayload[];
}

export const clientApi = {
  /**
   * Get all clients
   */
  getClients: () =>
    get<Client[]>(API_ENDPOINTS.CLIENTS),

  /**
   * Get single client
   */
  getClient: (id: string) =>
    get<Client>(API_ENDPOINTS.CLIENT_BY_ID(id)),

  /**
   * Create new client
   */
  createClient: (payload: CreateClientPayload) =>
    post<Client>(API_ENDPOINTS.CLIENTS, payload),

  /**
   * Update client
   */
  updateClient: (id: string, payload: UpdateClientPayload) =>
    put<Client>(API_ENDPOINTS.CLIENT_BY_ID(id), payload),

  /**
   * Delete client
   */
  deleteClient: (id: string) =>
    del<{ message: string }>(API_ENDPOINTS.CLIENT_BY_ID(id)),

  /**
   * Import multiple clients
   */
  importClients: (payload: ImportClientsPayload) =>
    post<Client[]>(API_ENDPOINTS.CLIENTS_IMPORT, payload),
};

export default clientApi;
