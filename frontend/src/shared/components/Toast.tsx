import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

const estilos = { success: "bg-green-600", error: "bg-red-600", info: "bg-stone-700" } as const;

// Se monta una vez en App.tsx y se oculta solo a los 4 segundos
export default function Toast() {
  const { mensaje, tipo, visible, ocultar } = useNotificationStore();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(ocultar, 4000);
    return () => clearTimeout(timer);
  }, [visible, mensaje, ocultar]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="toast"
      className={`fixed right-4 bottom-4 z-[60] max-w-sm rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${estilos[tipo]}`}
    >
      {mensaje}
    </div>
  );
}
