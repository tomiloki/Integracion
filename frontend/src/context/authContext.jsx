import React, { createContext, useContext, useEffect, useState } from "react";

import { ACCESS_KEY, REFRESH_KEY } from "../constants/auth";
import { parseJwt } from "../utils/jwt";
import {
  login as loginUser,
  logout as logoutUser,
  register as serviceRegisterUser,
} from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function buildUserFromToken(token) {
  const payload = parseJwt(token);
  if (!payload) return null;

  return {
    username: payload.username || payload.user_name || "usuario",
    role: payload.role || "customer",
    sub: payload.sub || payload.user_id,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    const payload = parseJwt(token);
    if (payload?.exp && payload.exp * 1000 > Date.now()) {
      setUser(buildUserFromToken(token));
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
    setLoading(false);
  }, []);

  const login = async ({ username, password }) => {
    try {
      const result = await loginUser({ username, password });
      const nextUser = buildUserFromToken(result.access);
      setUser(nextUser);
      setIsLoggedIn(true);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || err.message,
      };
    }
  };

  const register = async (data) => {
    try {
      await serviceRegisterUser(data);
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
    logoutUser();
    setUser(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div className="center-container">Cargando usuario...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role, isLoggedIn, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

