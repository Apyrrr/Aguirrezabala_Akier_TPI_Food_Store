import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import FieldErrors from "@/shared/components/FieldErrors";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Input from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { useRegister } from "../hooks/useRegister";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const registrar = useRegister();

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "", confirmar: "" },
    onSubmit: ({ value }) => {
      registrar.mutate(
        {
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        },
        // Al completarse el registro se redirige al login
        { onSuccess: () => navigate("/login", { replace: true, state: { registrado: true } }) },
      );
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted">Registrate para pedir tu comida.</p>

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
              onChange: ({ value }) =>
                value.trim().length < 3 ? "El usuario debe tener al menos 3 caracteres" : undefined,
            }}
          >
            {(f) => (
              <label className="block text-sm font-medium">
                Usuario
                <Input
                  className="mt-1"
                  autoComplete="username"
                  maxLength={50}
                  value={f.state.value}
                  onBlur={f.handleBlur}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
                <FieldErrors errors={f.state.meta.errors} />
              </label>
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) => (!value.trim() ? "El nombre completo es obligatorio" : undefined),
            }}
          >
            {(f) => (
              <label className="block text-sm font-medium">
                Nombre completo
                <Input
                  className="mt-1"
                  autoComplete="name"
                  maxLength={100}
                  value={f.state.value}
                  onBlur={f.handleBlur}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
                <FieldErrors errors={f.state.meta.errors} />
              </label>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (!EMAIL_REGEX.test(value.trim()) ? "Ingresá un email válido" : undefined),
            }}
          >
            {(f) => (
              <label className="block text-sm font-medium">
                Email
                <Input
                  className="mt-1"
                  type="email"
                  autoComplete="email"
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
              onChange: ({ value }) =>
                value.length < 8 ? "La contraseña debe tener al menos 8 caracteres" : undefined,
            }}
          >
            {(f) => (
              <label className="block text-sm font-medium">
                Contraseña
                <Input
                  className="mt-1"
                  type="password"
                  autoComplete="new-password"
                  maxLength={72}
                  value={f.state.value}
                  onBlur={f.handleBlur}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
                <FieldErrors errors={f.state.meta.errors} />
              </label>
            )}
          </form.Field>

          <form.Field
            name="confirmar"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue("password") ? "Las contraseñas no coinciden" : undefined,
            }}
          >
            {(f) => (
              <label className="block text-sm font-medium">
                Repetir contraseña
                <Input
                  className="mt-1"
                  type="password"
                  autoComplete="new-password"
                  value={f.state.value}
                  onBlur={f.handleBlur}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
                <FieldErrors errors={f.state.meta.errors} />
              </label>
            )}
          </form.Field>

          {registrar.isError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-error">
              {handleApiError(registrar.error)}
            </p>
          )}

          <form.Subscribe selector={(s) => s.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" className="w-full" disabled={!canSubmit || registrar.isPending}>
                {registrar.isPending ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
