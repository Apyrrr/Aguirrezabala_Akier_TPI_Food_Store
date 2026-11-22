"""Configuración centralizada: variables de entorno leídas de .env con pydantic-settings."""

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Conexión a la base. PostgreSQL en producción; en desarrollo se acepta SQLite.
    DATABASE_URL: str

    # JWT: la clave no tiene valor por defecto y debe tener al menos 32 caracteres
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Origen del frontend permitido por CORS (con credenciales)
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


# Instancia global: se importa desde acá en toda la aplicación
settings = Settings()  # type: ignore[call-arg]  # los valores obligatorios vienen del entorno
