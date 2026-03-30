import api from "./api";

export const getAdminMetrics = async () => {
  const response = await api.get("/admin/metrics/");
  return response.data;
};

export const getAdminProducts = async (params = {}) => {
  const response = await api.get("/admin/products/", { params });
  return response.data;
};

export const createAdminProduct = async (payload) => {
  const response = await api.post("/admin/products/", payload);
  return response.data;
};

export const updateAdminProduct = async (id, payload) => {
  const response = await api.patch(`/admin/products/${id}/`, payload);
  return response.data;
};

export const deleteAdminProduct = async (id) => {
  await api.delete(`/admin/products/${id}/`);
};

export const getAdminCategories = async () => {
  const response = await api.get("/admin/categories/");
  return response.data;
};

export const createAdminCategory = async (payload) => {
  const response = await api.post("/admin/categories/", payload);
  return response.data;
};

export const deleteAdminCategory = async (id) => {
  await api.delete(`/admin/categories/${id}/`);
};

export const getAdminOrders = async (params = {}) => {
  const response = await api.get("/admin/orders/", { params });
  return response.data;
};

export const updateAdminOrderStatus = async (id, status) => {
  const response = await api.patch(`/admin/orders/${id}/`, { status });
  return response.data;
};

export const getAdminPayments = async (params = {}) => {
  const response = await api.get("/admin/payments/", { params });
  return response.data;
};

export const updateAdminPaymentStatus = async (id, status) => {
  const response = await api.patch(`/admin/payments/${id}/`, { status });
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users/", { params });
  return response.data;
};

export const updateAdminUser = async (id, payload) => {
  const response = await api.patch(`/admin/users/${id}/`, payload);
  return response.data;
};

