import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificarError, notificarExito } from "@/shared/api/notificar";
import { cancelPedido } from "../api/pedidos";

/** Cliente: cancela un pedido propio en PENDIENTE (restituye el stock). */
export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelPedido(id),
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      notificarExito(`Pedido #${pedido.id} cancelado`);
    },
    onError: notificarError,
  });
}
