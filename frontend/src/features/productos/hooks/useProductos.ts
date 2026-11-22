import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError, notificarExito } from "@/shared/api/notificar";
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
  updateStock,
} from "../api/productos";
import type { FiltrosProductos, ProductoInput, ProductoStockInput } from "../types/producto";

/** Listado paginado en el servidor. La queryKey incluye los filtros: cada combinación tiene su caché. */
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData, // mantiene la página anterior visible mientras llega la siguiente
  });
}

function useInvalidarProductos() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["productos"] });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (data: ProductoInput) => createProducto(data),
    onSuccess: () => {
      invalidar();
      notificarExito("Producto creado");
    },
    onError: notificarError,
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoInput }) => updateProducto(id, data),
    onSuccess: () => {
      invalidar();
      notificarExito("Producto actualizado");
    },
    onError: notificarError,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoStockInput }) => updateStock(id, data),
    onSuccess: () => {
      invalidar();
      notificarExito("Stock actualizado");
    },
    onError: notificarError,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      invalidar();
      notificarExito("Producto eliminado");
    },
    onError: notificarError,
  });
}
