# TBA backend API

Base REST sin interfaz gráfica: Next.js 16 App Router, TypeScript, Prisma 7 y PostgreSQL. Todas las rutas públicas están versionadas bajo `/api/v1`.

## Inicio

1. Copia `.env.example` a `.env` y define una URL PostgreSQL y un secreto HMAC de al menos 32 caracteres.
2. Ejecuta `npm install`, `npm run db:generate` y `npm run db:migrate -- --name init`.
3. Crea un tenant: `npm run db:provision-tenant -- 123`.
4. Inicia la API con `npm run dev`.

## Docker

El entorno local de Compose utiliza [Dockerfile.dev](Dockerfile.dev), monta el repositorio en `/app` para reflejar cambios de código sin reconstruir y guarda tanto PostgreSQL como `node_modules` en `./.docker/` (ignorados por Git). Se une a la red Docker externa compartida `terrabot`; ya existe en este equipo. En otro equipo, créela una sola vez:

```bash
docker network create terrabot
cp .env.example .env
docker compose up --build
```

La API queda en `http://localhost:3000`, y PostgreSQL se expone como `localhost:5433`. Dentro de la red, otros contenedores pueden resolver `api` y `postgres`. Compose sustituye `DATABASE_URL` para apuntar al servicio `postgres`; conserva en `.env` los valores HMAC.

Para producción, construya una imagen inmutable sin bind mounts:

```bash
docker build -f Dockerfile.prod -t tba-backend-api:latest .
docker run --rm --env-file .env --network terrabot -p 3000:3000 tba-backend-api:latest
```

En producción, `DATABASE_URL` debe apuntar a PostgreSQL gestionado o a un contenedor de la red `terrabot`, y las migraciones se aplican explícitamente con `npm run db:deploy` en un job o contenedor de despliegue.

`db:generate` y `db:pull` modifican solo archivos locales (el segundo reescribe el schema Prisma). `db:migrate` aplica cambios a la base; `db:studio` no modifica datos por sí mismo. La provisión crea un esquema y tabla `users`, más el registro público del tenant.

## Endpoints

- `GET /api/v1/health` no requiere HMAC.
- `GET /api/v1/users?page=1&pageSize=20`, `POST /api/v1/users` y `GET /api/v1/users/:id` requieren `tenantid`, `x-key-id`, `x-timestamp`, `x-nonce` y `x-signature`.

Respuestas exitosas: `{ "success": true, "data": ..., "meta": ... }`. Los errores tienen `code`, `message` y `details`.

## HMAC de solicitudes

La firma es HMAC-SHA256 hexadecimal de estas líneas:

```text
METHOD
PATH
QUERY_ORDENADA
TIMESTAMP
TENANTID (vacío para public)
NONCE
SHA256_DEL_CUERPO_CRUDO
```

`x-timestamp` usa segundos Unix; `x-nonce` tiene 16–128 caracteres URL-safe y se registra en `public.hmac_nonces` para impedir replays. `x-key-id` identifica la clave configurada; `HMAC_ALLOWED_TENANT_IDS` limita sus tenants autorizados.

```bash
curl http://localhost:3000/api/v1/health
```

## Aislamiento multi-tenant

Prisma administra solo el catálogo `public` (`tenants` y nonces). Prisma no permite cambiar de forma segura el esquema de modelos generados por petición: `@@schema` es estático al generar el cliente. Por ello `TenantDatabaseService` resuelve el esquema exclusivamente desde `public.tenants`, abre una transacción de `pg` y ejecuta `set_config('search_path', ..., true)`. `SET LOCAL` dura solo esa transacción: el pool no reutiliza contexto de otro tenant. Los valores de usuarios siguen siendo parámetros PostgreSQL y el esquema se valida antes de usarse.

En producción, reemplace la identidad HMAC configurada por KMS o un almacén de claves rotadas. Para múltiples instancias, el registro de nonces en PostgreSQL conserva la protección anti-replay compartida.

## Calidad

Ejecute `npm run test`, `npm run lint` y `npm run build`. Las pruebas unitarias cubren excepciones, validación y HMAC. La prueba de integración de aislamiento se activa con `TEST_DATABASE_URL` y crea/elimina dos esquemas temporales; use una PostgreSQL desechable.
