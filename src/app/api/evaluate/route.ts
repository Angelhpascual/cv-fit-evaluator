import { mockEvaluate } from "@/lib/providers/mock";
import { EvaluateInput, StreamEvent } from "@/lib/types";

const MAX_CHARS = 20_000;

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let body: Partial<EvaluateInput>;
  try {
    body = await request.json();
  } catch {
    return badRequest("El cuerpo debe ser JSON.");
  }

  const job = typeof body.job === "string" ? body.job : "";
  const cv = typeof body.cv === "string" ? body.cv : "";

  if (!job.trim() || !cv.trim()) {
    return badRequest("Hacen falta la oferta y el CV.");
  }
  if (job.length > MAX_CHARS || cv.length > MAX_CHARS) {
    return badRequest(`Cada texto puede tener como máximo ${MAX_CHARS} caracteres.`);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: StreamEvent) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        for await (const event of mockEvaluate({ job, cv })) send(event);
      } catch {
        send({ type: "error", message: "Algo ha fallado al evaluar." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
