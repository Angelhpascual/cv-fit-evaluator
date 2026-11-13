import { describe, expect, it } from "vitest";
import { EXAMPLES } from "../examples";
import { StreamEvent } from "../types";
import { findExample, mockEvaluate } from "./mock";

async function collect(gen: AsyncGenerator<StreamEvent>) {
  const events: StreamEvent[] = [];
  for await (const e of gen) events.push(e);
  return events;
}

describe("mockEvaluate", () => {
  const example = EXAMPLES[0];

  it("emite texto por partes y termina con el resultado", async () => {
    const events = await collect(
      mockEvaluate({ job: example.job, cv: example.cv }, { delayMs: 0 }),
    );

    const texts = events.filter((e) => e.type === "text");
    expect(texts.length).toBeGreaterThan(3); // llega por streaming, no de golpe
    expect(events.at(-1)?.type).toBe("result");
  });

  it("el texto reconstruido es el análisis completo", async () => {
    const events = await collect(
      mockEvaluate({ job: example.job, cv: example.cv }, { delayMs: 0 }),
    );
    const joined = events
      .filter((e): e is Extract<StreamEvent, { type: "text" }> => e.type === "text")
      .map((e) => e.delta)
      .join("");
    expect(joined).toBe(example.analysis);
  });

  it("reconoce el ejemplo aunque cambien los espacios", () => {
    const found = findExample({
      job: `  ${example.job.replace(/\n/g, "\n\n")}  `,
      cv: example.cv,
    });
    expect(found?.id).toBe(example.id);
  });

  it("con un texto desconocido avisa y no inventa una evaluación", async () => {
    const events = await collect(
      mockEvaluate({ job: "Oferta inventada", cv: "CV inventado" }, { delayMs: 0 }),
    );
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("notice");
    expect(events.some((e) => e.type === "result")).toBe(false);
  });
});
