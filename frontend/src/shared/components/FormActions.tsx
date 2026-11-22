import Button from "@/shared/ui/Button";

interface FormActionsProps {
  onCancel: () => void;
  guardando: boolean;
  error: string | null;
  deshabilitarEnvio: boolean; // derivado del estado del formulario (canSubmit)
}

export default function FormActions({ onCancel, guardando, error, deshabilitarEnvio }: FormActionsProps) {
  return (
    <>
      {error && (
        <p role="alert" className="mt-3 text-sm text-error">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={deshabilitarEnvio || guardando}>
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </>
  );
}
