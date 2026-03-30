# Plan Maestro Portafolio: Alineación, Robustez, Funcionalidad y UX Premium (4-6 semanas)

## Resumen
- Objetivo: convertir el proyecto en un e-commerce automotriz profesional, estable y demostrable en portafolio, con B2C completo, B2B funcional, backoffice React, pagos Webpay sandbox sólidos, documentación seria y flujo de trabajo agent-first.
- Estrategia técnica acordada: evolución incremental (sin reescritura total), Docker como base operativa, Postgres en todos los entornos, PRs pequeños por etapa, documentación en español.
- Resultado esperado: repo productivo para mostrar en entrevistas (arquitectura clara, seguridad, pruebas, CI/CD, UX superior, y proceso de ingeniería visible).

## Cambios de Implementación (orden exacto)

1. **Fase 0: Fundaciones de ingeniería (Semana 1)**
- Normalizar repositorio raíz como proyecto único versionado (sin artefactos temporales/versionados innecesarios).
- Definir estructura de entornos con `Docker Compose` (frontend, backend, postgres, reverse proxy opcional) y variables por entorno (`.env.example` completos).
- Establecer convenciones de rama/commits/PR y baseline de calidad (lint, formato, tests, build).
- Entregable: entorno reproducible con `docker compose up` + guía de arranque limpia.

2. **Fase 1: Corrección de desalineaciones críticas (Semana 1-2)**
- Seguridad:
  - Sacar secretos hardcodeados y rotar credenciales expuestas.
  - Desactivar registro de `admin` por endpoint público.
  - Restringir CORS, hosts y modo debug por entorno.
- Autenticación/pagos:
  - Corregir consistencia de claves de token y refresh en frontend/backend.
  - Mantener Webpay como único flujo real y dejar `payments/` como interno/deprecado para evitar bypass de negocio.
  - Endurecer commit de pago (validación, idempotencia, estados válidos, manejo de errores robusto).
- Datos y flujo:
  - Ajustar stock/pedido/pago con transacciones claras y estados coherentes.
- Entregable: flujo login->carrito->orden->webpay->confirmación estable y sin atajos inseguros.

3. **Fase 2: Robustez del sistema (Semana 2-3)**
- Migrar BD operativa a Postgres en local/stage/prod y crear estrategia de semillas.
- Implementar permisos por rol reales (customer/distributor/admin) con guardas backend, no solo frontend.
- Añadir logging estructurado, endpoint healthcheck, manejo de errores consistente y trazabilidad mínima de operaciones de pago/pedido.
- Implementar pruebas automatizadas backend (servicios críticos, permisos, pagos, órdenes, stock).
- Entregable: backend confiable, observable y defendible técnicamente.

4. **Fase 3: Funcionalidad faltante (Semana 3-4)**
- B2B real:
  - Catálogo mayorista funcional (filtros, precios/condiciones por rol, reglas de acceso).
- Backoffice React dedicado:
  - Gestión de productos, categorías, pedidos, usuarios/roles, estados de pago.
  - Vista de métricas básicas (ventas, órdenes, stock crítico).
- Perfil de usuario:
  - Historial de pedidos robusto, estados claros y navegación consistente.
- Entregable: módulo admin y B2B operativos, no placeholders.

5. **Fase 4: UI/UX “Automotriz Premium” (Semana 4-5)**
- Crear design system (tokens, tipografía, escala espaciado, componentes reutilizables, estados).
- Rediseñar flujos clave: home, catálogo, detalle, carrito, checkout, perfil, admin.
- Mejorar UX funcional: carga/skeletons, errores útiles, vacíos, feedback de acciones, responsive real, accesibilidad básica (teclado/contraste/semántica).
- Entregable: experiencia visual y de interacción claramente de nivel portafolio.

6. **Fase 5: Documentación profesional + modo agente (Semana 5-6)**
- Documentación de producto/arquitectura/operación:
  - README raíz completo, arquitectura, setup local, despliegue Docker, troubleshooting, roadmap.
  - Documentación API (OpenAPI/Swagger) y flujos de negocio.
- Marco agent-first:
  - `AGENTS.md` con contexto del dominio, mapa del sistema, comandos canónicos, Definition of Done y guardrails.
  - Catálogo de skills/procedimientos del proyecto (checklists de backend, frontend, seguridad, UI, PR).
  - Mapa de MCPs y cuándo usar cada uno (GitHub, Vercel/infra, navegador, docs), más plantillas de briefing para agentes.
- Proceso de colaboración:
  - Plantillas de PR/Issue, checklist de evidencia (capturas, pruebas, riesgos, rollback), criterios de aceptación por tipo de cambio.
- Entregable: repo listo para colaboración inteligente y trabajo eficaz con agentes.

## Cambios clave en APIs/Interfaces públicas
- **Auth**
  - Contrato estable de tokens y refresh (nombres de storage y rutas unificadas).
  - Registro público limitado a `customer/distributor`; `admin` solo por semilla/comando interno.
- **Catálogo**
  - `GET /api/products` con filtros consistentes (`q`, `category`, canal B2C/B2B) y paginación uniforme.
- **Pedidos/Pagos**
  - `POST /api/orders` mantiene creación desde carrito.
  - `POST /api/webpay/init` y `POST /api/webpay/commit` como flujo oficial.
  - `POST /api/payments` marcado como interno/deprecado o protegido para no saltarse validaciones.
- **Backoffice**
  - Nuevos endpoints admin para CRUD de productos/categorías, gestión de pedidos/pagos, usuarios/roles y métricas básicas.
- **Frontend**
  - Separación clara entre app pública y backoffice React; guards por rol respaldados por backend.

## Plan de PRs (atómicos y con sentido)
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

Cada PR debe incluir: objetivo, alcance acotado, evidencia de pruebas, impacto en API, riesgos y rollback.

## Plan de pruebas y criterios de aceptación
- Backend:
  - Unit + integración para auth, permisos, carrito, creación de orden, stock, init/commit Webpay, errores y reintentos.
- Frontend:
  - Pruebas de componentes críticos + pruebas E2E de flujos completos (login, compra, pago, perfil, admin).
- Calidad automática (CI):
  - lint + type checks + tests + build frontend/backend + smoke de contenedores.
- Criterio de “Done” por etapa:
  - sin regresiones en flujo de compra, cobertura mínima en módulos críticos, docs actualizadas, checklist PR completo.

## Supuestos y decisiones cerradas
- Se mantiene arquitectura incremental (Django + React), sin migrar a Next.js en esta etapa.
- Infra objetivo: Docker (local y despliegue), no demo solo local.
- Base de datos: Postgres en todos los entornos.
- Pagos: Webpay sandbox robusto como caso oficial de portafolio.
- Roles: registro público sin `admin`; elevación solo interna.
- Alcance funcional: B2C + B2B + backoffice admin avanzado.
- UX visual: línea automotriz premium.
- Documentación principal: español.
- Modo de trabajo: PRs pequeños, trazables y orientados a evidencia.
