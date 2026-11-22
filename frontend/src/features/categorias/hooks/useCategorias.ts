import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError, notificarExito } from "@/shared/api/notificar";
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from "../api/categorias";
import type { CategoriaInput } from "../types/categoria";

const CATEGORIAS_KEY = ["categorias"] as const;

/** Listado de categorías activas (público). */
export function useCategorias() {
  return useQuery({ queryKey: CATEGORIAS_KEY, queryFn: getCategorias });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoriaInput) => createCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY });
      notificarExito("Categoría creada");
    },
    onError: notificarError,
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaInput }) => updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY });
      queryClient.invalidateQueries({ queryKey: ["productos"] }); // los productos muestran su categoría
      notificarExito("Categoría actualizada");
    },
    onError: notificarError,
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY });
      notificarExito("Categoría eliminada");
    },
    onError: notificarError,
  });
}
