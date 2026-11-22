import { Link, useNavigate } from "react-router-dom";
import { formatearPrecio } from "@/features/productos/utils";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export default function CarritoPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());
  const usuario = useAuthStore((s) => s.usuario);

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Sumá productos desde el menú."
        accion={
          <Link to="/">
            <Button>Ver el menú</Button>
          </Link>
        }
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tu carrito</h1>
        <Button variant="ghost" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <Card className="divide-y divide-stone-100">
        {items.map((i) => (
          <div key={i.producto_id} className="flex flex-wrap items-center gap-4 p-4" data-testid="carrito-item">
            {i.imagen_url ? (
              <img src={i.imagen_url} alt="" className="size-16 rounded-lg object-cover" />
            ) : (
              <div className="size-16 rounded-lg bg-stone-100" />
            )}
            <div className="min-w-40 flex-1">
              <p className="font-semibold">{i.nombre}</p>
              <p className="text-sm text-muted">{formatearPrecio(i.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="px-3 py-1"
                aria-label={`Restar una unidad de ${i.nombre}`}
                onClick={() => cambiarCantidad(i.producto_id, i.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center font-medium">{i.cantidad}</span>
              <Button
                variant="outline"
                className="px-3 py-1"
                aria-label={`Sumar una unidad de ${i.nombre}`}
                disabled={i.cantidad >= i.stock}
                onClick={() => cambiarCantidad(i.producto_id, i.cantidad + 1)}
              >
                +
              </Button>
            </div>
            <p className="w-28 text-right font-bold">{formatearPrecio(i.precio_unitario * i.cantidad)}</p>
            <Button variant="ghost" onClick={() => quitar(i.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
      </Card>

      <Card className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted">Total</p>
          <p className="text-2xl font-bold" data-testid="carrito-total">
            {formatearPrecio(total)}
          </p>
        </div>
        <Button
          // Sin sesión, el checkout redirige a /login y vuelve acá
          onClick={() => navigate(usuario ? "/checkout" : "/login", { state: { from: { pathname: "/checkout" } } })}
        >
          Continuar con el pedido
        </Button>
      </Card>
    </section>
  );
}
