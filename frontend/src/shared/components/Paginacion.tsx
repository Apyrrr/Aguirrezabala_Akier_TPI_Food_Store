import Button from "@/shared/ui/Button";

interface PaginacionProps {
  page: number; // 1-based
  total: number; // cantidad de registros que informa el servidor
  limit: number;
  onChange: (page: number) => void;
}

// Paginación del lado del servidor: la página la guarda quien la usa y viaja a la API como skip = (page - 1) * limit
export default function Paginacion({ page, total, limit, onChange }: PaginacionProps) {
  const paginas = Math.max(Math.ceil(total / limit), 1);
  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3 text-sm">
      <Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </Button>
      <span className="text-muted">
        Página {page} de {paginas}
      </span>
      <Button variant="outline" disabled={page >= paginas} onClick={() => onChange(page + 1)}>
        Siguiente
      </Button>
    </nav>
  );
}
