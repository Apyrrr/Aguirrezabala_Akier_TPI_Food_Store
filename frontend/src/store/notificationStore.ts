import { create } from "zustand";

export type TipoNotificacion = "success" | "error" | "info";

interface NotificationState {
  mensaje: string;
  tipo: TipoNotificacion;
  visible: boolean;
  notificar: (mensaje: string, tipo?: TipoNotificacion) => void;
  ocultar: () => void;
}

// Avisos al usuario (pedido creado, error de una mutación, etc.). No se persiste.
export const useNotificationStore = create<NotificationState>()((set) => ({
  mensaje: "",
  tipo: "info",
  visible: false,
  notificar: (mensaje, tipo = "success") => set({ mensaje, tipo, visible: true }),
  ocultar: () => set({ visible: false }),
}));
