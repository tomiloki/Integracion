# Agent Playbook

## 1. Antes de editar
- Leer `AGENTS.md` y `docs/API.md`.
- Confirmar alcance del ticket/issue.
- Identificar contratos impactados.

## 2. Durante la implementacion
- Hacer cambios pequenos por dominio (auth, pagos, UI, etc).
- Ejecutar checks locales de forma incremental.
- Mantener consistencia de roles y estados.

## 3. Antes de cerrar
- `backend`: check + tests.
- `frontend`: build.
- Actualizar docs.
- Preparar resumen con riesgos y rollback.

## 4. Plantilla de briefing para agentes
Usar esta estructura:
1. Objetivo puntual
2. Alcance permitido
3. Archivos clave
4. Criterios de aceptacion
5. Riesgos a vigilar
6. Evidencia requerida

## 5. Anti-patrones
- Mezclar refactor amplio + feature + fixes en un solo PR.
- Cambiar contratos sin documentar.
- Introducir secretos en codigo o ejemplos.
