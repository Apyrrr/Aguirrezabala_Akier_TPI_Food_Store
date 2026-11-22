"""Gestión de usuarios para el rol admin: listado, activación y desactivación.

Como en el proyecto de seguridad de la materia, este módulo lanza HTTPException directamente.
"""

from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]

    def set_disabled(self, usuario_id: int, disabled: bool, actor_id: int) -> UserPublic:
        """Idempotente: responde 200 aunque el estado no cambie."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
            if disabled and usuario.id == actor_id:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, "El administrador no puede desactivarse a sí mismo"
                )
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())
