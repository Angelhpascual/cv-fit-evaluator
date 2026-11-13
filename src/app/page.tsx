"use client";

import { useRef, useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { EXAMPLES } from "@/lib/examples";
import { Evaluation, StreamEvent } from "@/lib/types";

type Status = "idle" | "running" | "done";

export default function Home() {
  const [job, setJob] = useState("");
  const [cv, setCv] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function reset() {
    setStatus("idle");
    setText("");
    setNotice("");
    setError("");
    setEvaluation(null);
  }

  function loadExample(id: string) {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    abortRef.current?.abort();
    setJob(ex.job);
    setCv(ex.cv);
    reset();
  }

  function handleEvent(event: StreamEvent) {
    switch (event.type) {
      case "text":
        setText((t) => t + event.delta);
        break;
      case "result":
        setEvaluation(event.evaluation);
        break;
      case "notice":
        setNotice(event.message);
        break;
      case "error":
        setError(event.message);
        break;
    }
  }

  async function evaluate(e: React.FormEvent) {
    e.preventDefault();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    reset();
    setStatus("running");

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, cv }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo evaluar.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.trim()) handleEvent(JSON.parse(line) as StreamEvent);
        }
      }
      setStatus("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  const canSubmit = job.trim() !== "" && cv.trim() !== "" && status !== "running";

  return (
    <main className="page">
      <header className="intro">
        <h1>Evaluador de encaje CV–oferta</h1>
        <p>
          Pega una oferta y un CV y obtén una puntuación con una rúbrica fija,
          sus carencias reales y un veredicto. El análisis llega por streaming.
        </p>
        <p className="demo-badge" role="note">
          Modo demo: las respuestas están grabadas y los ejemplos son ficticios.
        </p>
      </header>

      <section aria-labelledby="examples-title" className="examples">
        <h2 id="examples-title">Ejemplos</h2>
        <div className="example-buttons">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className="secondary"
              onClick={() => loadExample(ex.id)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={evaluate} className="form">
        <div className="field">
          <label htmlFor="job">Oferta de empleo</label>
          <textarea
            id="job"
            rows={9}
            value={job}
            onChange={(e) => {
              setJob(e.target.value);
              reset();
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="cv">CV</label>
          <textarea
            id="cv"
            rows={9}
            value={cv}
            onChange={(e) => {
              setCv(e.target.value);
              reset();
            }}
          />
        </div>
        <button type="submit" disabled={!canSubmit}>
          {status === "running" ? "Evaluando…" : "Evaluar"}
        </button>
      </form>

      <div aria-live="polite" className="output">
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {notice && <p className="notice">{notice}</p>}
        {text && (
          <section aria-label="Análisis">
            <h2>Análisis</h2>
            <p className="analysis">{text}</p>
          </section>
        )}
        {evaluation && <ResultCard evaluation={evaluation} />}
      </div>

      <footer className="foot">
        <p>
          Los ejemplos son inventados y no se guarda ningún dato que escribas.
        </p>
      </footer>
    </main>
  );
}
