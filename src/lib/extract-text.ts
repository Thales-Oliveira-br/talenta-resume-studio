/**
 * Extração de texto no navegador para os formatos de currículo aceitos.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data }).promise;
    const partes: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      let linha = "";
      let ultimoY: number | null = null;
      for (const item of content.items as Array<{ str?: string; transform?: number[] }>) {
        const y = Math.round(item.transform?.[5] ?? 0);
        if (ultimoY !== null && Math.abs(y - ultimoY) > 3) {
          partes.push(linha.trim());
          linha = "";
        }
        linha += (item.str ?? "") + " ";
        ultimoY = y;
      }
      if (linha.trim()) partes.push(linha.trim());
      partes.push("");
    }
    return partes.join("\n").trim();
  }

  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    const mammoth = await import("mammoth/mammoth.browser.js");
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value.trim();
  }


  if (name.endsWith(".txt") || name.endsWith(".rtf") || name.endsWith(".md")) {
    return (await file.text()).trim();
  }

  throw new Error("Formato não suportado. Envie PDF, DOCX ou TXT.");
}
