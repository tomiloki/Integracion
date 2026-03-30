# Frontend AutoParts

Aplicacion React para experiencia publica (B2C), canal B2B y backoffice admin.

## Requisitos
- Node 20+
- Backend API disponible en `http://localhost:8000/api`

## Variables
Crear `frontend/.env` desde `frontend/.env.example`:

```bash
copy .env.example .env
```

Variables principales:
- `REACT_APP_API_URL`
- `REACT_APP_TOKEN_KEY_ACCESS`
- `REACT_APP_TOKEN_KEY_REFRESH`

## Scripts
- `npm start`: desarrollo local.
- `npm run lint`: chequeo de estilo.
- `npm run test:ci`: pruebas unitarias/componentes.
- `npm run build`: build produccion.
- `npm run e2e`: pruebas end-to-end Playwright.

## E2E (Playwright)
Primero instalar navegador una vez:

```bash
npx playwright install chromium
```

Luego ejecutar:

```bash
npm run e2e
```

Opcionalmente puedes definir:
- `E2E_BASE_URL` (default `http://127.0.0.1:3000`)
- `E2E_API_URL` (default `http://127.0.0.1:8000/api`)

## Flujos cubiertos por E2E
- Registro + login + perfil.
- Compra basica: carrito -> creacion de orden.
- Proteccion de ruta admin para usuarios no autenticados.
