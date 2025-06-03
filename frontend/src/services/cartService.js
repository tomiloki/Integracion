// frontend/src/services/cartService.js

import api from './api'; // Instancia de Axios que incluye baseURL y token

/**
 * GET  /api/cart/
 * Retorna un array de objetos { id, product: {...}, quantity, subtotal }
 */
export const getCart = async () => {
  try {
    const response = await api.get('/api/cart/');
    return response.data; // Arreglo de CartItemSerializer
  } catch (err) {
    console.error('Error al obtener carrito:', err.response || err);
    throw err;
  }
};

/**
 * POST /api/cart/
 * Agrega un producto al carrito. 
 * Body: { product_id: <int>, quantity: <int> }
 * Retorna el CartItem recién creado o actualizado.
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post('/api/cart/', {
      product_id: productId,
      quantity,
    });
    return response.data;
  } catch (err) {
    console.error('Error al agregar al carrito:', err.response || err);
    throw err;
  }
};

/**
 * PATCH /api/cart/<cartItemId>/
 * Actualiza la cantidad de un ítem existente en el carrito.
 * Body: { quantity: <int> }
 */
export const updateCartItem = async (cartItemId, newQuantity) => {
  try {
    const response = await api.patch(`/api/cart/${cartItemId}/`, {
      quantity: newQuantity,
    });
    return response.data;
  } catch (err) {
    console.error('Error al actualizar ítem en carrito:', err.response || err);
    throw err;
  }
};

/**
 * DELETE /api/cart/<cartItemId>/
 * Elimina un ítem del carrito
 */
export const removeCartItem = async (cartItemId) => {
  try {
    await api.delete(`/api/cart/${cartItemId}/`);
    return true;
  } catch (err) {
    console.error('Error al eliminar ítem del carrito:', err.response || err);
    throw err;
  }
};
