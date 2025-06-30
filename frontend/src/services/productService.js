import api from './api';

// params puede incluir { page, search, category, ... }
export const getProducts = async (params = {}) => {
  const response = await api.get('/products/', { params });
  return response.data;  // assumed { results, count, next, previous }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error('Producto no encontrado');
    }
    throw err;
  }
};
