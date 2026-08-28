import type { Curriculo } from "./resume-types";

const SISTEMA = `Você é analista de RH da consultoria Elizabete Rosa Scain — Desenvolvimento Humano.
Recebe o texto bruto de um currículo (em qualquer formato/estrutura) e devolve os dados
normalizados para o padrão único da empresa.

Regras de padronização:
- Português do Brasil. Nunca invente informação: se o dado não existe no texto, devolva string vazia.
- "nome": nome completo em MAIÚSCULAS.
- "dataNascimento": formato DD/MM/AAAA.
- "telefone": formato "(DD) 9 XXXXXXXX" quando possível.
- "cidade": "Cidade – UF".
- "transporteProprio": "SIM", "NAO" ou "" quando não informado.
- "objetivo": até 5 áreas/competências-chave separadas por " | " (ex.: "Gestão Comercial | Gestão de Equipes").
- "formacao": uma string por formação, no padrão "Graduação em X – INSTITUIÇÃO – ANO." (mais recente primeiro).
- "experiencias": ordem da mais recente para a mais antiga. Para cada uma:
  - "empresa": nome em MAIÚSCULAS.
  - "periodo": "MES/ANO – MES/ANO" com mês em 3 letras maiúsculas (ex.: "OUT/2023 – FEV/2026"); use "ATUAL" quando em curso.
  - "descricaoEmpresa": uma frase entre parênteses não incluídos, descrevendo o segmento e a atuação da empresa.
  - "cargo": cargo em MAIÚSCULAS.
  - "atividades": parágrafo único, corrido, impessoal e profissional, descrevendo responsabilidades e resultados
    (reescreva tópicos soltos em texto corrido; mantenha números e resultados reais quando existirem).
- "competencias": competências técnicas separadas por " | ".
Responda SOMENTE com o JSON, sem cercas de código.`;

export async function estruturarCurriculo(
  texto: string,
  relato: string,
): Promise<Curriculo> {
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
          content: `TEXTO DO CURRÍCULO:\n"""\n${texto.slice(0, 60000)}\n"""`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "curriculo",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "nome",
              "dataNascimento",
              "email",
              "telefone",
              "transporteProprio",
              "cidade",
              "objetivo",
              "formacao",
              "experiencias",
              "competencias",
            ],
            properties: {
              nome: { type: "string" },
              dataNascimento: { type: "string" },
              email: { type: "string" },
              telefone: { type: "string" },
              transporteProprio: { type: "string", enum: ["SIM", "NAO", ""] },
              cidade: { type: "string" },
              objetivo: { type: "string" },
              competencias: { type: "string" },
              formacao: { type: "array", items: { type: "string" } },
              experiencias: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["empresa", "periodo", "descricaoEmpresa", "cargo", "atividades"],
                  properties: {
                    empresa: { type: "string" },
                    periodo: { type: "string" },
                    descricaoEmpresa: { type: "string" },
                    cargo: { type: "string" },
                    atividades: { type: "string" },
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
    if (resposta.status === 429) throw new Error("Limite de uso da IA atingido. Tente novamente em instantes.");
    if (resposta.status === 402) throw new Error("Créditos de IA insuficientes no workspace.");
    throw new Error(`Falha na leitura do currículo (${resposta.status}): ${detalhe.slice(0, 200)}`);
  }

  const payload = (await resposta.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const conteudo = payload.choices?.[0]?.message?.content ?? "";
  const limpo = conteudo.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const dados = JSON.parse(limpo) as Curriculo;

  return { ...dados, entrevista: relato.trim() };
}
