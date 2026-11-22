import { useState } from "react";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import Skeleton from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import { inputClass } from "@/shared/ui/Input";
import PedidoCard from "../components/PedidoCard";
import { useCambiarEstadoPedido } from "../hooks/useCambiarEstadoPedido";
import { usePedidos } from "../hooks/usePedidos";
import { ESTADOS, TRANSICIONES } from "../types/pedido";
import type { EstadoPedido } from "../types/pedido";

const LIMIT = 6;

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "Pasar a preparación",
  ENTREGADO: "Marcar entregado",
  CANCELADO: "Cancelar pedido",
};

export default function AdminPedidosPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<EstadoPedido | "">("");
  const { data, isPending, isError, error, refetch } = usePedidos({ page, limit: LIMIT, estado });
  const cambiar = useCambiarEstadoPedido();

  const aplicar = (id: number, nuevo: EstadoPedido) => {
    if (nuevo === "CANCELADO" && !window.confirm(`¿Cancelar el pedido #${id}? Se restituye el stock.`)) return;
    cambiar.mutate({ id, estado: nuevo });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select
          aria-label="Filtrar por estado"
          className={`${inputClass} sm:max-w-xs`}
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as EstadoPedido | "");
            setPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {isPending && (
        <div className="space-y-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      )}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />}
      {data && data.items.length === 0 && <EstadoVacio titulo="No hay pedidos para mostrar" />}

      {data && data.items.length > 0 && (
        <>
          <div className="space-y-4">
            {data.items.map((p) => (
              <PedidoCard
                key={p.id}
                pedido={p}
                titulo={`Usuario #${p.usuario_id}`}
                acciones={TRANSICIONES[p.estado].map((siguiente) => (
                  <Button
                    key={siguiente}
                    variant={siguiente === "CANCELADO" ? "danger" : "primary"}
                    disabled={cambiar.isPending}
                    onClick={() => aplicar(p.id, siguiente)}
                  >
                    {ETIQUETA_ACCION[siguiente]}
                  </Button>
                ))}
              />
            ))}
          </div>
          <Paginacion page={page} total={data.total} limit={LIMIT} onChange={setPage} />
        </>
      )}
    </section>
  );
}
