"""Repositorio base genérico: CRUD mínimo sobre cualquier modelo SQLModel.

Capa: Repository. Conoce a Model y Session; no conoce a Service ni a Router.
No hace commit: solo flush. El commit lo decide el Unit of Work.
"""

from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, model: type[T], session: Session) -> None:
        self.model = model
        self.session = session

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, entity: T) -> T:
        """Inserta o actualiza la entidad y la sincroniza con la base (flush, sin commit)."""
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
