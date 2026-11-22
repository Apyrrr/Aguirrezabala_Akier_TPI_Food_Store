"""Dependencias de sesión y de rol para FastAPI.

    cookie access_token → get_current_user (401)
                        → get_current_active_user (400 si la cuenta está desactivada)
                        → require_role([...]) (403 si el rol no está permitido)
"""

from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Lee el token solo de la cookie HttpOnly access_token (nunca del encabezado Authorization)."""

    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get("access_token")
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No autenticado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserPublic:
    """Valida firma y expiración del JWT y carga el usuario. 401 si algo falla."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    username: str | None = payload.get("sub")
    if username is None:
        raise credentials_exception

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise credentials_exception
        return UserPublic.model_validate(usuario)


async def get_current_active_user(
    current_user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    """Rechaza a los usuarios con disabled = true."""
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(allowed_roles: list[str]):
    """Fábrica de dependencias para el control de acceso por rol (RBAC)."""

    async def role_checker(
        current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Permisos insuficientes. Rol actual: '{current_user.role}'. "
                    f"Se requiere uno de: {allowed_roles}"
                ),
            )
        return current_user

    return role_checker


# Atajos de tipo para los routers
CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
