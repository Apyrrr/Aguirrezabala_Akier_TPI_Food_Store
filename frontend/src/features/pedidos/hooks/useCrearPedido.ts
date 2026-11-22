import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificarError, notificarExito } from "@/shared/api/notificar";
import { useCartStore } from "@/store/cartStore";
import { createPedido } from "../api/pedidos";
import type { PedidoInput } from "../types/pedido";

export function useCrearPedido() {
  const queryClient = useQueryClient();
  const vaciarCarrito = useCartStore((s) => s.vaciar);

  return useMutation({
    mutationFn: (data: PedidoInput) => createPedido(data),
    onSuccess: () => {
      vaciarCarrito();
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] }); // el stock cambió
      notificarExito("¡Pedido confirmado!");
    },
    onError: notificarError,
  });
}
