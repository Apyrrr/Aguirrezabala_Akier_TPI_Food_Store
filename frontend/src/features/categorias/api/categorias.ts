import { api } from "@/shared/api/axiosInstance";
import type { Categoria, CategoriaInput } from "../types/categoria";

export const getCategorias = (): Promise<Categoria[]> =>
  api.get<Categoria[]>("/categorias").then((r) => r.data);

export const createCategoria = (data: CategoriaInput): Promise<Categoria> =>
  api.post<Categoria>("/categorias", data).then((r) => r.data);

export const updateCategoria = (id: number, data: CategoriaInput): Promise<Categoria> =>
  api.put<Categoria>(`/categorias/${id}`, data).then((r) => r.data);

export const deleteCategoria = (id: number): Promise<void> =>
  api.delete(`/categorias/${id}`).then(() => undefined);
