import { ACCESS_KEY, REFRESH_KEY } from "../constants/auth";
import api from "./api";

export const register = async ({ username, email, password, role }) => {
  const response = await api.post("/register/", {
    username,
    email,
    password,
    role,
  });
  return response.data;
};

export const login = async ({ username, password }) => {
  const { data } = await api.post("/token/", { username, password });
  if (!data.access || !data.refresh) {
    throw new Error("Respuesta de autenticacion invalida");
  }

  localStorage.setItem(ACCESS_KEY, data.access);
  localStorage.setItem(REFRESH_KEY, data.refresh);
  return data;
};

export const logout = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

