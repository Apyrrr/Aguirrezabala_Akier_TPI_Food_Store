import axios from "axios";
import { useAuthStore } from "@/store/authStore";

// Cliente HTTP único. VITE_API_URL incluye el prefijo /api/v1.
// withCredentials: el navegador envía y guarda la cookie HttpOnly con la sesión (el token nunca pasa por JavaScript).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true,
  timeout: 10000,
});

// 401 en estas rutas es parte de su funcionamiento normal (credenciales incorrectas, "¿hay sesión?")
const RUTAS_DE_AUTH = ["/auth/token", "/auth/me"];
const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: unknown }>(error)) {
      const status = error.response?.status;
      const url = error.config?.url ?? "";
      const sesionVencida = status === 401 && !RUTAS_DE_AUTH.some((ruta) => url.includes(ruta));
      const cuentaDesactivada = status === 400 && error.response?.data?.detail === CUENTA_DESACTIVADA;
      if (sesionVencida || cuentaDesactivada) {
        // Se limpia la sesión; ProtectedRoute redirige a /login al quedar sin usuario
        useAuthStore.getState().clearSession();
      }
    }
    return Promise.reject(error);
  },
);
