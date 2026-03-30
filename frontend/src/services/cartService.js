// src/services/cartService.js
import api from './api';
import { emitCartUpdated } from '../utils/cartEvents';

export const getCartItems = async () => {
  const response = await api.get('/cart/');
  return response.data?.results ?? response.data ?? [];
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post('/cart/', { product_id: productId, quantity });
    emitCartUpdated();
    return response.data;
  } catch (err) {
    // Maneja error 400 de stock insuficiente
    if (err.response?.status === 400) {
      throw new Error(err.response.data.detail || 'Error al agregar al carrito.');
    }
    throw err;
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  const response = await api.patch(`/cart/${cartItemId}/`, { quantity });
  emitCartUpdated();
  return response.data;
};

export const removeCartItem = async (cartItemId) => {
  await api.delete(`/cart/${cartItemId}/`);
  emitCartUpdated();
};

