# AGENTS.md

Guia operativa para agentes (humanos o AI) que trabajen en este repo.

## Objetivo del sistema
AutoParts es un e-commerce automotriz con tres canales:
- B2C cliente final
- B2B distribuidor
- Backoffice administrativo

## Fuentes de verdad
- Backend API: `backend/api/`
- Frontend app: `frontend/src/`
- Configuracion de entorno: `backend/backend/settings.py`, `backend/.env.example`, `frontend/.env.example`
- Flujos operativos: `docs/`

## Reglas de trabajo
1. Nunca commitear secretos ni credenciales.
2. No romper contratos de API sin actualizar `docs/API.md`.
3. Mantener cambios pequenos y trazables.
4. Priorizar seguridad y consistencia de estados de orden/pago.
5. Ejecutar checks minimos antes de proponer merge.

## Comandos canonicos
Backend:
```bash
cd backend
python manage.py check
python manage.py test
python manage.py bootstrap_portfolio --force-passwords
python manage.py bootstrap_portfolio --reset-stock
```

Frontend:
```bash
cd frontend
npm ci
npm run lint
npm run test:ci
npm run build
npm run e2e
```

Docker stack:
```bash
docker compose up --build
```

Documentacion API viva:
```text
http://localhost:8000/api/docs/swagger/
```

## Definition of Done por cambio
- El cambio es funcional y verificable.
- Hay evidencia de test/build o razon clara si no aplica.
- Docs actualizadas si cambia comportamiento publico.
- Riesgos conocidos documentados.

## Guardrails para agentes
- No ejecutar comandos destructivos masivos fuera del alcance solicitado.
- No modificar credenciales productivas.
- Evitar refactors cosmeticos sin impacto funcional.
- Si detectas inconsistencia critica, prioriza correccion y documenta.

## Modo de entrega sugerido
1. Resumen ejecutivo del cambio.
2. Archivos tocados y razon.
3. Evidencia de pruebas.
4. Riesgos/residuales y siguientes pasos.
