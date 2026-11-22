import { useNotificationStore } from "@/store/notificationStore";
import { handleApiError } from "./handleApiError";

/** onError común de las mutaciones: muestra el `detail` de la API como aviso de error. */
export function notificarError(error: unknown): void {
  useNotificationStore.getState().notificar(handleApiError(error), "error");
}

export function notificarExito(mensaje: string): void {
  useNotificationStore.getState().notificar(mensaje, "success");
}
