import { jsPDF } from "jspdf";
import type { Curriculo } from "./resume-types";

const M = 20; // margem em mm
const LARGURA = 210;
const ALTURA = 297;
const LIMITE = ALTURA - 24;

async function carregarLogo(url: string): Promise<{ dataUrl: string; ratio: number }> {
  const blob = await (await fetch(url)).blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  const ratio = await new Promise<number>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width / img.height);
    img.onerror = () => resolve(3.15);
    img.src = dataUrl;
  });
  return { dataUrl, ratio };
}

export async function gerarPdf(dados: Curriculo, logoUrl: string): Promise<Blob> {
  const { dataUrl, ratio } = await carregarLogo(logoUrl);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const largura = LARGURA - M * 2;
  let y = M;

  const logoW = 42;
  const logoH = logoW / ratio;

  const enfeitarPagina = () => {
    doc.addImage(dataUrl, "PNG", LARGURA - M - logoW, 8, logoW, logoH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(40);
    doc.text("Elizabete Rosa Scain", M, ALTURA - 14);
    doc.setFont("helvetica", "normal");
    doc.text(" | (54) 9 99014063", M + doc.getTextWidth("Elizabete Rosa Scain"), ALTURA - 14);
    doc.text("Elizabete Rosa Sacain", LARGURA - M, ALTURA - 14, { align: "right" });
    doc.setTextColor(30, 90, 160);
    doc.text("elizabete@elizabetescain.com.br | www.elizabetescain.com.br", M, ALTURA - 10);
    doc.setTextColor(0);
  };

  enfeitarPagina();
  y = 8 + logoH + 8;

  const novaPaginaSePreciso = (altura: number) => {
    if (y + altura > LIMITE) {
      doc.addPage();
      enfeitarPagina();
      y = 8 + logoH + 8;
    }
  };

  const escrever = (
    txt: string,
    opts: {
      bold?: boolean;
      italic?: boolean;
      size?: number;
      align?: "left" | "center" | "justify";
      underline?: boolean;
      espacoAntes?: number;
    } = {},
  ) => {
    const size = opts.size ?? 11;
    doc.setFontSize(size);
    doc.setFont("helvetica", opts.bold ? (opts.italic ? "bolditalic" : "bold") : opts.italic ? "italic" : "normal");
    const linhas = doc.splitTextToSize(txt, largura) as string[];
    const alturaLinha = size * 0.48;
    y += opts.espacoAntes ?? 0;
    novaPaginaSePreciso(linhas.length * alturaLinha);
    for (const [i, linha] of linhas.entries()) {
      const ultima = i === linhas.length - 1;
      if (opts.align === "center") {
        doc.text(linha, LARGURA / 2, y, { align: "center" });
      } else if (opts.align === "justify" && !ultima) {
        doc.text(linha, M, y, { align: "justify", maxWidth: largura });
      } else {
        doc.text(linha, M, y);
      }
      if (opts.underline) {
        const w = doc.getTextWidth(linha);
        const x0 = opts.align === "center" ? LARGURA / 2 - w / 2 : M;
        doc.setLineWidth(0.3);
        doc.line(x0, y + 1, x0 + w, y + 1);
      }
      y += alturaLinha;
      if (!ultima) novaPaginaSePreciso(alturaLinha);
    }
  };

  const secao = (titulo: string) => {
    escrever(titulo, { bold: true, italic: true, underline: true, espacoAntes: 4 });
    y += 1.5;
  };

  escrever(dados.nome.toUpperCase(), { bold: true, size: 12 });
  if (dados.dataNascimento) escrever(`Data de Nasc: ${dados.dataNascimento}`);
  if (dados.email || dados.telefone) escrever([dados.email, dados.telefone].filter(Boolean).join(" | "));
  const sim = dados.transporteProprio === "SIM" ? "X" : " ";
  const nao = dados.transporteProprio === "NAO" ? "X" : " ";
  escrever(`Transporte Próprio: (${sim}) SIM   (${nao}) NÃO`, { bold: true });
  if (dados.cidade) escrever(dados.cidade);

  if (dados.objetivo) {
    secao("Objetivo");
    escrever(dados.objetivo, { align: "center" });
  }

  if (dados.formacao.length) {
    secao("Formação Acadêmica");
    for (const item of dados.formacao) escrever(item);
  }

  if (dados.experiencias.length) {
    secao("Experiência Profissional");
    for (const exp of dados.experiencias) {
      y += 3;
      novaPaginaSePreciso(6);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(exp.empresa.toUpperCase(), M, y);
      doc.text(exp.periodo, LARGURA - M, y, { align: "right" });
      y += 5;
      if (exp.descricaoEmpresa) {
        escrever(`(${exp.descricaoEmpresa.replace(/^\(|\)$/g, "")})`, { italic: true, size: 9.5 });
      }
      if (exp.cargo) escrever(exp.cargo.toUpperCase(), { bold: true });
      if (exp.atividades) escrever(exp.atividades, { align: "justify" });
    }
  }

  if (dados.competencias) {
    escrever("Competências Técnicas", { bold: true, underline: true, espacoAntes: 5 });
    y += 1.5;
    escrever(dados.competencias, { align: "justify" });
  }

  escrever("ENTREVISTA REALIZADA", { bold: true, espacoAntes: 5 });
  y += 1.5;
  if (dados.entrevista) {
    for (const paragrafo of dados.entrevista.split(/\n+/).filter(Boolean)) {
      escrever(paragrafo, { align: "justify" });
    }
  }

  return doc.output("blob");
}
