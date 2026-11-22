from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import AdminUser, CurrentUser
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
    get_pedido_service,
)

router = APIRouter(prefix="/api/v1/pedidos", tags=["pedidos"])

ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]

# Reglas de negocio que responden 400
ReglaDeNegocio = (ProductoRepetido, ProductoNoDisponible, StockInsuficiente, TransicionInvalida)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(datos: PedidoCreate, user: CurrentUser, service: ServiceDep):
    try:
        return service.crear(datos, user)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    user: CurrentUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
):
    return service.listar(user, estado, skip, limit)


# /resumen se declara antes de /{pedido_id} para que no se lo tome como un id
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminUser, service: ServiceDep):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, user: CurrentUser, service: ServiceDep):
    try:
        return service.obtener(pedido_id, user)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(e))


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(pedido_id: int, datos: CambioEstado, _admin: AdminUser, service: ServiceDep):
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, user: CurrentUser, service: ServiceDep):
    try:
        return service.cancelar(pedido_id, user)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))
