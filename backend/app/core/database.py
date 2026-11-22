"""Engine de SQLModel, creación de tablas y fábrica de sesiones."""

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita check_same_thread=False porque FastAPI atiende cada petición en un hilo distinto
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # descarta conexiones caídas antes de usarlas
    connect_args=_connect_args,
)


def import_models() -> None:
    """Importa todos los modelos para que SQLModel.metadata y las relaciones conozcan las cinco tablas."""
    import app.modules.categorias.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.usuarios.models  # noqa: F401


def create_all_tables() -> None:
    """Crea las tablas que todavía no existen."""
    import_models()
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Abre una sesión nueva. La usa el Unit of Work.

    expire_on_commit=False: los objetos siguen legibles después del commit, que ocurre
    en el __exit__ del Unit of Work, justo antes de que el Router arme la respuesta.
    """
    return Session(engine, expire_on_commit=False)
