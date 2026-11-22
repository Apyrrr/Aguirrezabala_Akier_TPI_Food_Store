import { useForm } from "@tanstack/react-form";
import { Navigate, useNavigate } from "react-router-dom";
import { formatearPrecio } from "@/features/productos/utils";
import { handleApiError } from "@/shared/api/handleApiError";
import FieldErrors from "@/shared/components/FieldErrors";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Input, { inputClass } from "@/shared/ui/Input";
import { useCartStore } from "@/store/cartStore";
import { useCrearPedido } from "../hooks/useCrearPedido";
import type { FormaPago } from "../types/pedido";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const crear = useCrearPedido();

  const form = useForm({
    defaultValues: { direccion_entrega: "", forma_pago: "EFECTIVO" as FormaPago, notas: "" },
    onSubmit: ({ value }) => {
      crear.mutate(
        {
          // Solo viajan id y cantidad: el precio y el nombre los toma el servidor (RN-01)
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        },
        { onSuccess: () => navigate("/mis-pedidos", { replace: true }) },
      );
    },
  });

  // El carrito se vacía al confirmar: si no hay nada que comprar, no hay checkout
  if (items.length === 0 && !crear.isSuccess) return <Navigate to="/carrito" replace />;

  return (
    <section className="grid gap-6 lg:grid-cols-5">
      <Card className="p-6 lg:col-span-3">
        <h1 className="text-2xl font-bold">Confirmar pedido</h1>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="direccion_entrega"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 5 ? "Ingresá una dirección de entrega (mínimo 5 caracteres)" : undefined,
            }}
          >
            {(f) => (
              <label className="block text-sm font-medium">
                Dirección de entrega
                <Input
                  className="mt-1"
                  autoComplete="street-address"
                  value={f.state.value}
                  onBlur={f.handleBlur}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
                <FieldErrors errors={f.state.meta.errors} />
              </label>
            )}
          </form.Field>

          <form.Field name="forma_pago">
            {(f) => (
              <label className="block text-sm font-medium">
                Forma de pago
                <select
                  className={`${inputClass} mt-1`}
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value as FormaPago)}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </label>
            )}
          </form.Field>

          <form.Field name="notas">
            {(f) => (
              <label className="block text-sm font-medium">
                Notas (opcional)
                <Input
                  className="mt-1"
                  maxLength={300}
                  value={f.state.value}
                  onBlur={f.handleBlur}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </label>
            )}
          </form.Field>

          {crear.isError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-error">
              {handleApiError(crear.error)}
            </p>
          )}

          <form.Subscribe selector={(s) => s.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" className="w-full" disabled={!canSubmit || crear.isPending}>
                {crear.isPending ? "Confirmando..." : "Confirmar pedido"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <Card className="h-fit p-6 lg:col-span-2">
        <h2 className="text-lg font-bold">Resumen</h2>
        <ul className="mt-3 divide-y divide-stone-100 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between py-2">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span className="font-medium">{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatearPrecio(total)}</span>
        </p>
      </Card>
    </section>
  );
}
