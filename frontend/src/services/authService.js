// frontend/src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const registerUser = async ({ username, email, password, role }) => {
  try {
    await axios.post(`${API_URL}/register/`, {
      username,
      email,
      password,
      role,
    });
    return { success: true };
  } catch (err) {
    console.error('Register failed:', err);
    if (err.response && err.response.data) {
      // Aquí imprimimos en la consola los errores puntuales:
      console.error('Backend validation errors:', err.response.data);
      return { success: false, errors: err.response.data };
    }
    return { success: false, errors: { general: 'Error de conexión' } };
  }
};

export const loginUser = async ({ username, password }) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    return { success: true };
  } catch (err) {
    console.error('Login failed:', err);
    if (err.response && err.response.status === 401) {
      return { success: false, error: 'Usuario o contraseña incorrectos.' };
    }
    return { success: false, error: 'Error de conexión' };
  }
};
