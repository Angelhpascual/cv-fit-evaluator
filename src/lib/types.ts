export type Verdict = "aplicar" | "dudoso" | "descartar";

/** Desglose de la rúbrica. Cada campo tiene un máximo (ver MAX_POINTS). */
export interface Breakdown {
  tecnico: number;
  nivel: number;
  idioma: number;
  condiciones: number;
  senales: number;
}

export const MAX_POINTS: Breakdown = {
  tecnico: 50,
  nivel: 15,
  idioma: 10,
  condiciones: 15,
  senales: 10,
};

export interface Evaluation {
  score: number;
  verdict: Verdict;
  breakdown: Breakdown;
  /** Requisitos de la oferta que el CV cubre. */
  matches: string[];
  /** Carencias reales: lo que la oferta pide y el CV no demuestra. */
  gaps: string[];
}

export interface EvaluateInput {
  job: string;
  cv: string;
}

/** Eventos que viajan por el stream (una línea JSON por evento). */
export type StreamEvent =
  | { type: "text"; delta: string }
  | { type: "result"; evaluation: Evaluation }
  | { type: "notice"; message: string }
  | { type: "error"; message: string };
