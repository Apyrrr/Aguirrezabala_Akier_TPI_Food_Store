import { NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const enlacesAdmin = [
  { to: "/admin/resumen", texto: "Resumen" },
  { to: "/admin/pedidos", texto: "Pedidos" },
  { to: "/admin/productos", texto: "Productos" },
  { to: "/admin/categorias", texto: "Categorías" },
  { to: "/admin/usuarios", texto: "Usuarios" },
];

// Reúne la Navbar y el contenido de la ruta; en el panel de administración suma una barra de secciones
export default function MainLayout() {
  const { pathname } = useLocation();
  const enPanel = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen">
      <Navbar />
      {enPanel && (
        <nav aria-label="Panel de administración" className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl gap-1 px-6">
            {enlacesAdmin.map(({ to, texto }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    isActive ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"
                  }`
                }
              >
                {texto}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
