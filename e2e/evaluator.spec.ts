import { expect, test } from "@playwright/test";

test.describe("Evaluador de encaje CV–oferta (modo demo)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("muestra el título y avisa de que es modo demo", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: /Evaluador de encaje/ }),
    ).toBeVisible();
    await expect(page.getByRole("note")).toContainText("Modo demo");
  });

  test("el botón Evaluar está desactivado hasta que hay oferta y CV", async ({ page }) => {
    const evaluar = page.getByRole("button", { name: "Evaluar" });
    await expect(evaluar).toBeDisabled();

    await page.getByLabel("Oferta de empleo").fill("Una oferta");
    await expect(evaluar).toBeDisabled();

    await page.getByLabel("CV").fill("Un CV");
    await expect(evaluar).toBeEnabled();
  });

  test("encaje alto: el análisis llega y el resultado es 84 · Aplicar", async ({ page }) => {
    await page.getByRole("button", { name: /Frontend React senior/ }).click();
    await page.getByRole("button", { name: "Evaluar" }).click();

    const result = page.getByRole("region", { name: "Resultado de la evaluación" });
    await expect(result).toBeVisible();
    await expect(result.getByLabel("Puntuación 84 de 100")).toBeVisible();
    await expect(result.getByText("Aplicar", { exact: true })).toBeVisible();
    await expect(result.getByText("GraphQL (valorable)")).toBeVisible();
  });

  test("encaje dudoso: lista como carencias lo que el CV no recoge", async ({ page }) => {
    await page.getByRole("button", { name: /Full stack TypeScript/ }).click();
    await page.getByRole("button", { name: "Evaluar" }).click();

    const result = page.getByRole("region", { name: "Resultado de la evaluación" });
    await expect(result.getByLabel("Puntuación 57 de 100")).toBeVisible();
    await expect(result.getByText("Dudoso", { exact: true })).toBeVisible();
    for (const tech of ["NestJS", "PostgreSQL", "AWS"]) {
      await expect(result.getByText(`${tech}: no figura en el CV`)).toBeVisible();
    }
  });

  test("encaje bajo: el veredicto es Descartar", async ({ page }) => {
    await page.getByRole("button", { name: /Backend Java/ }).click();
    await page.getByRole("button", { name: "Evaluar" }).click();

    const result = page.getByRole("region", { name: "Resultado de la evaluación" });
    await expect(result.getByLabel("Puntuación 32 de 100")).toBeVisible();
    await expect(result.getByText("Descartar", { exact: true })).toBeVisible();
  });

  test("el análisis aparece por partes (streaming), antes del resultado", async ({ page }) => {
    await page.getByRole("button", { name: /Frontend React senior/ }).click();
    await page.getByRole("button", { name: "Evaluar" }).click();

    const analysis = page.getByRole("region", { name: "Análisis" });
    const result = page.getByRole("region", { name: "Resultado de la evaluación" });

    // Con el texto del análisis ya visible, el resultado todavía no ha llegado.
    await expect(analysis).toBeVisible();
    await expect(result).toBeHidden();
    // ...y termina apareciendo.
    await expect(result).toBeVisible();
  });

  test("con un texto desconocido avisa y no inventa una evaluación", async ({ page }) => {
    await page.getByLabel("Oferta de empleo").fill("Una oferta inventada");
    await page.getByLabel("CV").fill("Un CV inventado");
    await page.getByRole("button", { name: "Evaluar" }).click();

    await expect(page.getByText(/solo puedo evaluar los ejemplos/)).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Resultado de la evaluación" }),
    ).toHaveCount(0);
  });
});
