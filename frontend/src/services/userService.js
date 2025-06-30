// src/services/userService.js
import api from './api';

export async function getUserProfile() {
  const res = await api.get('/users/me/');
  return res.data;
}

export async function getUserOrders() {
  const res = await api.get('/orders/user/');
  return res.data;
}
