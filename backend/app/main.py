"""Punto de entrada: crea la aplicación FastAPI, registra CORS con credenciales y los routers (/api/v1)."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    create_all_tables()  # crea las tablas que falten al arrancar
    yield


app = FastAPI(
    title="Food Store API",
    description="Sistema de pedidos de comida · Trabajo Práctico Integrador de Programación 4",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: permite que el navegador envíe y reciba la cookie HttpOnly
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(usuarios_router)
app.include_router(categorias_router)
app.include_router(productos_router)
app.include_router(pedidos_router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
