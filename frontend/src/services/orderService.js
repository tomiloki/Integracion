// src/services/orderService.js
import api from './api';
import { emitCartUpdated } from '../utils/cartEvents';

export const createOrder = async () => {
  const response = await api.post('/orders/');
  emitCartUpdated();
  return response.data;
};

// Si decides exponer GET /api/orders/:id/ tras agregar el endpoint
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/`);
  return response.data;
};

