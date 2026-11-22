import axios from "axios";
import { api } from "@/shared/api/axiosInstance";
import type { LoginCredentials, RegisterData, UserPublic } from "../types/auth";

// OAuth2 password flow: formulario application/x-www-form-urlencoded. El servidor responde con la cookie HttpOnly.
export async function requestLogin({ username, password }: LoginCredentials): Promise<void> {
  await api.post("/auth/token", new URLSearchParams({ username, password }));
}

// 401 = sin sesión válida; 400 = cuenta desactivada. En ambos casos se interpreta como "no hay sesión".
export async function requestMe(): Promise<UserPublic | null> {
  try {
    const { data } = await api.get<UserPublic>("/auth/me");
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && [400, 401].includes(error.response?.status ?? 0)) return null;
    throw error;
  }
}

export async function requestLogout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function requestRegister(data: RegisterData): Promise<UserPublic> {
  const response = await api.post<UserPublic>("/auth/register", data);
  return response.data;
}
