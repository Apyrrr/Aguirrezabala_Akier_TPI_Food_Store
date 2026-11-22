import axios from "axios";

interface ErrorDetail {
  msg?: string;
  loc?: (string | number)[];
}

/** Convierte el `detail` de una respuesta de error de la API en un mensaje para mostrar en pantalla. */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<{ detail?: string | ErrorDetail[] }>(error)) {
    if (!error.response) return "No se pudo conectar con el servidor.";
    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      // 422: lista de errores de validación del schema
      return detail.map((d) => d.msg ?? "Dato inválido").join(". ");
    }
    return `Error ${error.response.status}`;
  }
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}
