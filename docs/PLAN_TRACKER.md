# Plan Tracker Portafolio

Estado de ejecucion del plan maestro (actualizado al 2026-03-29).

## Fase 0 - Fundaciones
- [x] Docker Compose para frontend/backend/postgres.
- [x] Variables por entorno (`.env.example` + uso de `backend/.env` y `frontend/.env`).
- [x] Baseline CI con checks backend/frontend y smoke docker.

## Fase 1 - Desalineaciones criticas
- [x] Registro publico sin rol admin.
- [x] Contrato de tokens alineado frontend/backend.
- [x] Endpoint `payments/` deprecado/protegido.
- [x] Flujo de orden y stock con validaciones y transaccion.

## Fase 2 - Robustez
- [x] Postgres como default operacional.
- [x] RBAC backend para admin/distributor.
- [x] Healthcheck + logging estructurado.
- [x] Tests backend criticos.
- [x] OpenAPI schema + Swagger + ReDoc.

## Fase 3 - Funcionalidad faltante
- [x] Catalogo B2B funcional con precio efectivo.
- [x] Backoffice admin React con metricas y gestion base.
- [x] Perfil de usuario con historial de pedidos.

## Fase 4 - UI/UX premium
- [x] Design system visual (tokens, tipografia, espaciado, radios, sombras, estados).
- [x] Rediseño de flujos clave: home, catalogo, detalle, carrito, orden/checkout, perfil y admin.
- [x] UX funcional: loading skeletons, empty/error states, responsive y foco accesible.

## Fase 5 - Documentacion + modo agente
- [x] README raiz + docs API + playbook agente + mapa MCP.
- [x] `AGENTS.md` con DoD, comandos y guardrails.
- [x] Plantillas PR/Issue.
- [x] Bootstrap de demo (`python manage.py bootstrap_portfolio`).
- [x] E2E Playwright para flujos clave.

## Plan PR sugerido (orden)
1. `chore/foundations-docker-env-quality-gates`
2. `fix/security-secrets-roles-auth-alignment`
3. `fix/payments-webpay-hardening-idempotency`
4. `feat/postgres-migration-seeds-health-logging`
5. `feat/rbac-permissions-enforcement`
6. `feat/tests-backend-critical-flows`
7. `feat/b2b-catalog-functional`
8. `feat/admin-app-core-modules`
9. `feat/admin-metrics-and-ops`
10. `feat/uiux-design-system-core`
11. `feat/uiux-end-to-end-flow-polish`
12. `docs/portfolio-agent-framework-and-playbooks`

## Evidencia minima por PR
- Objetivo y alcance.
- Pruebas ejecutadas.
- Impacto API/UI.
- Riesgos y rollback.
