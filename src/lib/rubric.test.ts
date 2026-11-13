import { describe, expect, it } from "vitest";
import { totalScore, validateEvaluation, verdictFor } from "./rubric";
import { Evaluation } from "./types";

const base: Evaluation = {
  score: 84,
  verdict: "aplicar",
  breakdown: { tecnico: 43, nivel: 14, idioma: 8, condiciones: 13, senales: 6 },
  matches: ["React"],
  gaps: [],
};

describe("verdictFor", () => {
  it.each([
    [100, "aplicar"],
    [70, "aplicar"],
    [69, "dudoso"],
    [50, "dudoso"],
    [49, "descartar"],
    [0, "descartar"],
  ] as const)("%i puntos -> %s", (score, verdict) => {
    expect(verdictFor(score)).toBe(verdict);
  });
});

describe("totalScore", () => {
  it("suma los cinco apartados", () => {
    expect(totalScore(base.breakdown)).toBe(84);
  });
});

describe("validateEvaluation", () => {
  it("acepta una evaluación coherente", () => {
    expect(validateEvaluation(base)).toEqual([]);
  });

  it("detecta una puntuación que no es la suma del desglose", () => {
    expect(validateEvaluation({ ...base, score: 90 })[0]).toMatch(/no coincide/);
  });

  it("detecta un veredicto que no corresponde a la puntuación", () => {
    const errors = validateEvaluation({ ...base, verdict: "descartar" });
    expect(errors.some((e) => e.includes("no corresponde"))).toBe(true);
  });

  it("detecta apartados fuera de rango", () => {
    const errors = validateEvaluation({
      ...base,
      score: 51 + 14 + 8 + 13 + 6,
      verdict: "aplicar",
      breakdown: { ...base.breakdown, tecnico: 51 },
    });
    expect(errors.some((e) => e.startsWith("tecnico"))).toBe(true);
  });

  it("exige carencias cuando el veredicto no es 'aplicar'", () => {
    const maybe: Evaluation = {
      score: 57,
      verdict: "dudoso",
      breakdown: { tecnico: 27, nivel: 13, idioma: 4, condiciones: 9, senales: 4 },
      matches: ["React"],
      gaps: [],
    };
    expect(validateEvaluation(maybe)).toContain(
      "un veredicto distinto de 'aplicar' necesita al menos una carencia",
    );
  });
});
