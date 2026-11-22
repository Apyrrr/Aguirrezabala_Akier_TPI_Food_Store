from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    productos: ProductoRepository
    categorias: CategoriaRepository  # para validar la categoría de un producto

    def _init_repositories(self, session: Session) -> None:
        self.productos = ProductoRepository(session)
        self.categorias = CategoriaRepository(session)
