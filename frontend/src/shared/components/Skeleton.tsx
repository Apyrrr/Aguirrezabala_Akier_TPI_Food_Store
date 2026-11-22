// Bloque gris animado que ocupa el lugar del contenido mientras carga
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-stone-200 ${className}`} />;
}
