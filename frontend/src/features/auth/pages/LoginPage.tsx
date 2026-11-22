import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import FieldErrors from "@/shared/components/FieldErrors";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Input from "@/shared/ui/Input";
import { notificarExito } from "@/shared/api/notificar";
import { useAuthStore } from "@/store/authStore";

interface LocationState {
  from?: { pathname: string };
  registrado?: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = useAuthStore((s) => s.usuario);
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);

  // ProtectedRoute guarda en el state la ruta que el usuario quería abrir
  const state = location.state as LocationState | null;
  const destino = state?.from?.pathname ?? "/";

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login({ username: value.username.trim(), password: value.password });
        notificarExito("Sesión iniciada");
        navigate(destino, { replace: true });
      } catch (e) {
        // Credenciales incorrectas o cuenta desactivada: se muestra sin recargar la página
        setError(e instanceof Error ? e.message : "No se pudo iniciar la sesión");
      }
    },
  });

  if (usuario) return <Navigate to={destino} replace />;

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted">Ingresá para hacer tu pedido.</p>

        {state?.registrado && (
          <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Cuenta creada. Ya podés iniciar sesión.
          </p>
        )}

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => (!value.trim() ? "El usuario es obligatorio" : undefined),
            }}
          >
            {(f) => (
              <label className="block text-sm font-medium">
                Usuario
                <Input
                  className="mt-1"
                  autoComplete="username"
                  value={f.state.value}
                  onBlur={f.handleBlur}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
                <FieldErrors errors={f.state.meta.errors} />
              </label>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (!value ? "La contraseña es obligatoria" : undefined),
            }}
          >
            {(f) => (
              <label className="block text-sm font-medium">
                Contraseña
                <Input
                  className="mt-1"
                  type="password"
                  autoComplete="current-password"
                  value={f.state.value}
                  onBlur={f.handleBlur}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
                <FieldErrors errors={f.state.meta.errors} />
              </label>
            )}
          </form.Field>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
