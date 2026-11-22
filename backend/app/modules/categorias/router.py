from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import AdminUser
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
    get_categoria_service,
)

router = APIRouter(prefix="/api/v1/categorias", tags=["categorias"])

ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(datos: CategoriaCreate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.crear(datos)
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int, datos: CategoriaUpdate, _admin: AdminUser, service: ServiceDep
):
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: int, _admin: AdminUser, service: ServiceDep):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
