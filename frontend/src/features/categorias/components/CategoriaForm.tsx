import { useForm } from "@tanstack/react-form";
import FieldErrors from "@/shared/components/FieldErrors";
import FormActions from "@/shared/components/FormActions";
import Input from "@/shared/ui/Input";
import type { Categoria, CategoriaInput } from "../types/categoria";

interface CategoriaFormProps {
  categoria: Categoria | null; // null = alta, con valor = edición
  guardando: boolean;
  error: string | null;
  onSubmit: (data: CategoriaInput) => void;
  onCancel: () => void;
}

export default function CategoriaForm({ categoria, guardando, error, onSubmit, onCancel }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? "", descripcion: categoria?.descripcion ?? "" },
    onSubmit: ({ value }) =>
      onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="space-y-4">
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const v = value.trim();
              if (v.length < 2) return "El nombre debe tener al menos 2 caracteres";
              if (v.length > 50) return "El nombre admite hasta 50 caracteres";
              return undefined;
            },
          }}
        >
          {(f) => (
            <label className="block text-sm font-medium">
              Nombre
              <Input
                className="mt-1"
                value={f.state.value}
                onBlur={f.handleBlur}
                onChange={(e) => f.handleChange(e.target.value)}
              />
              <FieldErrors errors={f.state.meta.errors} />
            </label>
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(f) => (
            <label className="block text-sm font-medium">
              Descripción (opcional)
              <Input
                className="mt-1"
                value={f.state.value}
                onBlur={f.handleBlur}
                onChange={(e) => f.handleChange(e.target.value)}
              />
            </label>
          )}
        </form.Field>
      </div>

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <FormActions onCancel={onCancel} guardando={guardando} error={error} deshabilitarEnvio={!canSubmit} />
        )}
      </form.Subscribe>
    </form>
  );
}
