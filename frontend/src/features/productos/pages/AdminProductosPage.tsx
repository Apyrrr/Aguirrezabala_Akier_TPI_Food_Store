import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { useCategorias } from "@/features/categorias";
import { handleApiError } from "@/shared/api/handleApiError";
import DataTable from "@/shared/components/DataTable";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Skeleton from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";
import ProductoForm from "../components/ProductoForm";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "../hooks/useProductos";
import type { Producto, ProductoInput } from "../types/producto";
import { formatearPrecio } from "../utils";

const columnHelper = createColumnHelper<Producto>();

export default function AdminProductosPage() {
  // El admin trae un lote amplio y TanStack Table ordena y pagina del lado del cliente
  const { data, isPending, isError, error, refetch } = useProductos({ page: 1, limit: 100, search: "", categoriaId: null });
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const abrirAlta = () => {
    setEditando(null);
    crear.reset();
    setModalAbierto(true);
  };
  const abrirEdicion = (p: Producto) => {
    setEditando(p);
    actualizar.reset();
    setModalAbierto(true);
  };
  const cerrar = () => setModalAbierto(false);

  const guardar = (valores: ProductoInput) => {
    if (editando) actualizar.mutate({ id: editando.id, data: valores }, { onSuccess: cerrar });
    else crear.mutate(valores, { onSuccess: cerrar });
  };

  const ajustarStock = (p: Producto) => {
    const texto = window.prompt(`Nuevo stock para "${p.nombre}"`, String(p.stock));
    if (texto === null) return;
    const stock = Number(texto);
    if (!Number.isInteger(stock) || stock < 0) {
      window.alert("El stock debe ser un entero mayor o igual a 0");
      return;
    }
    actualizarStock.mutate({ id: p.id, data: { stock, disponible: p.disponible } });
  };

  const alternarDisponible = (p: Producto) =>
    actualizarStock.mutate({ id: p.id, data: { stock: p.stock, disponible: !p.disponible } });

  const confirmarEliminar = (p: Producto) => {
    if (window.confirm(`¿Eliminar el producto "${p.nombre}"?`)) eliminar.mutate(p.id);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre", { header: "Nombre" }),
      columnHelper.accessor((p) => p.categoria.nombre, { id: "categoria", header: "Categoría" }),
      columnHelper.accessor("precio_base", { header: "Precio", cell: (i) => formatearPrecio(i.getValue()) }),
      columnHelper.accessor("stock", { header: "Stock" }),
      columnHelper.accessor("disponible", {
        header: "Disponible",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => alternarDisponible(row.original)}
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              row.original.disponible ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"
            }`}
            title="Cambiar disponibilidad"
          >
            {row.original.disponible ? "Sí" : "No"}
          </button>
        ),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="px-3 py-1" onClick={() => ajustarStock(row.original)}>
              Stock
            </Button>
            <Button variant="outline" className="px-3 py-1" onClick={() => abrirEdicion(row.original)}>
              Editar
            </Button>
            <Button variant="danger" className="px-3 py-1" onClick={() => confirmarEliminar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const guardando = crear.isPending || actualizar.isPending;
  const errorForm = crear.isError
    ? handleApiError(crear.error)
    : actualizar.isError
      ? handleApiError(actualizar.error)
      : null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={abrirAlta} disabled={!categorias.data || categorias.data.length === 0}>
          Nuevo producto
        </Button>
      </div>

      {categorias.data?.length === 0 && <p className="text-sm text-muted">Primero creá al menos una categoría.</p>}

      {isPending && <Skeleton className="h-48 w-full" />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />}
      {data && data.items.length === 0 && <EstadoVacio titulo="No hay productos cargados" />}
      {data && data.items.length > 0 && <DataTable table={table} />}

      <Modal isOpen={modalAbierto} title={editando ? "Editar producto" : "Nuevo producto"} onClose={cerrar}>
        <ProductoForm
          key={editando?.id ?? "nuevo"}
          producto={editando}
          categorias={categorias.data ?? []}
          guardando={guardando}
          error={errorForm}
          onSubmit={guardar}
          onCancel={cerrar}
        />
      </Modal>
    </section>
  );
}
