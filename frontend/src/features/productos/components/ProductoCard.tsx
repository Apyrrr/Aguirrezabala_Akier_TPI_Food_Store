import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import { formatearPrecio } from "../utils";
import type { Producto } from "../types/producto";

export default function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0);

  const sinStock = !producto.disponible || producto.stock <= 0;
  const topeAlcanzado = enCarrito >= producto.stock;

  return (
    <Card className="flex flex-col overflow-hidden" data-testid="producto-card">
      {producto.imagen_url ? (
        <img src={producto.imagen_url} alt={producto.nombre} loading="lazy" className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-stone-100 text-stone-400">Sin imagen</div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold tracking-wide text-brand uppercase">{producto.categoria.nombre}</span>
        <h3 className="text-lg font-bold">{producto.nombre}</h3>
        {producto.descripcion && <p className="line-clamp-2 text-sm text-muted">{producto.descripcion}</p>}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-xl font-bold">{formatearPrecio(producto.precio_base)}</p>
            <p className={`text-xs ${sinStock ? "text-error" : "text-muted"}`}>
              {sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
            </p>
          </div>
          <Button
            disabled={sinStock || topeAlcanzado}
            onClick={() =>
              agregar({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                imagen_url: producto.imagen_url,
                stock: producto.stock,
              })
            }
          >
            {topeAlcanzado && !sinStock ? "Máximo en carrito" : "Agregar al carrito"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
