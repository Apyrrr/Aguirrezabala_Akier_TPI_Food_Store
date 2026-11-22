import { api } from "@/shared/api/axiosInstance";
import type {
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  ProductoStockInput,
} from "../types/producto";

export const getProductos = (filtros: FiltrosProductos): Promise<ProductosPaginados> =>
  api
    .get<ProductosPaginados>("/productos", {
      params: {
        skip: (filtros.page - 1) * filtros.limit,
        limit: filtros.limit,
        search: filtros.search || undefined,
        categoria_id: filtros.categoriaId ?? undefined,
      },
    })
    .then((r) => r.data);

export const createProducto = (data: ProductoInput): Promise<Producto> =>
  api.post<Producto>("/productos", data).then((r) => r.data);

export const updateProducto = (id: number, data: ProductoInput): Promise<Producto> =>
  api.put<Producto>(`/productos/${id}`, data).then((r) => r.data);

export const updateStock = (id: number, data: ProductoStockInput): Promise<Producto> =>
  api.patch<Producto>(`/productos/${id}/stock`, data).then((r) => r.data);

export const deleteProducto = (id: number): Promise<void> =>
  api.delete(`/productos/${id}`).then(() => undefined);
