"""Autenticación: registro, login con cookie HttpOnly, logout y perfil."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import CurrentUser
from app.modules.auth.schemas import Mensaje
from app.modules.auth.service import AuthService, get_auth_service
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

ServiceDep = Annotated[AuthService, Depends(get_auth_service)]

COOKIE_NAME = "access_token"


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(datos: UserCreate, service: ServiceDep):
    return service.register(datos)


@router.post("/token", response_model=Mensaje)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: ServiceDep,
):
    token = service.authenticate(form_data.username, form_data.password)
    # El token viaja solo en la cookie HttpOnly: JavaScript no puede leerlo y el cuerpo no lo incluye
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # con HTTPS en producción debe ser True
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout", response_model=Mensaje)
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="lax", secure=False)
    return Mensaje(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUser):
    return current_user
