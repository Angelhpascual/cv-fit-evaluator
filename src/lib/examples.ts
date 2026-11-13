import { totalScore, verdictFor } from "./rubric";
import { Breakdown, Evaluation } from "./types";

/**
 * Ejemplos del modo demo. Todo es FICTICIO: la candidata, las empresas y las
 * ofertas. Las respuestas están grabadas (no las genera un modelo en tiempo
 * real), pero siguen la misma rúbrica y el mismo formato que usaría el modo real.
 */

export interface Example {
  id: string;
  label: string;
  job: string;
  cv: string;
  /** Texto que se emite por streaming antes del resultado. */
  analysis: string;
  evaluation: Evaluation;
}

function build(
  breakdown: Breakdown,
  matches: string[],
  gaps: string[],
): Evaluation {
  const score = totalScore(breakdown);
  return { score, verdict: verdictFor(score), breakdown, matches, gaps };
}

export const SAMPLE_CV = `Alex Rivera — Frontend Engineer
Madrid, España · remoto · alex.rivera@example.com

Resumen
Ingeniera frontend con 7 años de experiencia en React y TypeScript. Foco en accesibilidad (WCAG 2.1), rendimiento y testing automatizado.

Experiencia
- Frontend Engineer, Tienda Norte (2021 – actualidad): aplicación de comercio electrónico en React, Redux y TypeScript; biblioteca de componentes en Storybook; tests con Jest, React Testing Library y Playwright.
- Desarrolladora Frontend, Estudio Delta (2018 – 2021): sitios y aplicaciones web con React y Next.js; integración con APIs REST; algo de Node.js para scripts y un BFF sencillo.

Competencias
React, TypeScript, Next.js, Redux, Storybook, Jest, React Testing Library, Playwright, accesibilidad (WCAG), CI con GitHub Actions.

Idiomas
Español (nativo), inglés B2.`;

const JOB_REACT = `Senior Frontend Engineer (React) — Acme Learning
Remoto desde España · 45.000–55.000 € brutos/año

Buscamos una persona con 5+ años de experiencia con React y TypeScript para construir nuestra plataforma educativa.
Requisitos: React y TypeScript, testing automatizado (Jest, React Testing Library, Playwright), accesibilidad, experiencia con sistemas de diseño.
Valorable: GraphQL.
Inglés: B2 o superior.`;

const JOB_FULLSTACK = `Full Stack Engineer (TypeScript) — Nimbus Data
Remoto en Europa · 50.000–60.000 € brutos/año

4+ años con TypeScript en frontend y backend.
Requisitos: React, Node.js y NestJS, PostgreSQL, AWS, Docker y Kubernetes.
Inglés fluido, trabajo diario con un equipo internacional.`;

const JOB_JAVA = `Backend Engineer (Java / Spring) — Orion Bank
Híbrido en Madrid, 3 días en oficina · 40.000–48.000 € brutos/año

Requisitos: 5+ años con Java y Spring Boot, microservicios, Oracle, Kafka.
Valorable: Kubernetes.
Inglés: B1.`;

export const EXAMPLES: Example[] = [
  {
    id: "react-senior",
    label: "Frontend React senior (encaje alto)",
    job: JOB_REACT,
    cv: SAMPLE_CV,
    analysis:
      "La oferta pide React y TypeScript con 5+ años, testing automatizado, accesibilidad y sistemas de diseño. " +
      "El CV cubre todo eso: 7 años de experiencia, Jest, React Testing Library y Playwright, WCAG 2.1 y una biblioteca de componentes en Storybook. " +
      "El inglés B2 cumple el mínimo pedido. El salario y el modelo remoto encajan con lo que busca el perfil. " +
      "La única carencia es GraphQL, que la oferta marca solo como valorable y que el CV no menciona, así que no se da por supuesta. " +
      "Veredicto: merece la pena aplicar.",
    evaluation: build(
      { tecnico: 43, nivel: 14, idioma: 8, condiciones: 13, senales: 6 },
      [
        "React y TypeScript con 7 años (piden 5+)",
        "Testing: Jest, React Testing Library y Playwright",
        "Accesibilidad (WCAG 2.1)",
        "Sistema de diseño: biblioteca de componentes en Storybook",
        "Inglés B2, cumple el mínimo",
      ],
      ["GraphQL (valorable): no figura en el CV"],
    ),
  },
  {
    id: "fullstack-ts",
    label: "Full stack TypeScript (encaje dudoso)",
    job: JOB_FULLSTACK,
    cv: SAMPLE_CV,
    analysis:
      "La oferta es de full stack con TypeScript: React, Node.js y NestJS, PostgreSQL, AWS, Docker y Kubernetes. " +
      "El CV es claramente de frontend. React y TypeScript encajan, pero el backend solo aparece como 'algo de Node.js para scripts y un BFF sencillo', " +
      "y no hay ninguna mención a NestJS, PostgreSQL, AWS, Docker ni Kubernetes. " +
      "Además piden inglés fluido y el CV declara B2, lo que es un riesgo. " +
      "No se supone experiencia que el CV no recoge. Veredicto: dudoso; solo tiene sentido si la persona acepta un puesto con mucho aprendizaje de backend.",
    evaluation: build(
      { tecnico: 27, nivel: 13, idioma: 4, condiciones: 9, senales: 4 },
      [
        "React y TypeScript",
        "Node.js a nivel básico (scripts y un BFF sencillo)",
        "Más de 4 años de experiencia",
      ],
      [
        "NestJS: no figura en el CV",
        "PostgreSQL: no figura en el CV",
        "AWS: no figura en el CV",
        "Docker y Kubernetes: no figuran en el CV",
        "Inglés fluido requerido; el CV declara B2",
      ],
    ),
  },
  {
    id: "backend-java",
    label: "Backend Java en Madrid (encaje bajo)",
    job: JOB_JAVA,
    cv: SAMPLE_CV,
    analysis:
      "La oferta busca un perfil de backend con Java y Spring Boot, microservicios, Oracle y Kafka, con 5+ años, y en modalidad híbrida en Madrid. " +
      "El CV es de frontend con React y TypeScript y no recoge experiencia con Java ni con ninguna de las tecnologías de backend pedidas. " +
      "El inglés B2 supera el B1 exigido, pero eso no compensa la distancia técnica. " +
      "Veredicto: descartar; es otro tipo de puesto.",
    evaluation: build(
      { tecnico: 12, nivel: 8, idioma: 6, condiciones: 3, senales: 3 },
      ["Inglés B2, por encima del B1 pedido", "Ubicación en Madrid"],
      [
        "Java y Spring Boot: no figuran en el CV",
        "Microservicios, Oracle y Kafka: no figuran en el CV",
        "El puesto exige presencia 3 días; el perfil busca remoto",
      ],
    ),
  },
];
