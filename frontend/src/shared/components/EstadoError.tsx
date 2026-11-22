import Button from "@/shared/ui/Button";

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

export default function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">{mensaje}</p>
      {onReintentar && (
        <Button variant="outline" onClick={onReintentar} className="mt-3">
          Reintentar
        </Button>
      )}
    </div>
  );
}
