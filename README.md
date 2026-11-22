# Food Store — TPI Programación 4 (UTN TUPaD)

Aplicación web de pedidos de comida: catálogo con búsqueda y filtros, carrito, checkout, historial de pedidos del cliente y panel de administración (categorías, productos, pedidos, usuarios y resumen).

- **Alumno:** Akier Aguirrezabala
- **Repositorio público (GitHub):** `https://github.com/Apyrrr/Aguirrezabala_Akier_TPI_Food_Store`
- **Video demostrativo (10–15 min):** `https://www.youtube.com/watch?v=dmByshac38I`

## Stack

| Capa | Tecnologías |
|---|---|
| Backend | Python, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly (python-jose + passlib/bcrypt) |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query / Form / Table, React Router 7, Axios, Zustand |

Arquitectura del backend: `Router → Service → UnitOfWork → Repository → Model`, con excepciones de dominio traducidas a HTTP en los routers. Arquitectura del frontend: carpetas por feature (`auth`, `categorias`, `productos`, `pedidos`, `usuarios`) con barrel `index.ts`, más `shared/`, `store/` y `routes/`.

## Requisitos

- Python 3.11 – 3.13
- PostgreSQL 15 o superior (también funciona SQLite, ver más abajo)
- Node.js 20.19 o superior
- pnpm 9 o superior (`npm install -g pnpm`)

## Estructura

```
.
├── README.md
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   └── app/            # main.py, core/, db/seed.py, modules/{auth,usuarios,categorias,productos,pedidos}
└── frontend/
    ├── .env.example
    ├── package.json
    └── src/            # features/, shared/, store/, routes/
```

## Backend

```bash
cd backend

# 1. Entorno virtual
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Dependencias
pip install -r requirements.txt

# 3. Variables de entorno
cp .env.example .env              # Windows: copy .env.example .env
# editar .env: usuario/contraseña de PostgreSQL y SECRET_KEY

# 4. Base de datos (una sola vez)
createdb foodstore                # o: psql -U postgres -c "CREATE DATABASE foodstore;"

# 5. Datos iniciales (admin, categorías y productos). Se puede ejecutar más de una vez.
python -m app.db.seed

# 6. Levantar la API
uvicorn app.main:app --reload
```

- API: <http://localhost:8000/api/v1>
- Documentación interactiva (todos los endpoints): <http://localhost:8000/docs>

Las tablas se crean automáticamente al iniciar la API (o al correr el seed).

**Sin PostgreSQL:** en `backend/.env` usar `DATABASE_URL=sqlite:///./foodstore.db`.

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión | `postgresql://postgres:postgres@localhost:5432/foodstore` |
| `SECRET_KEY` | Clave para firmar el JWT. Generar una propia: `python -c "import secrets; print(secrets.token_hex(32))"` | (aleatoria) |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Vida del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (el del frontend) | `http://localhost:5173` |

### Usuario administrador del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |

El seed también carga 4 categorías (Pizzas, Empanadas, Bebidas, Postres) y 12 productos con stock. Los clientes se crean desde la pantalla **Crear cuenta** (rol `user`).

## Frontend

```bash
cd frontend

# 1. Variables de entorno
cp .env.example .env              # Windows: copy .env.example .env

# 2. Dependencias
pnpm install

# 3. Compilar (verifica TypeScript y genera dist/)
pnpm build

# 4. Servidor de desarrollo
pnpm dev
```

- Aplicación: <http://localhost:5173>
- Orden recomendado: levantar primero el backend y después el frontend.

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

Si se cambia el puerto del frontend, actualizar `FRONTEND_ORIGIN` en el backend (CORS con cookies).

## Funcionalidades

**Público:** catálogo con paginación del lado del servidor, búsqueda por nombre y filtro por categoría; carrito persistente; registro e inicio de sesión.

**Cliente (`user`):** checkout (dirección, forma de pago, notas), historial de sus pedidos y cancelación mientras estén en `PENDIENTE`.

**Administrador (`admin`):** resumen de pedidos, ABM de categorías y productos (stock y disponibilidad), gestión de pedidos con filtro por estado, activar/desactivar usuarios.

### Reglas de negocio implementadas

- **RN-01** Creación de pedido transaccional: valida stock, toma nombre y precio del servidor, copia las líneas y descuenta stock con bloqueo de fila; si algo falla se hace rollback completo.
- **RN-02** Máquina de estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`; se puede cancelar desde `PENDIENTE` o `EN_PREPARACION`. `ENTREGADO` y `CANCELADO` son finales.
- **RN-03** Al cancelar un pedido se restituye el stock.
- **RN-04** Permisos por rol y propietario: un cliente solo ve y cancela sus propios pedidos (404 si no son suyos); el cambio de estado, el resumen y la gestión de usuarios son solo admin.
- **RN-05** Las líneas del pedido conservan nombre y precio del momento de la compra.
- **RN-06** Validación de datos de entrada en el backend (422) y en los formularios del frontend.
- Baja lógica de categorías, productos y usuarios; un administrador no puede desactivarse a sí mismo.

### Seguridad

JWT en cookie `access_token` `HttpOnly` (el frontend nunca ve el token), contraseñas con bcrypt, CORS restringido al origen del frontend con credenciales, rutas protegidas en el frontend (`ProtectedRoute`) **y** en el backend (`get_current_user` / `require_role`). Un 401 o una cuenta desactivada cierran la sesión desde el interceptor de Axios.

## Endpoints principales (prefijo `/api/v1`)

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register`, `/auth/token`, `/auth/logout` | público / sesión |
| GET | `/auth/me` | sesión |
| GET | `/categorias`, `/productos` | público |
| POST/PUT/DELETE | `/categorias`, `/productos`, PATCH `/productos/{id}/stock` | admin |
| POST | `/pedidos` | sesión |
| GET | `/pedidos`, `/pedidos/{id}` | sesión (cliente: los propios; admin: todos) |
| PATCH | `/pedidos/{id}/cancelar` | dueño del pedido |
| PATCH | `/pedidos/{id}/estado`, GET `/pedidos/resumen` | admin |
| GET / POST | `/admin/usuarios`, `/admin/usuarios/{id}/activar`, `/admin/usuarios/{id}/desactivar` | admin |

El detalle completo con esquemas está en `/docs`.

## Solución de problemas

- **`connection refused` al iniciar el backend:** PostgreSQL no está corriendo o `DATABASE_URL` es incorrecta.
- **Error de CORS o login que "no guarda" la sesión:** `FRONTEND_ORIGIN` debe coincidir exactamente con la URL del frontend (`http://localhost:5173`, no `127.0.0.1`).
- **El frontend no trae datos:** revisar `VITE_API_URL` y que el backend esté levantado.
