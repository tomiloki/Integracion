// src/services/api.js
import axios from 'axios';

export const API_URL= process.env.REACT_APP_API_URL;                // e.g. http://localhost:8000/api
const ACCESS_KEY= process.env.REACT_APP_TOKEN_KEY_ACCESS;       // llave para el access token en localStorage
const REFRESH_KEY= process.env.REACT_APP_TOKEN_KEY_REFRESH;      // llave para el refresh token en localStorage

// Crea la instancia base
const api = axios.create({
  baseURL: API_URL,
});

// ——————————————————————————————————————————————————————————————
// 1) Interceptor: añadir Authorization a cada petición
// ——————————————————————————————————————————————————————————————
api.interceptors.request.use(config => {
  const token = localStorage.getItem(ACCESS_KEY);
  console.log('🚀 Enviando token en header:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ——————————————————————————————————————————————————————————————
// 2) Interceptor: refrescar token al 401 y reintentar petición
// ——————————————————————————————————————————————————————————————
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem(REFRESH_KEY)
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        const { data } = await axios.post(
          // ruta de refresh en tu Django
          `${API_URL.replace('/api','')}/token/refresh/`,
          { refresh: refreshToken }
        );
        localStorage.setItem(ACCESS_KEY, data.access);
        api.defaults.headers.Authorization = `Bearer ${data.access}`;
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// ——————————————————————————————————————————————————————————————
// 3) Wrappers para Webpay REST
// ——————————————————————————————————————————————————————————————
export const webpayApi = {
  // Init → POST /api/webpay/init/ { order_id }
  init: (orderId) => api.post('/webpay/init/', { order_id: orderId }),

  // Commit → POST /api/webpay/commit/ { token_ws }
  commit: (tokenWs) => api.post('/webpay/commit/', { token_ws: tokenWs }),
};

export default api;
