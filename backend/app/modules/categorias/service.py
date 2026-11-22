"""Reglas de negocio de categorías. Abre el Unit of Work y devuelve schemas dentro del bloque."""

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """La categoría no existe o está dada de baja (404)."""


class NombreDuplicado(Exception):
    """Ya existe una categoría con ese nombre (409)."""


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, categoria_id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(datos.nombre):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria = uow.categorias.add(Categoria(**datos.model_dump()))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            cambios = datos.model_dump(exclude_unset=True)
            nuevo_nombre = cambios.get("nombre")
            if nuevo_nombre is not None:
                otra = uow.categorias.get_by_nombre(nuevo_nombre)
                if otra is not None and otra.id != categoria.id:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
            for campo, valor in cambios.items():
                if campo == "nombre" and valor is None:
                    continue  # el nombre es obligatorio
                setattr(categoria, campo, valor)
            return CategoriaRead.model_validate(uow.categorias.add(categoria))

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: no libera el nombre ni oculta los productos de la categoría."""
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())
