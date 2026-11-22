from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(Producto, session)

    def get_by_id(self, entity_id: int, for_update: bool = False) -> Producto | None:  # type: ignore[override]
        """for_update bloquea la fila hasta el fin de la transacción (evita vender el mismo stock dos veces)."""
        if not for_update:
            return self.session.get(Producto, entity_id)
        return self.session.exec(
            select(Producto).where(Producto.id == entity_id).with_for_update()
        ).first()

    def search(
        self,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Producto], int]:
        """Productos activos filtrados y paginados. Devuelve (items, total)."""
        condiciones = [Producto.activo == True]  # noqa: E712
        if search:
            condiciones.append(func.lower(Producto.nombre).contains(search.lower(), autoescape=True))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*condiciones)).one()
        items = self.session.exec(
            select(Producto).where(*condiciones).order_by(Producto.nombre).offset(skip).limit(limit)
        ).all()
        return list(items), total
