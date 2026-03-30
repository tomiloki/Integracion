# Fase 4 Visual Plan - AutoParts Premium

## Visual thesis
Interfaz de taller premium: metal pulido + contraste alto + acento cobre, con sensacion de precision tecnica y velocidad operativa.

## Content plan
1. Hero fuerte y reconocible por marca.
2. Soporte con propuesta de valor concreta.
3. Flujo de compra limpio (catalogo -> detalle -> carrito -> orden).
4. Backoffice de operacion con lectura rapida de estado.
5. Cierre con CTA y navegacion clara.

## Interaction thesis
- Entrada con reveal vertical suave en hero y secciones.
- Hover de producto con elevacion controlada (sin ruido).
- Estados de carga/espera consistentes con skeleton y feedback.

## Tokens del design system
- Tipografias: `Rajdhani` (display) + `Manrope` (UI/body).
- Color base: grafito/negro tecnico.
- Acento: cobre/amber automotriz.
- Radios y sombras sobrias, sin look "template".

## Tooling seleccionado
- Skill creativa: `frontend-skill`.
- Skill de validacion: `web-design-guidelines`.
- Plugin habilitado para iteracion futura: Figma/Canva.
- Libreria de motion instalada: `framer-motion`.

## Accessibility and UX commitments
- Skip link + `focus-visible` notorio.
- Botones y controles con `aria-label` cuando corresponde.
- Estados vacios/errores/carga en flujos criticos.
- Layout responsive desde 360px hasta desktop.
- `prefers-reduced-motion` respetado.

## Pages in scope
- Home
- Catalog
- Product Detail
- Cart
- Order Summary
- Checkout Success
- Profile
- Admin Dashboard
- Navbar + Footer

## Non-goals (this phase)
- Reescritura de arquitectura frontend.
- Cambio de stack (CRA -> Next.js).
- Animaciones complejas que degraden performance.
