import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FileText, FileType, Loader2, Printer, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { ErsLogo, ERS_LOGO_URL } from "@/components/ErsLogo";
import { PoweredByFooter } from "@/components/PoweredByFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TalentaBackdrop } from "@/components/TalentaBackdrop";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractTextFromFile } from "@/lib/extract-text";
import { estaLogado, sair } from "@/lib/session";
import { padronizarCurriculo } from "@/lib/resume.functions";
import type { Curriculo } from "@/lib/resume-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Talenta — Padronização de currículos" },
      {
        name: "description",
        content:
          "Envie qualquer currículo, adicione o relato da entrevista e exporte no padrão da empresa em .docx ou .pdf.",
      },
      { property: "og:title", content: "Talenta — Padronização de currículos" },
      {
        property: "og:description",
        content:
          "Leitura, estruturação e padronização de currículos conforme o padrão da empresa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TalentaApp,
});

function baixar(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

function nomeBase(dados: Curriculo) {
  const limpo = dados.nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  return `CURRICULO_${limpo || "PADRONIZADO"}`;
}

function TalentaApp() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [relato, setRelato] = useState("");
  const [arrastando, setArrastando] = useState(false);
  const [dados, setDados] = useState<Curriculo | null>(null);
  const [falha, setFalha] = useState<string | null>(null);

  const [exportando, setExportando] = useState<"docx" | "pdf" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!estaLogado()) navigate({ to: "/login", replace: true });
  }, [navigate]);

  const padronizar = useServerFn(padronizarCurriculo);

  const processar = useMutation({
    mutationFn: async () => {
      if (!arquivo) throw new Error("Selecione um currículo.");
      const texto = await extractTextFromFile(arquivo);
      if (texto.trim().length < 30) {
        throw new Error(
          "Não foi possível ler texto neste arquivo (pode ser um PDF digitalizado/imagem). Envie um PDF com texto selecionável, DOCX ou TXT.",
        );
      }
      return padronizar({ data: { texto, relato } });
    },
    onSuccess: (resultado) => {
      setFalha(null);
      setDados(resultado as Curriculo);
      toast.success("Currículo padronizado no modelo da empresa.");
    },
    onError: (erro: Error) => {
      console.error("[Talenta] falha ao padronizar:", erro);
      const msg = erro.message || "Não foi possível padronizar o currículo.";
      setFalha(msg);
      toast.error(msg);
    },
  });


  const imprimir = async () => {
    if (!dados) return;
    setExportando("print");
    try {
      const registro = { ...dados, entrevista: relato.trim() || dados.entrevista };
      const { gerarPdf } = await import("@/lib/build-pdf");
      const blob = await gerarPdf(registro, ERS_LOGO_URL);
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
      document.body.appendChild(iframe);
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        iframe.remove();
      }, 60_000);
    } catch (erro) {
      toast.error((erro as Error).message || "Não foi possível preparar a impressão.");
    } finally {
      setExportando(null);
    }
  };

  const exportar = async (formato: "docx" | "pdf") => {
    if (!dados) return;
    setExportando(formato);
    try {
      const registro = { ...dados, entrevista: relato.trim() || dados.entrevista };
      if (formato === "docx") {
        const { gerarDocx } = await import("@/lib/build-docx");
        baixar(await gerarDocx(registro, ERS_LOGO_URL), `${nomeBase(dados)}.docx`);
      } else {
        const { gerarPdf } = await import("@/lib/build-pdf");
        baixar(await gerarPdf(registro, ERS_LOGO_URL), `${nomeBase(dados)}.pdf`);
      }
    } catch (erro) {
      toast.error((erro as Error).message || "Não foi possível gerar o arquivo.");
    } finally {
      setExportando(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      <TalentaBackdrop />

      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-b-3xl border-b border-glass-border bg-transparent px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <ErsLogo className="h-9 w-auto" />
          <div className="hidden sm:block">
            <p className="font-display text-lg font-semibold leading-none">Talenta</p>
            <p className="text-xs text-muted-foreground">Seu talento. No formato certo.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={() => {
              sair();
              navigate({ to: "/login", replace: true });
            }}
          >
            Sair
          </Button>
        </div>
      </header>


      <main className="mx-auto w-full max-w-3xl px-6 pb-28 pt-12">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Padronize um <span className="text-brand-gradient">currículo</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Leitura, estruturação e padronização de currículos conforme o padrão da empresa. Envie
          qualquer modelo em PDF ou DOCX — a saída sai sempre no layout oficial.
        </p>

        <section className="glass mt-8 space-y-6 rounded-3xl p-6 sm:p-8">
          <div>
            <Label className="text-sm font-medium">Currículo do candidato</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setArrastando(true);
              }}
              onDragLeave={() => setArrastando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastando(false);
                const f = e.dataTransfer.files?.[0];
                if (f) setArquivo(f);
              }}
              onClick={() => inputRef.current?.click()}
              className={`glass-soft mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-dashed px-6 py-12 text-center transition ${
                arrastando ? "ring-2 ring-ring" : "hover:bg-accent/40"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setArquivo(f);
                }}
              />
              {arquivo ? (
                <>
                  <FileText className="size-7 text-primary" />
                  <p className="text-sm font-medium">{arquivo.name}</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArquivo(null);
                      setDados(null);
                    }}
                  >
                    <X className="size-3" /> remover
                  </button>
                </>
              ) : (
                <>
                  <Upload className="size-7 text-primary" />
                  <p className="text-sm font-medium">Arraste o arquivo aqui ou clique para selecionar</p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX ou TXT — qualquer modelo</p>
                </>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="relato" className="text-sm font-medium">
              Relato da entrevista com o candidato
            </Label>
            <Textarea
              id="relato"
              value={relato}
              onChange={(e) => setRelato(e.target.value)}
              rows={6}
              placeholder="Impressões da recrutadora sobre a entrevista: perfil, comunicação, pretensão, disponibilidade, pontos de atenção..."
              className="glass-input mt-2 resize-y"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              O texto entra no bloco “ENTREVISTA REALIZADA” do currículo padronizado.
            </p>
          </div>

          <Button
            className="w-full rounded-xl"
            disabled={!arquivo || processar.isPending}
            onClick={() => processar.mutate()}
          >
            {processar.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Lendo e padronizando...
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Padronizar currículo
              </>
            )}
          </Button>

          {falha && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {falha}
            </p>
          )}
        </section>


        {dados && (
          <section className="glass mt-8 space-y-5 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">{dados.nome || "Candidato"}</h2>
                <p className="text-xs text-muted-foreground">
                  {[dados.cidade, dados.telefone, dados.email].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  disabled={exportando !== null}
                  onClick={() => exportar("docx")}
                >
                  {exportando === "docx" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  .docx
                </Button>
                <Button
                  className="rounded-xl"
                  disabled={exportando !== null}
                  onClick={() => exportar("pdf")}
                >
                  {exportando === "pdf" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  .pdf
                </Button>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              {dados.objetivo && (
                <Bloco titulo="Objetivo">
                  <p>{dados.objetivo}</p>
                </Bloco>
              )}
              {dados.formacao.length > 0 && (
                <Bloco titulo="Formação Acadêmica">
                  {dados.formacao.map((f) => (
                    <p key={f}>{f}</p>
                  ))}
                </Bloco>
              )}
              {dados.experiencias.length > 0 && (
                <Bloco titulo="Experiência Profissional">
                  <div className="space-y-3">
                    {dados.experiencias.map((exp) => (
                      <div key={`${exp.empresa}-${exp.periodo}`}>
                        <p className="flex flex-wrap justify-between gap-2 font-semibold">
                          <span>{exp.empresa}</span>
                          <span className="text-muted-foreground">{exp.periodo}</span>
                        </p>
                        <p className="text-xs italic text-muted-foreground">{exp.descricaoEmpresa}</p>
                        <p className="font-medium">{exp.cargo}</p>
                        <p className="text-justify text-muted-foreground">{exp.atividades}</p>
                      </div>
                    ))}
                  </div>
                </Bloco>
              )}
              {dados.competencias && (
                <Bloco titulo="Competências Técnicas">
                  <p>{dados.competencias}</p>
                </Bloco>
              )}
              <Bloco titulo="Entrevista Realizada">
                <p className="whitespace-pre-line text-muted-foreground">
                  {relato.trim() || dados.entrevista || "Nenhum relato informado."}
                </p>
              </Bloco>
            </div>
          </section>
        )}
      </main>

      <PoweredByFooter />
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="glass-soft rounded-2xl p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{titulo}</p>
      {children}
    </div>
  );
}
