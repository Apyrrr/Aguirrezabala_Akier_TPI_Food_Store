import { QueryClient } from "@tanstack/react-query";

// Instancia única de TanStack Query. Se vacía al iniciar o cerrar sesión para no mezclar datos de usuarios.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});
