// frontend/src/services/api.js

import axios from 'axios';

// URL base de nuestra API Django
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Interceptor que agrega el header Authorization si hay un token en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
