import { useForm } from "@tanstack/react-form";
import type { Categoria } from "@/features/categorias";
import FieldErrors from "@/shared/components/FieldErrors";
import FormActions from "@/shared/components/FormActions";
import Input, { inputClass } from "@/shared/ui/Input";
import type { Producto, ProductoInput } from "../types/producto";

interface ProductoFormProps {
  producto: Producto | null;
  categorias: Categoria[];
  guardando: boolean;
  error: string | null;
  onSubmit: (data: ProductoInput) => void;
  onCancel: () => void;
}

export default function ProductoForm({ producto, categorias, guardando, error, onSubmit, onCancel }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto ? String(producto.precio_base) : "",
      imagen_url: producto?.imagen_url ?? "",
      stock: producto ? String(producto.stock) : "0",
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : "",
    },
    onSubmit: ({ value }) =>
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      }),
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
            onChange: ({ value }) => (value.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres" : undefined),
          }}
        >
          {(f) => (
            <label className="block text-sm font-medium">
              Nombre
              <Input className="mt-1" value={f.state.value} onBlur={f.handleBlur} onChange={(e) => f.handleChange(e.target.value)} />
              <FieldErrors errors={f.state.meta.errors} />
            </label>
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(f) => (
            <label className="block text-sm font-medium">
              Descripción (opcional)
              <Input className="mt-1" value={f.state.value} onBlur={f.handleBlur} onChange={(e) => f.handleChange(e.target.value)} />
            </label>
          )}
        </form.Field>

        <form.Field name="categoria_id" validators={{ onChange: ({ value }) => (!value ? "Elegí una categoría" : undefined) }}>
          {(f) => (
            <label className="block text-sm font-medium">
              Categoría
              <select
                className={`${inputClass} mt-1`}
                value={f.state.value}
                onBlur={f.handleBlur}
                onChange={(e) => f.handleChange(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <FieldErrors errors={f.state.meta.errors} />
            </label>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) => {
                const n = Number(value);
                return value === "" || Number.isNaN(n) || n <= 0 ? "El precio debe ser mayor a 0" : undefined;
              },
            }}
          >
            {(f) => (
              <label className="block text-sm font-medium">
                Precio
                <Input
                  className="mt-1"
                  type="number"
                  min="0"
                  step="0.01"
                  value={f.state.value}
                  onBlur={f.handleBlur}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
                <FieldErrors errors={f.state.meta.errors} />
              </label>
            )}
          </form.Field>

          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) => {
                const n = Number(value);
                return value === "" || !Number.isInteger(n) || n < 0 ? "El stock debe ser un entero ≥ 0" : undefined;
              },
            }}
          >
            {(f) => (
              <label className="block text-sm font-medium">
                Stock
                <Input
                  className="mt-1"
                  type="number"
                  min="0"
                  step="1"
                  value={f.state.value}
                  onBlur={f.handleBlur}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
                <FieldErrors errors={f.state.meta.errors} />
              </label>
            )}
          </form.Field>
        </div>

        <form.Field name="imagen_url">
          {(f) => (
            <label className="block text-sm font-medium">
              URL de la imagen (opcional)
              <Input className="mt-1" value={f.state.value} onBlur={f.handleBlur} onChange={(e) => f.handleChange(e.target.value)} />
            </label>
          )}
        </form.Field>

        <form.Field name="disponible">
          {(f) => (
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={f.state.value}
                onChange={(e) => f.handleChange(e.target.checked)}
                className="size-4 accent-brand"
              />
              Disponible para la venta
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
