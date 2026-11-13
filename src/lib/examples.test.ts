import { describe, expect, it } from "vitest";
import { EXAMPLES } from "./examples";
import { validateEvaluation } from "./rubric";

/**
 * Evaluaciones del modo demo: comprueban que los casos grabados siguen la
 * rúbrica. Es la base para añadir más casos y detectar regresiones.
 */
describe.each(EXAMPLES)("ejemplo $id", (example) => {
  it("tiene una evaluación coherente con la rúbrica", () => {
    expect(validateEvaluation(example.evaluation)).toEqual([]);
  });

  it("tiene texto de oferta, CV y análisis", () => {
    expect(example.job.length).toBeGreaterThan(50);
    expect(example.cv.length).toBeGreaterThan(50);
    expect(example.analysis.length).toBeGreaterThan(50);
  });

  it("no menciona datos reales (todo es ficticio)", () => {
    const all = `${example.job} ${example.cv} ${example.analysis}`;
    expect(all).not.toMatch(/gmail\.com|\+34\s?\d{3}/i);
  });
});

describe("conjunto de ejemplos", () => {
  it("cubre los tres veredictos", () => {
    const verdicts = new Set(EXAMPLES.map((e) => e.evaluation.verdict));
    expect(verdicts).toEqual(new Set(["aplicar", "dudoso", "descartar"]));
  });

  it("tiene identificadores únicos", () => {
    const ids = EXAMPLES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no da por supuesta experiencia que el CV no recoge", () => {
    // El caso 'fullstack-ts' pide tecnologías ausentes en el CV: deben ir como carencias.
    const ex = EXAMPLES.find((e) => e.id === "fullstack-ts")!;
    for (const tech of ["PostgreSQL", "AWS", "NestJS"]) {
      expect(ex.cv).not.toContain(tech);
      expect(ex.evaluation.gaps.some((g) => g.includes(tech))).toBe(true);
    }
  });
});
