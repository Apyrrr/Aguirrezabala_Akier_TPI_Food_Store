import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "@/features/auth";
import Skeleton from "@/shared/components/Skeleton";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  allowedRoles?: Rol[]; // si se omite, alcanza con tener sesión
}

// Sin sesión → /login. Sin el rol → /unauthorized. Mientras checkSession confirma la sesión, muestra un indicador.
// Organiza la navegación, pero no reemplaza al backend: require_role sigue respondiendo 401 y 403.
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) {
    return (
      <div role="status" aria-label="Verificando sesión" className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!usuario) {
    // `from` permite volver a la ruta pedida después de iniciar sesión
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
