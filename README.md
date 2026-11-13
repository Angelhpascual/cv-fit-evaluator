# Evaluador de encaje CV–oferta

**Demo en vivo: https://cv-fit-evaluator.vercel.app**

Pegas una oferta de empleo y un CV, y la aplicación devuelve una **puntuación de 0 a 100 con una rúbrica fija**, las **carencias reales** y un **veredicto** (aplicar, dudoso o descartar). El análisis llega por **streaming**.

> **Estado: modo demo.** Las respuestas están **grabadas**, no las genera un modelo en tiempo real, y los tres ejemplos (candidata, empresas y ofertas) son **ficticios**. Con un texto distinto de los ejemplos, la aplicación lo dice en lugar de inventarse una evaluación. El modo real con la API de Claude está en la hoja de ruta y **todavía no existe**.

## La rúbrica

| Apartado | Máximo |
|---|---|
| Encaje técnico | 50 |
| Nivel y años | 15 |
| Idioma | 10 |
| Condiciones | 15 |
| Señales | 10 |

Veredicto: **aplicar** desde 70 puntos, **dudoso** de 50 a 69, **descartar** por debajo de 50. Una evaluación que no es "aplicar" debe explicar al menos una carencia, y **no se da por supuesta experiencia que el CV no recoge**.

## Cómo se ejecuta

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # pruebas unitarias con Vitest
npm run test:e2e # pruebas de extremo a extremo con Playwright
npm run typecheck
npm run lint
npm run build
```

Requiere Node 20.19 o superior (probado con Node 22).

## Cómo está hecho

- **Next.js** (App Router) y **TypeScript** estricto.
- `POST /api/evaluate` devuelve un stream de líneas JSON (`text`, `result`, `notice`, `error`). El cliente lo lee con `ReadableStream`.
- Un **proveedor** devuelve los eventos. Hoy solo existe el de demo (`src/lib/providers/mock.ts`); el real tendrá la misma interfaz.
- Interfaz accesible: etiquetas en los campos, región con `aria-live` para el análisis, foco visible y tema claro y oscuro.

```
src/
  app/                    página y ruta /api/evaluate
  components/             tarjeta de resultado
  lib/
    rubric.ts             puntuación, veredicto y validación
    examples.ts           ejemplos ficticios del modo demo
    providers/mock.ts     proveedor de demo
```

## Pruebas

**Extremo a extremo (Playwright, 7 casos):** abren la aplicación en un navegador real y comprueban el flujo completo: que el botón se activa solo con oferta y CV, que cada ejemplo da su puntuación y veredicto, que las carencias se listan, que el análisis aparece **antes** que el resultado (streaming) y que un texto desconocido avisa sin inventar nada. La primera vez hace falta `npx playwright install chromium`.

**Unitarias (Vitest, 28 casos):** hay pruebas de la rúbrica, del proveedor de demo y de la **integridad de los ejemplos**. Estas últimas actúan como evaluaciones: comprueban que cada caso grabado sigue la rúbrica (suma coherente, veredicto correcto, carencias presentes) y que no se asume experiencia ausente del CV. Añadir un caso nuevo a `examples.ts` lo incorpora automáticamente.

## Hoja de ruta

- [ ] Modo real con la API de Claude (streaming de verdad), activable por una clave.
- [ ] Más casos de evaluación y métricas de coste y variación entre ejecuciones.
- [ ] Un servidor MCP con las mismas herramientas.

## Sobre la clave de API en el modo real

Cuando exista el modo real, una clave que el visitante aporte **viajaría a través de la ruta del servidor** hacia la API, y no se guardaría ni se registraría. No es una llamada directa desde el navegador. Se documentará así cuando se implemente.

## Privacidad

No se guarda ningún dato que se escriba en la página.
