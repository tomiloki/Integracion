# Contribuir al proyecto

## Convenciones de ramas
- `chore/...`
- `fix/...`
- `feat/...`
- `docs/...`

Ejemplos:
- `fix/security-auth-alignment`
- `feat/admin-dashboard-metrics`

## Convencion de commits
Formato sugerido (Conventional Commits):
- `feat: agrega gestion de pedidos en backoffice`
- `fix: corrige refresh token en frontend`
- `docs: actualiza guia de despliegue docker`

## Checklist antes de abrir PR
1. Backend:
   - `python manage.py check`
   - `python manage.py test`
2. Frontend:
   - `npm ci`
   - `npm run build`
3. Verificar que no se suban secretos ni archivos temporales.
4. Actualizar documentacion si cambian contratos API o flujos.

## Definition of Done
- Cumple criterio funcional esperado.
- Incluye pruebas o evidencia reproducible.
- No rompe contratos existentes sin documentarlo.
- Riesgos y rollback descritos en PR.
