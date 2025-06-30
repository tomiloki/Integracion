import api from './api';

const ACCESS_KEY = process.env.REACT_APP_TOKEN_KEY_ACCESS;
const REFRESH_KEY = process.env.REACT_APP_TOKEN_KEY_REFRESH;

export const register = async ({ username, email, password, role }) => {
  // Opcional: podrías autologin aquí llamando a login()
  const response = await api.post('/register/', { username, email, password, role });
  return response.data;
};

export const login = async ({ username, password }) => {
  const { data } = await api.post('/token/', { username, password });
  if (data.access && data.refresh) {
    localStorage.setItem(process.env.REACT_APP_TOKEN_KEY_ACCESS, data.access);
    localStorage.setItem(process.env.REACT_APP_TOKEN_KEY_REFRESH, data.refresh);
    return data;
  }
  throw new Error('Respuesta de login inválida');
};

export const logout = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  // Aquí podrías notificar al context o redux
};
