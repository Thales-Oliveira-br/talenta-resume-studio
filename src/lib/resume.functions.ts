import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { estruturarCurriculo } from "./resume-ai.server";
import { estruturarAvaliacao } from "./assessment-ai.server";

export const padronizarCurriculo = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        texto: z.string().min(30, "Não foi possível ler texto suficiente no arquivo."),
        relato: z.string().default(""),
      })
      .parse(data),
  )
  .handler(async ({ data }) => estruturarCurriculo(data.texto, data.relato));

export const padronizarAvaliacao = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        tipo: z.enum(["PDA", "DISC"]),
        texto: z.string().min(30, "Não foi possível ler texto suficiente no arquivo."),
      })
      .parse(data),
  )
  .handler(async ({ data }) => estruturarAvaliacao(data.tipo, data.texto));
