from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(Categoria, session)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca por nombre sin distinguir mayúsculas; incluye las dadas de baja (siguen ocupando el nombre)."""
        return self.session.exec(
            select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        ).first()

    def list_activas(self) -> list[Categoria]:
        return list(
            self.session.exec(
                select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
            ).all()
        )
