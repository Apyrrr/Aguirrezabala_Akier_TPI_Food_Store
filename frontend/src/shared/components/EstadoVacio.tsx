import type { ReactNode } from "react";

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export default function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
      <p className="text-lg font-semibold">{titulo}</p>
      {descripcion && <p className="mt-1 text-sm text-muted">{descripcion}</p>}
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  );
}
