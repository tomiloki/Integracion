# Auditoria de readiness para portfolio (2026-05-08)

## Alcance validado
- Flujo B2C/B2B/backoffice identificado como base principal del portfolio.
- Seguridad de dependencias runtime frontend revisada con `npm audit --omit=dev --audit-level=moderate`.
- Contrato publico de catalogo ajustado para no exponer campos internos.
- Commit Webpay ajustado para devolver una respuesta publica minima.
- CI alineado para ejecutar e2e Playwright contra el stack Docker.

## Evidencia local de esta iteracion
- Backend:
  - `python manage.py makemigrations --check --dry-run` -> OK, sin cambios pendientes.
  - `python manage.py check` -> OK.
  - `python manage.py test` -> OK, 19 tests.
- Frontend:
  - `npm run lint` -> OK.
  - `npm run test:ci -- --passWithNoTests` -> OK, 6 tests.
  - `npm audit --omit=dev --audit-level=moderate` -> OK, 0 vulnerabilidades runtime.
- No se ejecuto build local por regla del repo; queda validado por CI.

## Cambios cerrados
- Presentacion publica:
  - README reescrito para portfolio profesional.
  - Manifest, favicon y logos reemplazados por branding AutoParts.
  - Placeholders visuales agregados en `docs/assets/screenshots/`.
- Backend/API:
  - `Product.price` y `Product.quantity` protegidos con validadores y constraints.
  - Serializer publico de productos ya no expone `internal_code` ni `author`.
  - Webpay commit devuelve payload minimo (`payment`, `commit`, `already_committed`).
- Frontend:
  - Checkout success consulta el detalle autenticado de orden cuando el commit solo devuelve payload minimo.
  - Tests frontend ampliados para rutas protegidas, login, catalogo, carrito/card y navbar.
  - Backoffice separado en hook + componentes de seccion.
- CI:
  - Docker smoke ahora instala dependencias e2e y ejecuta Playwright contra el stack.
  - `docker-compose.yml` expone al frontend la URL API segun `BACKEND_HOST_PORT` y al backend los origenes CORS segun `FRONTEND_HOST_PORT` para CI/local.
- Seguridad:
  - `.env.example` y defaults de bootstrap ya no incluyen claves Webpay ni passwords realistas.

## Riesgos residuales
- CRA/react-scripts sigue como toolchain dev; runtime audit queda limpio, pero una migracion futura a Vite mejoraria mantenimiento.
- Webpay sandbox externo puede tener latencia o indisponibilidad; e2e evita depender del pago externo completo.
- JWT sigue en `localStorage` por simplicidad demo; README documenta el tradeoff.
