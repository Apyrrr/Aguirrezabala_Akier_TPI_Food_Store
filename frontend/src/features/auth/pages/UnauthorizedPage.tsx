import { Link } from "react-router-dom";
import Card from "@/shared/ui/Card";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-bold">Sin permiso</h1>
        <p className="mt-2 text-muted">No tenés permiso para ver esta pantalla.</p>
        <Link to="/" className="mt-6 inline-block font-semibold text-brand hover:underline">
          Volver al inicio
        </Link>
      </Card>
    </div>
  );
}
