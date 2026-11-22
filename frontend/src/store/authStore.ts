import { create } from "zustand";
import { persist } from "zustand/middleware";
import { requestLogin, requestLogout, requestMe } from "@/features/auth/api/auth";
import type { LoginCredentials, UserPublic, UsuarioSesion } from "@/features/auth/types/auth";
import { handleApiError } from "@/shared/api/handleApiError";
import { queryClient } from "@/shared/api/queryClient";

interface AuthState {
  usuario: UsuarioSesion | null;
  cargando: boolean; // true mientras checkSession confirma la sesión con el servidor
  login: (credenciales: LoginCredentials) => Promise<void>; // lanza Error con el mensaje de la API si falla
  logout: () => Promise<void>;
  checkSession: () => Promise<void>; // GET /auth/me con la cookie
  clearSession: () => void; // lo usa el interceptor de Axios
}

const aUsuarioSesion = (u: UserPublic): UsuarioSesion => ({
  id: u.id,
  username: u.username,
  nombre: u.full_name,
  email: u.email,
  rol: u.role,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (credenciales) => {
        try {
          await requestLogin(credenciales);
          const me = await requestMe();
          if (!me) throw new Error("No se pudo iniciar la sesión");
          queryClient.clear(); // no mostrar datos en caché de otra sesión
          set({ usuario: aUsuarioSesion(me) });
        } catch (error) {
          throw new Error(handleApiError(error));
        }
      },

      logout: async () => {
        try {
          await requestLogout(); // el servidor borra la cookie
        } finally {
          queryClient.clear();
          set({ usuario: null });
        }
      },

      checkSession: async () => {
        try {
          const me = await requestMe();
          set({ usuario: me ? aUsuarioSesion(me) : null, cargando: false });
        } catch {
          set({ usuario: null, cargando: false }); // backend caído o error de red
        }
      },

      clearSession: () => {
        queryClient.clear();
        set({ usuario: null });
      },
    }),
    {
      name: "auth-storage",
      // Solo se guarda el usuario (nombre, email y rol), nunca el token ni el estado de carga
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
