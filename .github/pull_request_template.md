# Pull Request Checklist

## Objetivo
- [ ] El objetivo del PR esta explicado en 2-4 lineas.

## Alcance
- [ ] El cambio esta acotado y no mezcla multiples iniciativas.
- [ ] Se detallan endpoints, contratos o componentes afectados.

## Calidad
- [ ] Backend: `python manage.py check` y `python manage.py test` ejecutados.
- [ ] Frontend: `npm run build` ejecutado.
- [ ] No se subieron secretos ni artefactos temporales.

## Evidencia
- [ ] Incluye evidencia (capturas, ejemplos API, logs) cuando aplica.

## Riesgos y rollback
- [ ] Riesgos identificados.
- [ ] Plan de rollback descrito.
