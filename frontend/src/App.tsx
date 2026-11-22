import { useEffect } from "react";
import Toast from "@/shared/components/Toast";
import AppRouter from "@/routes/AppRouter";
import { useAuthStore } from "@/store/authStore";

// Al montar confirma la sesión con el servidor (única llamada en useEffect) y renderiza el router
function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession(); // GET /auth/me con la cookie
  }, [checkSession]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;
