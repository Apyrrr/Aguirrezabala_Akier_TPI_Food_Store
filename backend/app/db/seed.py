"""Carga inicial de datos. Idempotente: se puede ejecutar varias veces sin duplicar registros.

Uso (con el entorno virtual activo y el .env configurado):
    python -m app.db.seed

Crea el usuario admin (admin / Admin1234!), 4 categorías y 12 productos con stock.
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}


def _img(semilla: str) -> str:
    return f"https://picsum.photos/seed/{semilla}/600/400"


CATALOGO: dict[str, dict] = {
    "Pizzas": {
        "descripcion": "Pizzas a la piedra",
        "productos": [
            ("Pizza Muzzarella", "Salsa de tomate y muzzarella", 9500, 25),
            ("Pizza Napolitana", "Muzzarella, tomate fresco y ajo", 10800, 20),
            ("Pizza Fugazzeta", "Cebolla y muzzarella", 10200, 15),
        ],
    },
    "Empanadas": {
        "descripcion": "Horneadas, por unidad",
        "productos": [
            ("Empanada de carne", "Cortada a cuchillo", 1500, 60),
            ("Empanada de jamón y queso", "Clásica", 1400, 60),
            ("Empanada de humita", "Choclo cremoso", 1400, 40),
        ],
    },
    "Bebidas": {
        "descripcion": "Frías y sin alcohol",
        "productos": [
            ("Coca-Cola 1.5L", "Gaseosa", 2800, 50),
            ("Agua mineral 500ml", "Sin gas", 1200, 80),
            ("Cerveza artesanal", "Lata de 473 ml", 3200, 30),
        ],
    },
    "Postres": {
        "descripcion": "Caseros",
        "productos": [
            ("Flan con dulce de leche", "Con crema", 3200, 20),
            ("Tiramisú", "Receta italiana", 4200, 12),
            ("Brownie con helado", "Chocolate y vainilla", 4800, 10),
        ],
    },
}


def run() -> None:
    print("=== Seed · Food Store ===")
    create_all_tables()

    with Session(engine) as session:
        admin = session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first()
        if admin:
            print(f"  [=] Ya existe el usuario {ADMIN['username']}")
        else:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            print(f"  [+] Usuario {ADMIN['username']} (rol admin)")
        session.commit()

        for nombre_categoria, datos in CATALOGO.items():
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre_categoria)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre_categoria, descripcion=datos["descripcion"])
                session.add(categoria)
                session.commit()
                session.refresh(categoria)
                print(f"  [+] Categoría {nombre_categoria}")
            else:
                print(f"  [=] Ya existe la categoría {nombre_categoria}")

            for nombre, descripcion, precio, stock in datos["productos"]:
                existe = session.exec(
                    select(Producto).where(
                        Producto.nombre == nombre, Producto.categoria_id == categoria.id
                    )
                ).first()
                if existe is None:
                    session.add(
                        Producto(
                            categoria_id=categoria.id,  # type: ignore[arg-type]
                            nombre=nombre,
                            descripcion=descripcion,
                            precio_base=precio,
                            imagen_url=_img(nombre.lower().replace(" ", "-")),
                            stock=stock,
                        )
                    )
                    print(f"      [+] {nombre}")
        session.commit()

    print(f"\nUsuario admin: {ADMIN['username']} / {ADMIN['password']}\n")


if __name__ == "__main__":
    run()
