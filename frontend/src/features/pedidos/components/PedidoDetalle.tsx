import { formatearPrecio } from "@/features/productos/utils";
import type { Pedido } from "../types/pedido";

// Líneas del pedido tal como se guardaron: nombre y precio de ese momento (RN-05)
export default function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-2 text-sm">
      <ul className="divide-y divide-stone-100">
        {pedido.items.map((l) => (
          <li key={l.producto_id} className="flex justify-between py-1.5">
            <span>
              {l.cantidad} × {l.nombre_producto}{" "}
              <span className="text-muted">({formatearPrecio(l.precio_unitario)})</span>
            </span>
            <span className="font-medium">{formatearPrecio(l.subtotal)}</span>
          </li>
        ))}
      </ul>
      <p className="text-muted">
        Entrega: {pedido.direccion_entrega} · Pago: {pedido.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
      </p>
      {pedido.notas && <p className="text-muted">Notas: {pedido.notas}</p>}
    </div>
  );
}
