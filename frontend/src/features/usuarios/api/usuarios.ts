import { api } from "@/shared/api/axiosInstance";
import type { Usuario } from "../types/usuario";

export const getUsuarios = (): Promise<Usuario[]> =>
  api.get<Usuario[]>("/admin/usuarios").then((r) => r.data);

export const setUsuarioActivo = (id: number, activar: boolean): Promise<Usuario> =>
  api.post<Usuario>(`/admin/usuarios/${id}/${activar ? "activar" : "desactivar"}`).then((r) => r.data);
