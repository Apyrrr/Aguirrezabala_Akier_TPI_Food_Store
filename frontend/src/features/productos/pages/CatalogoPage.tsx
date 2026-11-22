import { useEffect, useState } from "react";
import { useCategorias } from "@/features/categorias";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import Skeleton from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import Input, { inputClass } from "@/shared/ui/Input";
import ProductoCard from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const LIMIT = 8;

export default function CatalogoPage() {
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [search, setSearch] = useState(""); // valor con debounce que viaja a la API
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  const categorias = useCategorias();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProductos({
    page,
    limit: LIMIT,
    search,
    categoriaId,
  });

  // Espera 350 ms sin tipear antes de consultar al servidor
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch((prev) => {
        const nuevo = busqueda.trim();
        if (nuevo !== prev) setPage(1);
        return nuevo;
      });
    }, 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  const limpiar = () => {
    setBusqueda("");
    setSearch("");
    setCategoriaId(null);
    setPage(1);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuestro menú</h1>
        <p className="text-muted">Elegí tus favoritos y pedí en minutos.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          aria-label="Buscar productos"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          aria-label="Filtrar por categoría"
          className={`${inputClass} sm:max-w-xs`}
          value={categoriaId ?? ""}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : null);
            setPage(1);
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Cargando productos">
          {Array.from({ length: LIMIT }, (_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      )}

      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />}

      {data && data.items.length === 0 && (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion="Probá con otra búsqueda o categoría."
          accion={
            <Button variant="outline" onClick={limpiar}>
              Limpiar filtros
            </Button>
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isPlaceholderData ? "opacity-60" : ""}`}>
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion page={page} total={data.total} limit={LIMIT} onChange={setPage} />
        </>
      )}
    </section>
  );
}
