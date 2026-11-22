import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError, notificarExito } from "@/shared/api/notificar";
import { getUsuarios, setUsuarioActivo } from "../api/usuarios";

const USUARIOS_KEY = ["usuarios"] as const;

export function useUsuarios() {
  return useQuery({ queryKey: USUARIOS_KEY, queryFn: getUsuarios });
}

/** Activar y desactivar son idempotentes en el backend: responden 200 aunque el estado no cambie. */
export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) => setUsuarioActivo(id, activar),
    onSuccess: (_usuario, { activar }) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_KEY });
      notificarExito(activar ? "Usuario activado" : "Usuario desactivado");
    },
    onError: notificarError,
  });
}
