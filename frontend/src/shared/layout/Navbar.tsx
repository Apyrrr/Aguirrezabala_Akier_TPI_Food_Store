import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import Button from "@/shared/ui/Button";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? "bg-white/15 text-white" : "text-stone-300 hover:text-white"
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.cantidadTotal());

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-stone-900 text-white shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span aria-hidden="true">🍕</span> Food Store
        </Link>

        <nav className="flex items-center gap-1" aria-label="Principal">
          <NavLink to="/" end className={linkClass}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={linkClass}>
            Carrito
            {cantidad > 0 && (
              <span
                data-testid="carrito-cantidad"
                className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold"
              >
                {cantidad}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={linkClass}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.rol === "admin" && (
            <NavLink to="/admin/resumen" className={linkClass}>
              Panel
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <p className="text-right text-sm leading-tight" data-testid="navbar-usuario">
                <span className="block font-medium">{usuario.nombre}</span>
                <span className="block text-xs text-stone-400">{usuario.rol}</span>
              </p>
              <Button variant="outline" onClick={handleLogout} className="border-stone-500 bg-transparent text-white hover:bg-white/10">
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-stone-300 hover:text-white">
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold hover:bg-brand-hover"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
