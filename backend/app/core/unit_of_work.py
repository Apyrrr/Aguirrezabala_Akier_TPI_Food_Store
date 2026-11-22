"""Unit of Work base: una transacción por bloque `with`.

__enter__ abre la sesión y arma los repositorios que la comparten;
__exit__ hace commit si no hubo excepción, rollback si la hubo, y siempre close.
Ningún Service ni Router llama a session.commit().

Capa: Unit of Work. Conoce a Repository y Session; no conoce a Service ni a Router.
"""

from collections.abc import Callable
from types import TracebackType

from sqlmodel import Session

from app.core import database


class UnitOfWork:
    session: Session

    def __init__(self, session_factory: Callable[[], Session] | None = None) -> None:
        # Si no se inyecta una fábrica, se toma la de database en el momento de usarla
        self._session_factory = session_factory

    def __enter__(self) -> "UnitOfWork":
        factory = self._session_factory or database.session_factory
        self.session = factory()
        self._init_repositories(self.session)
        return self

    def _init_repositories(self, session: Session) -> None:
        """Los Unit of Work de cada módulo crean acá los repositorios que comparten la sesión."""

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
