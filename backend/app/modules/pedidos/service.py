"""Reglas de negocio de pedidos (RN-01 a RN-06)."""

from datetime import datetime

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

# Máquina de estados (RN-02): estado actual → estados a los que puede pasar
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


# ─── Excepciones de dominio: el Router las traduce a códigos HTTP ───────────
class PedidoNoEncontrado(Exception):  # 404
    pass


class ProductoNoEncontrado(Exception):  # 404
    pass


class PedidoAjeno(Exception):  # 403
    pass


class ProductoRepetido(Exception):  # 400
    pass


class ProductoNoDisponible(Exception):  # 400
    pass


class StockInsuficiente(Exception):  # 400
    pass


class TransicionInvalida(Exception):  # 400
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ─── RN-01: crear pedido ────────────────────────────────────────────────
    def crear(self, datos: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]
            if len(set(ids)) != len(ids):
                raise ProductoRepetido("Hay productos repetidos en el pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado="PENDIENTE",
                    forma_pago=datos.forma_pago,
                    direccion_entrega=datos.direccion_entrega,
                    notas=datos.notas,
                    total=0,
                )
            )

            total = 0.0
            for item in datos.items:
                producto = uow.productos.get_by_id(item.producto_id, for_update=True)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"El producto {item.producto_id} no existe")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': "
                        f"hay {producto.stock} y se pidieron {item.cantidad}"
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = producto.precio_base * item.cantidad
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia: RN-05
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = total
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ─── Consultas (RN-04) ──────────────────────────────────────────────────
    def listar(
        self, usuario: UserPublic, estado: str | None, skip: int, limit: int
    ) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                items, total = uow.pedidos.list_all(estado, skip, limit)
            else:
                items, total = uow.pedidos.list_by_usuario(usuario.id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._existente(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    # ─── RN-02 y RN-03: cambio de estado (admin) ────────────────────────────
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = self._existente(uow, pedido_id)
            self._transicionar(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    # ─── RN-03 y RN-04: cancelación por el dueño ────────────────────────────
    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._existente(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._transicionar(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    # ─── Resumen para el panel ──────────────────────────────────────────────
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            inicio_de_hoy = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_de_hoy),
                ingresos_entregados=uow.pedidos.sum_total_por_estado("ENTREGADO"),
            )

    # ─── Auxiliares ─────────────────────────────────────────────────────────
    @staticmethod
    def _existente(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        """Valida la transición ANTES de modificar nada; si cancela, restituye el stock en la misma transacción."""
        if nuevo_estado not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {nuevo_estado}")

        if nuevo_estado == "CANCELADO":
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id, for_update=True)
                if producto is not None:
                    producto.stock += linea.cantidad
                    uow.productos.add(producto)

        pedido.estado = nuevo_estado
        pedido.updated_at = datetime.now()
        uow.pedidos.add(pedido)


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())
