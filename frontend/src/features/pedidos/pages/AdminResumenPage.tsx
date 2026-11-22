import { formatearPrecio } from "@/features/productos/utils";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import Skeleton from "@/shared/components/Skeleton";
import Card from "@/shared/ui/Card";
import { useResumenPedidos } from "../hooks/useResumenPedidos";

export default function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos();

  const tarjetas = data
    ? [
        { etiqueta: "Pendientes", valor: String(data.pendientes) },
        { etiqueta: "En preparación", valor: String(data.en_preparacion) },
        { etiqueta: "Entregados", valor: String(data.entregados) },
        { etiqueta: "Cancelados", valor: String(data.cancelados) },
        { etiqueta: "Pedidos de hoy", valor: String(data.pedidos_hoy) },
        { etiqueta: "Ingresos (entregados)", valor: formatearPrecio(data.ingresos_entregados) },
      ]
    : [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Resumen</h1>
      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tarjetas.map((t) => (
            <Card key={t.etiqueta} className="p-5">
              <p className="text-sm text-muted">{t.etiqueta}</p>
              <p className="mt-1 text-3xl font-bold">{t.valor}</p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
