"""Reglas de negocio de productos."""

from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    """El producto no existe o está dado de baja (404)."""


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(search, categoria_id, disponible, skip, limit)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow, producto_id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._categoria_activa(uow, datos.categoria_id)
            producto = uow.productos.add(Producto(**datos.model_dump()))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            cambios = datos.model_dump(exclude_unset=True)
            if cambios.get("categoria_id") is not None:
                self._categoria_activa(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                # los campos obligatorios no se pueden poner en null
                if valor is None and campo in {"nombre", "precio_base", "stock", "disponible", "categoria_id"}:
                    continue
                setattr(producto, campo, valor)
            return ProductoRead.model_validate(uow.productos.add(producto))

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            producto.stock = datos.stock
            producto.disponible = datos.disponible
            return ProductoRead.model_validate(uow.productos.add(producto))

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica (activo = false)."""
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)

    @staticmethod
    def _activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    @staticmethod
    def _categoria_activa(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())
