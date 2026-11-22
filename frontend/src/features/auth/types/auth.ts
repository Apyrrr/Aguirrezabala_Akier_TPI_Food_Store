export type Rol = "user" | "admin";

// Mismos nombres de campo que UserPublic del backend
export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

// Lo que guarda authStore: nunca el token (vive en la cookie HttpOnly)
export interface UsuarioSesion {
  id: number;
  username: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  full_name: string;
  email: string;
  password: string;
}
