"""Gestión de usuarios (solo admin): /api/v1/admin/usuarios."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import AdminUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService, get_usuario_service

router = APIRouter(prefix="/api/v1/admin/usuarios", tags=["usuarios"])

ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_admin: AdminUser, service: ServiceDep):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, admin: AdminUser, service: ServiceDep):
    return service.set_disabled(usuario_id, disabled=False, actor_id=admin.id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: int, admin: AdminUser, service: ServiceDep):
    return service.set_disabled(usuario_id, disabled=True, actor_id=admin.id)
