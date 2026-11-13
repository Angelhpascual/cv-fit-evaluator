import { Breakdown, Evaluation, MAX_POINTS, Verdict } from "./types";

export const APPLY_THRESHOLD = 70;
export const MAYBE_THRESHOLD = 50;

export function totalScore(b: Breakdown): number {
  return b.tecnico + b.nivel + b.idioma + b.condiciones + b.senales;
}

export function verdictFor(score: number): Verdict {
  if (score >= APPLY_THRESHOLD) return "aplicar";
  if (score >= MAYBE_THRESHOLD) return "dudoso";
  return "descartar";
}

/** Devuelve la lista de problemas de una evaluación; vacía si es coherente. */
export function validateEvaluation(e: Evaluation): string[] {
  const errors: string[] = [];

  for (const key of Object.keys(MAX_POINTS) as (keyof Breakdown)[]) {
    const value = e.breakdown[key];
    if (!Number.isFinite(value) || value < 0 || value > MAX_POINTS[key]) {
      errors.push(`${key}: ${value} fuera de rango 0-${MAX_POINTS[key]}`);
    }
  }

  const expected = totalScore(e.breakdown);
  if (e.score !== expected) {
    errors.push(`score ${e.score} no coincide con la suma del desglose (${expected})`);
  }

  if (e.verdict !== verdictFor(e.score)) {
    errors.push(`veredicto "${e.verdict}" no corresponde a ${e.score} puntos`);
  }

  // Honestidad: una evaluación que no es "aplicar" debe explicar sus carencias.
  if (e.verdict !== "aplicar" && e.gaps.length === 0) {
    errors.push("un veredicto distinto de 'aplicar' necesita al menos una carencia");
  }

  return errors;
}
