import type { Avaliacao } from "./resume-types";

const SISTEMA = `Você é analista comportamental da consultoria Elizabete Rosa Scain — Desenvolvimento Humano.
Recebe o texto bruto de um relatório de avaliação comportamental (PDA International ou Perfil
Gerencial/DISC, em qualquer formato) e devolve o conteúdo já resumido e organizado para o padrão
único de relatório da empresa.

Regras:
- Português do Brasil, tom técnico, impessoal e profissional (3ª pessoa, referindo o candidato pelo nome ou "o(a) candidato(a)").
- Nunca invente informação: se um dado não existir no texto, devolva string vazia ou lista vazia.
- Descarte todo o conteúdo institucional/metodológico do relatório original (história do DISC,
  explicações da PDA International, propaganda, numeração de páginas, rodapés, legendas de gráficos).
  Aproveite apenas o que descreve o candidato avaliado.
- "candidato": nome completo em MAIÚSCULAS.
- "data": data do relatório em DD/MM/AAAA.
- "perfil": rótulo do perfil identificado (ex.: "Perfil Analítico Estável", "Eixos R80 · E0 · P40 · N80 · A47").
- "resumo": um único parágrafo corrido (6 a 10 linhas) sintetizando o perfil comportamental.
- "palavras": até 15 adjetivos/palavras descritivas do estilo natural, cada um iniciando em maiúscula.
- "secoes": de 4 a 8 blocos, na ordem lógica de leitura, com títulos curtos em Caixa Alta e Baixa
  (ex.: "Descrição do Perfil Natural", "Estilo de Liderança", "Tomada de Decisão", "Comunicação e Influência",
  "Pontos Fortes", "Pontos Fortes que Podem se Tornar Limitações", "Como Desenvolver o Potencial",
  "Índices e Gráficos", "Dicas para Liderar e Motivar"). Cada seção traz de 1 a 4 parágrafos corridos
  (reescreva tópicos soltos como texto corrido; preserve percentuais e índices reais quando existirem).
Responda SOMENTE com o JSON, sem cercas de código.`;

export async function estruturarAvaliacao(
  tipo: "PDA" | "DISC",
  texto: string,
): Promise<Avaliacao> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("IA não configurada.");

  const resposta = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SISTEMA },
        {
          role: "user",
          content: `TIPO DE AVALIAÇÃO: ${tipo}\n\nTEXTO DO RELATÓRIO:\n"""\n${texto.slice(0, 90000)}\n"""`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "avaliacao",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["candidato", "data", "perfil", "resumo", "palavras", "secoes"],
            properties: {
              candidato: { type: "string" },
              data: { type: "string" },
              perfil: { type: "string" },
              resumo: { type: "string" },
              palavras: { type: "array", items: { type: "string" } },
              secoes: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["titulo", "paragrafos"],
                  properties: {
                    titulo: { type: "string" },
                    paragrafos: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    if (resposta.status === 429)
      throw new Error("Limite de uso da IA atingido. Tente novamente em instantes.");
    if (resposta.status === 402) throw new Error("Créditos de IA insuficientes no workspace.");
    throw new Error(`Falha na leitura do ${tipo} (${resposta.status}): ${detalhe.slice(0, 200)}`);
  }

  const payload = (await resposta.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const conteudo = payload.choices?.[0]?.message?.content ?? "";
  const limpo = conteudo.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const dados = JSON.parse(limpo) as Omit<Avaliacao, "tipo">;

  return { ...dados, tipo };
}
