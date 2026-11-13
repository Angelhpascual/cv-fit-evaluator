import { EXAMPLES } from "../examples";
import { EvaluateInput, StreamEvent } from "../types";

const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

export function findExample(input: EvaluateInput) {
  const job = normalize(input.job);
  const cv = normalize(input.cv);
  return EXAMPLES.find(
    (ex) => normalize(ex.job) === job && normalize(ex.cv) === cv,
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Proveedor del modo demo: reproduce por streaming una respuesta grabada.
 * Solo reconoce los ejemplos incluidos; con otro texto lo dice claramente en
 * lugar de inventar una evaluación.
 */
export async function* mockEvaluate(
  input: EvaluateInput,
  options: { delayMs?: number } = {},
): AsyncGenerator<StreamEvent> {
  const delayMs = options.delayMs ?? 20;
  const example = findExample(input);

  if (!example) {
    yield {
      type: "notice",
      message:
        "Modo demo: solo puedo evaluar los ejemplos incluidos. Elige uno de la lista, o activa el modo real con una clave de API.",
    };
    return;
  }

  // Trozos de unas pocas palabras, para que el texto aparezca de forma gradual.
  const tokens = example.analysis.split(/(\s+)/);
  let chunk = "";
  let words = 0;
  for (const token of tokens) {
    chunk += token;
    if (token.trim() !== "") words += 1;
    if (words >= 3) {
      yield { type: "text", delta: chunk };
      chunk = "";
      words = 0;
      if (delayMs > 0) await sleep(delayMs);
    }
  }
  if (chunk) yield { type: "text", delta: chunk };

  yield { type: "result", evaluation: example.evaluation };
}
