import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import Button from "@/shared/ui/Button";

interface DataTableProps<T> {
  table: Table<T>; // la instancia la crea la página con useReactTable
}

// Presentación de una tabla de TanStack Table, con ordenamiento y paginación del lado del cliente
export default function DataTable<T>({ table }: DataTableProps<T>) {
  const { pageIndex } = table.getState().pagination;
  const totalFilas = table.getCoreRowModel().rows.length;

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-stone-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const orden = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 hover:text-brand"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span aria-hidden="true">
                            {orden === "asc" ? "▲" : orden === "desc" ? "▼" : "↕"}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3 text-sm text-muted">
        <span>
          {totalFilas} {totalFilas === 1 ? "registro" : "registros"}
        </span>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1"
          >
            Anterior
          </Button>
          <span>
            Página {pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
