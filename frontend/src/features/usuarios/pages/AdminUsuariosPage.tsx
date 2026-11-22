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
import Skeleton from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useCambiarEstadoUsuario, useUsuarios } from "../hooks/useUsuarios";
import type { Usuario } from "../types/usuario";

const columnHelper = createColumnHelper<Usuario>();

export default function AdminUsuariosPage() {
  const { data, isPending, isError, error, refetch } = useUsuarios();
  const cambiar = useCambiarEstadoUsuario();
  const miId = useAuthStore((s) => s.usuario?.id);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("username", { header: "Usuario" }),
      columnHelper.accessor("full_name", { header: "Nombre" }),
      columnHelper.accessor("email", { header: "Email" }),
      columnHelper.accessor("role", { header: "Rol" }),
      columnHelper.accessor("disabled", {
        header: "Estado",
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Desactivado</span>
          ) : (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Activo</span>
          ),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          if (u.id === miId) return <span className="text-xs text-muted">Tu cuenta</span>; // el admin no se desactiva a sí mismo
          return u.disabled ? (
            <Button
              variant="outline"
              className="px-3 py-1"
              disabled={cambiar.isPending}
              onClick={() => cambiar.mutate({ id: u.id, activar: true })}
            >
              Activar
            </Button>
          ) : (
            <Button
              variant="danger"
              className="px-3 py-1"
              disabled={cambiar.isPending}
              onClick={() => cambiar.mutate({ id: u.id, activar: false })}
            >
              Desactivar
            </Button>
          );
        },
      }),
    ],
    [miId, cambiar],
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      {isPending && <Skeleton className="h-48 w-full" />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />}
      {data && <DataTable table={table} />}
    </section>
  );
}
