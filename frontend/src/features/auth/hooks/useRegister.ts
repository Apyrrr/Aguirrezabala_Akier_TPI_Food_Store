import { useMutation } from "@tanstack/react-query";
import { requestRegister } from "../api/auth";
import type { RegisterData } from "../types/auth";

/** Alta de una cuenta con rol user. Los errores (409, 422) los muestra la pantalla de registro. */
export function useRegister() {
  return useMutation({ mutationFn: (data: RegisterData) => requestRegister(data) });
}
