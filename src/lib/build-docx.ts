import {
  AlignmentType,
  Document,
  Footer,
  Header,
  ImageRun,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
  UnderlineType,
} from "docx";
import type { Curriculo } from "./resume-types";

const FONTE = "Calibri";
const CONTATO = {
  nome: "Elizabete Rosa Scain",
  telefone: "(54) 9 99014063",
  email: "elizabete@elizabetescain.com.br",
  site: "www.elizabetescain.com.br",
  assinatura: "Elizabete Rosa Sacain",
};

type Alinhamento = (typeof AlignmentType)[keyof typeof AlignmentType];

function texto(t: string, opts: { bold?: boolean; italics?: boolean; underline?: boolean; size?: number } = {}) {
  return new TextRun({
    text: t,
    font: FONTE,
    size: opts.size ?? 22,
    bold: opts.bold === true,
    italics: opts.italics === true,
    ...(opts.underline ? { underline: { type: UnderlineType.SINGLE } } : {}),
  });
}

function secao(titulo: string) {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [texto(titulo, { bold: true, italics: true, underline: true })],
  });
}

function corpo(
  t: string,
  opts: { bold?: boolean; italics?: boolean; align?: Alinhamento } = {},
) {
  return new Paragraph({
    ...(opts.align ? { alignment: opts.align } : {}),
    spacing: { after: 0, line: 264 },
    children: [texto(t, { bold: opts.bold === true, italics: opts.italics === true })],
  });
}

export async function gerarDocx(dados: Curriculo, logoUrl: string): Promise<Blob> {
  const logo = new Uint8Array(await (await fetch(logoUrl)).arrayBuffer());

  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new ImageRun({
            type: "png",
            data: logo,
            transformation: { width: 150, height: 48 },
            altText: {
              title: "Elizabete Rosa Scain",
              description: "Elizabete Rosa Scain — Desenvolvimento Humano",
              name: "Logo ERS",
            },
          }),
        ],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          texto(CONTATO.nome, { bold: true, size: 18 }),
          texto(` | ${CONTATO.telefone}`, { size: 18 }),
          texto(`\t${CONTATO.assinatura}`, { size: 18 }),
        ],
      }),
      new Paragraph({
        children: [texto(`${CONTATO.email} | ${CONTATO.site}`, { size: 18 })],
      }),
    ],
  });

  const conteudo: Paragraph[] = [];

  conteudo.push(corpo(dados.nome.toUpperCase(), { bold: true }));
  if (dados.dataNascimento) conteudo.push(corpo(`Data de Nasc: ${dados.dataNascimento}`));
  if (dados.email || dados.telefone) {
    conteudo.push(
      new Paragraph({
        spacing: { line: 264 },
        children: [
          texto(dados.email),
          texto(dados.telefone ? ` | ` : ""),
          texto(dados.telefone, { bold: true }),
        ],
      }),
    );
  }
  const sim = dados.transporteProprio === "SIM" ? "X" : " ";
  const nao = dados.transporteProprio === "NAO" ? "X" : " ";
  conteudo.push(corpo(`Transporte Próprio: (${sim}) SIM   (${nao}) NÃO`, { bold: true }));
  if (dados.cidade) conteudo.push(corpo(dados.cidade));

  if (dados.objetivo) {
    conteudo.push(secao("Objetivo"));
    conteudo.push(corpo(dados.objetivo, { align: AlignmentType.CENTER }));
  }

  if (dados.formacao.length) {
    conteudo.push(secao("Formação Acadêmica"));
    for (const item of dados.formacao) conteudo.push(corpo(item));
  }

  if (dados.experiencias.length) {
    conteudo.push(secao("Experiência Profissional"));
    for (const exp of dados.experiencias) {
      conteudo.push(
        new Paragraph({
          spacing: { before: 200, line: 264 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            texto(exp.empresa.toUpperCase(), { bold: true }),
            texto(`\t${exp.periodo}`, { bold: true }),
          ],
        }),
      );
      if (exp.descricaoEmpresa) {
        conteudo.push(corpo(`(${exp.descricaoEmpresa.replace(/^\(|\)$/g, "")})`, { italics: true }));
      }
      if (exp.cargo) conteudo.push(corpo(exp.cargo.toUpperCase(), { bold: true }));
      if (exp.atividades) conteudo.push(corpo(exp.atividades, { align: AlignmentType.JUSTIFIED }));
    }
  }

  if (dados.competencias) {
    conteudo.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [texto("Competências Técnicas", { bold: true, underline: true })],
      }),
    );
    conteudo.push(corpo(dados.competencias, { align: AlignmentType.JUSTIFIED }));
  }

  conteudo.push(
    new Paragraph({
      spacing: { before: 280, after: 120 },
      children: [texto("ENTREVISTA REALIZADA", { bold: true })],
    }),
  );
  if (dados.entrevista) {
    for (const paragrafo of dados.entrevista.split(/\n+/).filter(Boolean)) {
      conteudo.push(corpo(paragrafo, { align: AlignmentType.JUSTIFIED }));
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: FONTE, size: 22 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children: conteudo,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
