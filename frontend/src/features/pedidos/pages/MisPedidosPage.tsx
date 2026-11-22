import { useState } from "react";
import { Link } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import Skeleton from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import PedidoCard from "../components/PedidoCard";
import { useCancelarPedido } from "../hooks/useCancelarPedido";
import { usePedidos } from "../hooks/usePedidos";

const LIMIT = 5;

export default function MisPedidosPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch } = usePedidos({ page, limit: LIMIT, estado: "" });
  const cancelar = useCancelarPedido();

  const confirmarCancelar = (id: number) => {
    if (window.confirm(`¿Cancelar el pedido #${id}?`)) cancelar.mutate(id);
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>

      {isPending && (
        <div className="space-y-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      )}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />}

      {data && data.items.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/">
              <Button>Ver el menú</Button>
            </Link>
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="space-y-4">
            {data.items.map((p) => (
              <PedidoCard
                key={p.id}
                pedido={p}
                acciones={
                  // Solo se puede cancelar mientras el pedido está en PENDIENTE
                  p.estado === "PENDIENTE" && (
                    <Button variant="danger" disabled={cancelar.isPending} onClick={() => confirmarCancelar(p.id)}>
                      Cancelar pedido
                    </Button>
                  )
                }
              />
            ))}
          </div>
          <Paginacion page={page} total={data.total} limit={LIMIT} onChange={setPage} />
        </>
      )}
    </section>
  );
}
