import type { ReactNode } from "react";
import { formatearPrecio } from "@/features/productos/utils";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Card from "@/shared/ui/Card";
import type { Pedido } from "../types/pedido";
import PedidoDetalle from "./PedidoDetalle";

interface PedidoCardProps {
  pedido: Pedido;
  titulo?: string; // ej. el usuario en la vista admin
  acciones?: ReactNode;
}

export default function PedidoCard({ pedido, titulo, acciones }: PedidoCardProps) {
  return (
    <Card className="space-y-3 p-5" data-testid="pedido-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold">Pedido #{pedido.id}</h3>
          <p className="text-xs text-muted">
            {titulo ? `${titulo} · ` : ""}
            {new Date(pedido.created_at).toLocaleString("es-AR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BadgeEstado estado={pedido.estado} />
          <span className="text-lg font-bold">{formatearPrecio(pedido.total)}</span>
        </div>
      </div>
      <PedidoDetalle pedido={pedido} />
      {acciones && <div className="flex flex-wrap gap-2 pt-1">{acciones}</div>}
    </Card>
  );
}
