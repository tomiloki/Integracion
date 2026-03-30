# AutoParts Integracion

Proyecto full-stack de e-commerce automotriz orientado a portafolio profesional.

## Stack
- Backend: Django + DRF + JWT + Webpay (sandbox)
- Frontend: React + React Router + Axios
- DB: PostgreSQL (entorno estandar)
- Infra local: Docker Compose
- CI: GitHub Actions

## Arquitectura
- `backend/`: API REST, autenticacion, carrito, ordenes, pagos y backoffice.
- `frontend/`: app publica (B2C), canal B2B y backoffice admin React.
- `docs/`: guias de operacion, API y framework de trabajo con agentes.

## Inicio rapido (Docker)
1. Copiar variables:
   - `copy .env.example .env`
   - `copy backend\.env.example backend\.env`
   - `copy frontend\.env.example frontend\.env`
2. Configurar secretos del proyecto (especialmente `DJANGO_SECRET_KEY`).
   - Webpay queda listo por defecto con credenciales publicas de integracion (sandbox).
3. Levantar stack:
```bash
docker compose up --build
```
4. URLs:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- Healthcheck: `http://localhost:8000/api/health/`
- OpenAPI schema: `http://localhost:8000/api/schema/`
- Swagger UI: `http://localhost:8000/api/docs/swagger/`
- ReDoc: `http://localhost:8000/api/docs/redoc/`

## Bootstrap demo (portfolio)
Con stack levantado:
```bash
docker compose exec backend python manage.py bootstrap_portfolio
```

Para resetear stock demo completo del catalogo (util despues de varias compras QA):
```bash
docker compose exec backend python manage.py bootstrap_portfolio --reset-stock
```

Este comando:
- Carga `api/fixtures/products.json` si no hay productos.
- Crea/actualiza usuarios demo `admin_portfolio`, `cliente_demo`, `dist_demo`.
- Reequilibra stock agotado (o todo el catalogo con `--reset-stock`).
- Permite override por variables `PORTFOLIO_*` en `backend/.env`.

## Endpoints clave
- Auth: `POST /api/token/`, `POST /api/token/refresh/`, `POST /api/register/`
- Catalogo: `GET /api/products/` (`q`, `category`, `channel=b2b`)
- Carrito: `GET/POST /api/cart/`, `PATCH/DELETE /api/cart/{id}/`
- Ordenes: `POST /api/orders/`, `GET /api/orders/{id}/`, `GET /api/orders/user/`
- Webpay: `POST /api/webpay/init/`, `POST /api/webpay/return/`, `POST /api/webpay/commit/`
- Backoffice admin:
  - `GET /api/admin/metrics/`
  - `GET/POST/PATCH/DELETE /api/admin/products/`
  - `GET/POST/DELETE /api/admin/categories/`
  - `GET/PATCH /api/admin/orders/`
  - `GET/PATCH /api/admin/payments/`
  - `GET/PATCH /api/admin/users/`

## Roles
- `customer`: compra retail.
- `distributor`: acceso a canal B2B.
- `admin`: backoffice y administracion.

Nota: el registro publico solo permite `customer` y `distributor`.

Flujo de compra:
- `POST /api/orders/` prepara la orden para pago.
- El carrito se mantiene hasta pago exitoso.
- Stock y conciliacion de carrito se aplican en `POST /api/webpay/commit/` autorizado.

## Calidad y pruebas
Backend:
```bash
cd backend
python manage.py check
python manage.py test
```

Frontend:
```bash
cd frontend
npm ci
npm run build
npm run test:ci
npm run e2e
```

## Observabilidad
- Logs backend en formato JSON estructurado.
- Header de correlacion `X-Request-ID` en todas las respuestas API.
- Eventos criticos trazados: creacion de orden, init/commit Webpay y cambios admin de pagos.

## Flujo de trabajo recomendado
0. Inicializar git (si el directorio no esta versionado):
```bash
git init
```
1. Crear rama con alcance acotado.
2. Implementar cambios pequenos y verificables.
3. Abrir PR con evidencia de pruebas y riesgos.
4. Usar checklist de `.github/pull_request_template.md`.

## Roadmap resumido
- Seguridad y configuracion por entorno: completado.
- Robustez backend + Webpay + RBAC: completado base.
- B2B y backoffice React: completado base funcional.
- Refinamiento UI/UX premium (Fase 4): completado base + iteracion continua.
- Mejor cobertura frontend E2E y observabilidad avanzada: siguiente iteracion.

## Documentacion relacionada
- [API](docs/API.md)
- [Contribucion](CONTRIBUTING.md)
- [AGENTS](AGENTS.md)
- [Playbook de agentes](docs/AGENT_PLAYBOOK.md)
- [Mapa MCP](docs/MCP_MAP.md)
- [Tracker del plan](docs/PLAN_TRACKER.md)
- [Plan visual Fase 4](docs/UIUX_PHASE4_PLAN.md)
- [Auditoria final](docs/FINAL_AUDIT.md)
