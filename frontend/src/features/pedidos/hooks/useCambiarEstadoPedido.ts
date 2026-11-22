import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificarError, notificarExito } from "@/shared/api/notificar";
import { changeEstado } from "../api/pedidos";
import type { EstadoPedido } from "../types/pedido";

/** Admin: avanza o cancela un pedido según la máquina de estados. Cancelar restituye el stock. */
export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => changeEstado(id, estado),
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      notificarExito(`Pedido #${pedido.id}: ${pedido.estado.replace("_", " ").toLowerCase()}`);
    },
    onError: notificarError,
  });
}
