import React, { createContext, useState, useEffect, useContext } from 'react';
import { parseJwt } from '../utils/jwt';
// RENOMBRAMOS las importaciones para que coincidan con authService:
import { login as loginUser, register as serviceRegisterUser } from '../services/authService';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      const payload = parseJwt(token);
      if (payload?.exp * 1000 > Date.now()) {
        setUser({ username: payload.username, role: payload.role, sub: payload.sub });
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ username, password }) => {
    try {
      const result = await loginUser({ username, password });
      // Tu authService.login devuelve { access, refresh }
      if (result.access && result.refresh) {
        // El servicio ya guarda los tokens en localStorage
        const payload = parseJwt(result.access);
        setUser({ username: payload.username, role: payload.role, sub: payload.sub });
        setIsLoggedIn(true);
        return { success: true };
      }
      return { success: false, error: 'Respuesta inválida' };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || err.message };
    }
  };

  const register = async (data) => {
    try {
      const result = await serviceRegisterUser(data);
      // authService.register devuelve directamente datos o lanza excepción
      return { success: true };
    } catch (err) {
      return {
        success: false,
        errors: err.response?.data || {},
        error: err.response?.data?.detail || err.message,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    setIsLoggedIn(false);
  };

  if (loading) return <div>Cargando usuario…</div>;

  return (
    <AuthContext.Provider value={{ user, role: user?.role, isLoggedIn, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
