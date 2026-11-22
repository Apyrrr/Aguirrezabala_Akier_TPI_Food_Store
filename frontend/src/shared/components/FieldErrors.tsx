interface FieldErrorsProps {
  errors: unknown[];
}

// Muestra los mensajes de error de un campo (field.state.meta.errors es un array)
export default function FieldErrors({ errors }: FieldErrorsProps) {
  const mensajes = errors
    .map((err) => {
      if (typeof err === "string") return err;
      if (typeof err === "object" && err !== null && "message" in err && typeof err.message === "string") {
        return err.message;
      }
      return undefined;
    })
    .filter((msg): msg is string => Boolean(msg));

  return (
    <>
      {mensajes.map((msg) => (
        <p key={msg} role="alert" className="mt-1 text-xs text-error">
          {msg}
        </p>
      ))}
    </>
  );
}
