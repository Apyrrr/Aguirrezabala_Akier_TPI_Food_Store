import { api } from "@/shared/api/axiosInstance";
import type {
  EstadoPedido,
  Pedido,
  PedidoInput,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido";

export interface FiltrosPedidos {
  page: number;
  limit: number;
  estado: EstadoPedido | "";
}

export const getPedidos = (filtros: FiltrosPedidos): Promise<PedidosPaginados> =>
  api
    .get<PedidosPaginados>("/pedidos", {
      params: {
        skip: (filtros.page - 1) * filtros.limit,
        limit: filtros.limit,
        estado: filtros.estado || undefined,
      },
    })
    .then((r) => r.data);

export const createPedido = (data: PedidoInput): Promise<Pedido> =>
  api.post<Pedido>("/pedidos", data).then((r) => r.data);

export const changeEstado = (id: number, estado: EstadoPedido): Promise<Pedido> =>
  api.patch<Pedido>(`/pedidos/${id}/estado`, { estado }).then((r) => r.data);

export const cancelPedido = (id: number): Promise<Pedido> =>
  api.patch<Pedido>(`/pedidos/${id}/cancelar`).then((r) => r.data);

export const getResumen = (): Promise<ResumenPedidos> =>
  api.get<ResumenPedidos>("/pedidos/resumen").then((r) => r.data);
