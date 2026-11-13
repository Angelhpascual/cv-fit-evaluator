import { MAX_POINTS, Breakdown, Evaluation } from "@/lib/types";

const LABELS: Record<keyof Breakdown, string> = {
  tecnico: "Encaje técnico",
  nivel: "Nivel y años",
  idioma: "Idioma",
  condiciones: "Condiciones",
  senales: "Señales",
};

const VERDICT_TEXT = {
  aplicar: "Aplicar",
  dudoso: "Dudoso",
  descartar: "Descartar",
} as const;

export function ResultCard({ evaluation }: { evaluation: Evaluation }) {
  const keys = Object.keys(LABELS) as (keyof Breakdown)[];
  return (
    <section className="result" aria-label="Resultado de la evaluación">
      <header className="result-head">
        <p className="score" aria-label={`Puntuación ${evaluation.score} de 100`}>
          {evaluation.score}
          <span>/100</span>
        </p>
        <p className={`verdict verdict-${evaluation.verdict}`}>
          {VERDICT_TEXT[evaluation.verdict]}
        </p>
      </header>

      <ul className="breakdown">
        {keys.map((key) => (
          <li key={key}>
            <span className="bk-label">{LABELS[key]}</span>
            <meter
              min={0}
              max={MAX_POINTS[key]}
              value={evaluation.breakdown[key]}
              aria-label={LABELS[key]}
            />
            <span className="bk-value">
              {evaluation.breakdown[key]}/{MAX_POINTS[key]}
            </span>
          </li>
        ))}
      </ul>

      <div className="lists">
        <div>
          <h3>Lo que encaja</h3>
          <ul>
            {evaluation.matches.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Carencias</h3>
          {evaluation.gaps.length === 0 ? (
            <p className="muted">Ninguna relevante.</p>
          ) : (
            <ul>
              {evaluation.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
