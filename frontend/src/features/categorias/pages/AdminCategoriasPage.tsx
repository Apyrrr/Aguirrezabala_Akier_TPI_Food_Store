import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { handleApiError } from "@/shared/api/handleApiError";
import DataTable from "@/shared/components/DataTable";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Skeleton from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";
import CategoriaForm from "../components/CategoriaForm";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "../hooks/useCategorias";
import type { Categoria, CategoriaInput } from "../types/categoria";

const columnHelper = createColumnHelper<Categoria>();

export default function AdminCategoriasPage() {
  const { data, isPending, isError, error, refetch } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const abrirAlta = () => {
    setEditando(null);
    crear.reset();
    setModalAbierto(true);
  };
  const abrirEdicion = (c: Categoria) => {
    setEditando(c);
    actualizar.reset();
    setModalAbierto(true);
  };
  const cerrar = () => setModalAbierto(false);

  const guardar = (valores: CategoriaInput) => {
    if (editando) {
      actualizar.mutate({ id: editando.id, data: valores }, { onSuccess: cerrar });
    } else {
      crear.mutate(valores, { onSuccess: cerrar });
    }
  };

  const confirmarEliminar = (c: Categoria) => {
    if (window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) eliminar.mutate(c.id);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre", { header: "Nombre" }),
      columnHelper.accessor("descripcion", {
        header: "Descripción",
        cell: (info) => info.getValue() ?? "—",
        enableSorting: false,
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
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
    data: data ?? [],
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
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={abrirAlta}>Nueva categoría</Button>
      </div>

      {isPending && <Skeleton className="h-48 w-full" />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />}
      {data && data.length === 0 && (
        <EstadoVacio
          titulo="No hay categorías"
          descripcion="Creá la primera para poder cargar productos."
          accion={<Button onClick={abrirAlta}>Nueva categoría</Button>}
        />
      )}
      {data && data.length > 0 && <DataTable table={table} />}

      <Modal isOpen={modalAbierto} title={editando ? "Editar categoría" : "Nueva categoría"} onClose={cerrar}>
        <CategoriaForm
          key={editando?.id ?? "nueva"}
          categoria={editando}
          guardando={guardando}
          error={errorForm}
          onSubmit={guardar}
          onCancel={cerrar}
        />
      </Modal>
    </section>
  );
}
