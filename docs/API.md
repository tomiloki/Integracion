# API reference (resumen)

## OpenAPI
- Schema JSON: `GET /api/schema/`
- Swagger UI: `GET /api/docs/swagger/`
- ReDoc: `GET /api/docs/redoc/`

## Auth
- `POST /api/register/`
  - body: `username`, `email`, `password`, `role`
  - role permitido: `customer`, `distributor`

- `POST /api/token/`
  - body: `username`, `password`
  - response incluye JWT con claims `role` y `username`

- `POST /api/token/refresh/`
  - body: `refresh`

## Catalogo
- `GET /api/products/`
  - query opcional: `q`, `search`, `category`, `channel`
  - `channel=b2b` requiere rol `distributor` o `admin`

- `GET /api/catalog/`
  - alias de listado de catalogo

## Carrito
- `GET /api/cart/`
- `POST /api/cart/` (`product_id`, `quantity`)
- `PATCH /api/cart/{id}/` (`quantity`)
- `DELETE /api/cart/{id}/`

## Ordenes
- `POST /api/orders/`
- `GET /api/orders/{id}/`
- `GET /api/orders/user/`

## Pagos
- `POST /api/webpay/init/` (`order_id`)
- `POST /api/webpay/commit/` (`token_ws`)

Notas:
- `POST /api/payments/` esta deprecado y responde `410`.

## Perfil
- `GET /api/users/me/`

## Admin (requiere rol admin)
- `GET /api/admin/metrics/`
- `GET/POST/PATCH /api/admin/products/`
- `GET/POST /api/admin/categories/`
- `GET/PATCH /api/admin/orders/`
- `GET/PATCH /api/admin/users/`

## Health
- `GET /api/health/`

## Convenciones
- Autenticacion por `Authorization: Bearer <access_token>`.
- Paginacion por defecto en listados DRF (`count`, `next`, `previous`, `results`), salvo endpoints explicitamente sin paginacion.
