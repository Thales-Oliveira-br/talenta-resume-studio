import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  FileType2,
  Loader2,
  RotateCcw,
  Settings2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { ErsLogo, ERS_LOGO_URL } from "@/components/ErsLogo";
import { PoweredByFooter } from "@/components/PoweredByFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TalentaBackdrop } from "@/components/TalentaBackdrop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/material-design-3-switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { extractTextFromFile } from "@/lib/extract-text";
import { estaLogado, sair } from "@/lib/session";
import { padronizarAvaliacao, padronizarCurriculo } from "@/lib/resume.functions";
import { CURRICULO_VAZIO } from "@/lib/resume-types";
import type { Avaliacao, Curriculo } from "@/lib/resume-types";


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

const CONTATO_ERS = {
  telefone: "(54) 9 99014063",
  email: "elizabete@elizabetescain.com.br",
};

function TalentaApp() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [relato, setRelato] = useState("");
  const [arrastando, setArrastando] = useState(false);
  const [dados, setDados] = useState<Curriculo | null>(null);
  const [falha, setFalha] = useState<string | null>(null);
  const [ocultarContato, setOcultarContato] = useState(false);
  const [contatosErs, setContatosErs] = useState(false);
  const [arquivoPda, setArquivoPda] = useState<File | null>(null);
  const [arquivoDisc, setArquivoDisc] = useState<File | null>(null);
  const [relatoPda, setRelatoPda] = useState("");
  const [relatoDisc, setRelatoDisc] = useState("");
  const [avaliacaoPda, setAvaliacaoPda] = useState<Avaliacao | null>(null);
  const [avaliacaoDisc, setAvaliacaoDisc] = useState<Avaliacao | null>(null);
  const [padronizandoAv, setPadronizandoAv] = useState<"PDA" | "DISC" | null>(null);


  const [exportando, setExportando] = useState<"docx" | "pdf" | null>(null);
  const [opcoesAberto, setOpcoesAberto] = useState(false);
  const [incCurriculo, setIncCurriculo] = useState(false);
  const [incPda, setIncPda] = useState(false);
  const [incDisc, setIncDisc] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!estaLogado()) navigate({ to: "/login", replace: true });
  }, [navigate]);

  const padronizar = useServerFn(padronizarCurriculo);
  const padronizarAv = useServerFn(padronizarAvaliacao);


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
      setIncCurriculo(true);
      toast.success("Currículo padronizado no modelo da empresa.");
    },
    onError: (erro: Error) => {
      console.error("[Talenta] falha ao padronizar:", erro);
      const msg = erro.message || "Não foi possível padronizar o currículo.";
      setFalha(msg);
      toast.error(msg);
    },
  });

  const montarRegistro = (base: Curriculo): Curriculo => {
    const registro: Curriculo = { ...base, entrevista: relato.trim() || base.entrevista };
    if (ocultarContato) {
      registro.email = "";
      registro.telefone = "";
    }
    if (contatosErs) {
      registro.email = CONTATO_ERS.email;
      registro.telefone = CONTATO_ERS.telefone;
    }
    return registro;
  };

  const reiniciar = () => {
    setArquivo(null);
    setRelato("");
    setDados(null);
    setFalha(null);
    setArquivoPda(null);
    setArquivoDisc(null);
    setRelatoPda("");
    setRelatoDisc("");
    setAvaliacaoPda(null);
    setAvaliacaoDisc(null);

    if (inputRef.current) inputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const lerAvaliacao = async (tipo: "PDA" | "DISC", arq: File) => {
    const texto = await extractTextFromFile(arq);
    if (texto.trim().length < 30) {
      throw new Error(
        `Não foi possível ler texto no arquivo do ${tipo} (pode ser um PDF digitalizado). Envie um PDF com texto selecionável, DOCX ou TXT.`,
      );
    }
    const avaliacao = (await padronizarAv({ data: { tipo, texto } })) as Avaliacao;
    return { texto, avaliacao };
  };

  const padronizarAnexo = async (tipo: "PDA" | "DISC") => {
    const arq = tipo === "PDA" ? arquivoPda : arquivoDisc;
    if (!arq) {
      toast.error(`Anexe o arquivo do ${tipo}.`);
      return;
    }
    setPadronizandoAv(tipo);
    try {
      const { avaliacao } = await lerAvaliacao(tipo, arq);
      if (tipo === "PDA") {
        setAvaliacaoPda(avaliacao);
        setIncPda(true);
      } else {
        setAvaliacaoDisc(avaliacao);
        setIncDisc(true);
      }
      toast.success(`${tipo} padronizado no modelo da empresa.`);
    } catch (erro) {
      toast.error((erro as Error).message || `Não foi possível padronizar o ${tipo}.`);
    } finally {
      setPadronizandoAv(null);
    }
  };

  const montarAnexos = async () => {
    const lista: {
      titulo: string;
      texto: string;
      relato: string;
      avaliacao: Avaliacao | null;
    }[] = [];

    const preparar = async (
      tipo: "PDA" | "DISC",
      arq: File,
      relatoItem: string,
      cache: Avaliacao | null,
    ) => {
      if (cache) {
        lista.push({ titulo: tipo, texto: "", relato: relatoItem, avaliacao: cache });
        return;
      }
      const { texto, avaliacao } = await lerAvaliacao(tipo, arq);
      if (tipo === "PDA") setAvaliacaoPda(avaliacao);
      else setAvaliacaoDisc(avaliacao);
      lista.push({ titulo: tipo, texto, relato: relatoItem, avaliacao });
    };

    if (incPda) {
      if (!arquivoPda) throw new Error("Anexe o arquivo do PDA na aba PDA.");
      await preparar("PDA", arquivoPda, relatoPda, avaliacaoPda);
    }
    if (incDisc) {
      if (!arquivoDisc) throw new Error("Anexe o arquivo do DISC na aba DISC.");
      await preparar("DISC", arquivoDisc, relatoDisc, avaliacaoDisc);
    }
    return lista;
  };



  const sufixoArquivo = () =>
    [incCurriculo && "CURRICULO", incPda && "PDA", incDisc && "DISC"].filter(Boolean).join("_") ||
    "DOCUMENTO";

  const exportar = async (formato: "docx" | "pdf") => {
    if (!incCurriculo && !incPda && !incDisc) {
      toast.error("Selecione ao menos um documento para exportar.");
      return;
    }
    if (incCurriculo && !dados) {
      toast.error("Padronize o currículo na aba Currículo antes de incluí-lo na exportação.");
      return;
    }
    setExportando(formato);
    try {
      const registro = dados ? montarRegistro(dados) : CURRICULO_VAZIO;
      const anexos = await montarAnexos();
      const incluir = incCurriculo && dados !== null;
      const opts = { incluirCurriculo: incluir, anexos };
      const nome = dados
        ? nomeBase(dados).replace(/^CURRICULO/, sufixoArquivo())
        : `${sufixoArquivo()}_PADRONIZADO`;
      if (formato === "docx") {
        const { gerarDocx } = await import("@/lib/build-docx");
        baixar(await gerarDocx(registro, ERS_LOGO_URL, opts), `${nome}.docx`);
      } else {
        const { gerarPdf } = await import("@/lib/build-pdf");
        baixar(await gerarPdf(registro, ERS_LOGO_URL, opts), `${nome}.pdf`);
      }
      setOpcoesAberto(false);
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
            variant="dock"
            size="sm"
            className="rounded-2xl"
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

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Padronize os documentos que precisar — individualmente ou todos — e exporte junto.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="dock"
              className="rounded-2xl"
              disabled={exportando !== null}
              onClick={() => setOpcoesAberto(true)}
            >
              <Settings2 className="size-4" />
              Opções de exportação
            </Button>
            <Button
              variant="dock"
              className="rounded-2xl"
              disabled={exportando !== null}
              onClick={reiniciar}
            >
              <RotateCcw className="size-4" />
              Começar de novo
            </Button>
          </div>
        </div>

        <section className="glass mt-4 rounded-3xl p-6 sm:p-8">
          <Tabs defaultValue="curriculo" className="w-full">
            <TabsList className="glass-soft grid w-full grid-cols-3 rounded-2xl p-1">
              <TabsTrigger value="curriculo" className="rounded-xl">
                Currículo
              </TabsTrigger>
              <TabsTrigger value="pda" className="rounded-xl">
                PDA
              </TabsTrigger>
              <TabsTrigger value="disc" className="rounded-xl">
                DISC
              </TabsTrigger>
            </TabsList>

            <TabsContent value="curriculo" className="mt-6 space-y-6">
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
                      <p className="text-sm font-medium">
                        Arraste o arquivo aqui ou clique para selecionar
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOCX ou TXT — qualquer modelo
                      </p>
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

              <div className="glass-soft space-y-3 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4 text-sm">
                  <label htmlFor="ocultar-contato" className="cursor-pointer">
                    Ocultar telefone/e-mail do candidato
                    <span className="block text-xs text-muted-foreground">
                      A linha de contato do candidato não aparece no currículo padronizado.
                    </span>
                  </label>
                  <Switch
                    id="ocultar-contato"
                    checked={ocultarContato}
                    onCheckedChange={setOcultarContato}
                    showIcons
                    haptic="light"
                    aria-label="Ocultar telefone e e-mail do candidato"
                  />
                </div>
                <div className="flex items-start justify-between gap-4 text-sm">
                  <label htmlFor="contatos-ers" className="cursor-pointer">
                    Inserir contatos da Elizabete
                    <span className="block text-xs text-muted-foreground">
                      Usa {CONTATO_ERS.telefone} e {CONTATO_ERS.email} no lugar dos do candidato.
                    </span>
                  </label>
                  <Switch
                    id="contatos-ers"
                    checked={contatosErs}
                    onCheckedChange={setContatosErs}
                    showIcons
                    haptic="light"
                    aria-label="Inserir contatos da Elizabete"
                  />
                </div>
              </div>

              <Button
                variant="dockPrimary"
                className="w-full rounded-2xl"
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
            </TabsContent>

            <TabsContent value="pda" className="mt-6">
              <AnexoExtra
                titulo="Arquivo do PDA"
                arquivo={arquivoPda}
                onArquivo={(f) => {
                  setArquivoPda(f);
                  setAvaliacaoPda(null);
                }}
                rotuloRelato="Relato do PDA"
                relato={relatoPda}
                onRelato={setRelatoPda}
                idRelato="relato-pda"
                rotuloBotao="Padronizar PDA"
                processando={padronizandoAv === "PDA"}
                pronto={avaliacaoPda !== null}
                onPadronizar={() => padronizarAnexo("PDA")}
              />
            </TabsContent>

            <TabsContent value="disc" className="mt-6">
              <AnexoExtra
                titulo="Arquivo do DISC"
                arquivo={arquivoDisc}
                onArquivo={(f) => {
                  setArquivoDisc(f);
                  setAvaliacaoDisc(null);
                }}
                rotuloRelato="Relato do DISC"
                relato={relatoDisc}
                onRelato={setRelatoDisc}
                idRelato="relato-disc"
                rotuloBotao="Padronizar DISC"
                processando={padronizandoAv === "DISC"}
                pronto={avaliacaoDisc !== null}
                onPadronizar={() => padronizarAnexo("DISC")}
              />
            </TabsContent>

          </Tabs>
        </section>



        {dados && (
          <section className="glass mt-8 space-y-5 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">{dados.nome || "Candidato"}</h2>
                <p className="text-xs text-muted-foreground">
                  {[dados.cidade, montarRegistro(dados).telefone, montarRegistro(dados).email]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="dock"
                  className="rounded-2xl"
                  disabled={exportando !== null}
                  onClick={() => exportar("docx")}
                >
                  {exportando === "docx" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                  .docx
                </Button>
                <Button
                  variant="dockPrimary"
                  className="rounded-2xl"
                  disabled={exportando !== null}
                  onClick={() => exportar("pdf")}
                >
                  {exportando === "pdf" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileType2 className="size-4" />
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

      <Dialog open={opcoesAberto} onOpenChange={setOpcoesAberto}>
        <DialogContent className="glass rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Opções de exportação</DialogTitle>
            <DialogDescription>
              Escolha o que entra no documento unificado e o formato do download.
            </DialogDescription>
          </DialogHeader>

          <div className="glass-soft space-y-3 rounded-2xl p-4">
            {[
              {
                rotulo: "Currículo",
                marcado: incCurriculo,
                alterar: setIncCurriculo,
                ajuda: dados
                  ? "Currículo padronizado e relato da entrevista."
                  : "Padronize o currículo na aba Currículo para incluí-lo.",
              },
              {
                rotulo: "PDA",
                marcado: incPda,
                alterar: setIncPda,
                ajuda: arquivoPda ? arquivoPda.name : "Nenhum arquivo anexado na aba PDA.",
              },
              {
                rotulo: "DISC",
                marcado: incDisc,
                alterar: setIncDisc,
                ajuda: arquivoDisc ? arquivoDisc.name : "Nenhum arquivo anexado na aba DISC.",
              },
            ].map((opcao) => (
              <div key={opcao.rotulo} className="flex items-start justify-between gap-4 text-sm">
                <label htmlFor={`exportar-${opcao.rotulo.toLowerCase()}`} className="cursor-pointer">
                  {opcao.rotulo}
                  <span className="block text-xs text-muted-foreground">{opcao.ajuda}</span>
                </label>
                <Switch
                  id={`exportar-${opcao.rotulo.toLowerCase()}`}
                  checked={opcao.marcado}
                  onCheckedChange={opcao.alterar}
                  showIcons
                  haptic="light"
                  aria-label={`Incluir ${opcao.rotulo} na exportação`}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="dock"
              className="flex-1 rounded-2xl"
              disabled={exportando !== null}
              onClick={() => exportar("docx")}
            >
              {exportando === "docx" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileText className="size-4" />
              )}
              Baixar .docx
            </Button>
            <Button
              variant="dockPrimary"
              className="flex-1 rounded-2xl"
              disabled={exportando !== null}
              onClick={() => exportar("pdf")}
            >
              {exportando === "pdf" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileType2 className="size-4" />
              )}
              Baixar .pdf
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

function AnexoExtra({
  titulo,
  arquivo,
  onArquivo,
  rotuloRelato,
  relato,
  onRelato,
  idRelato,
  rotuloBotao,
  processando,
  pronto,
  onPadronizar,
}: {
  titulo: string;
  arquivo: File | null;
  onArquivo: (f: File | null) => void;
  rotuloRelato: string;
  relato: string;
  onRelato: (v: string) => void;
  idRelato: string;
  rotuloBotao: string;
  processando: boolean;
  pronto: boolean;
  onPadronizar: () => void;
}) {

  const ref = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">{titulo}</Label>
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
            if (f) onArquivo(f);
          }}
          onClick={() => ref.current?.click()}
          className={`glass-soft mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-dashed px-6 py-12 text-center transition ${
            arrastando ? "ring-2 ring-ring" : "hover:bg-accent/40"
          }`}
        >
          <input
            ref={ref}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onArquivo(f);
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
                  onArquivo(null);
                  if (ref.current) ref.current.value = "";
                }}
              >
                <X className="size-3" /> remover
              </button>
            </>
          ) : (
            <>
              <Upload className="size-7 text-primary" />
              <p className="text-sm font-medium">Arraste o arquivo aqui ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground">PDF, DOCX ou TXT</p>
            </>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor={idRelato} className="text-sm font-medium">
          {rotuloRelato}
        </Label>
        <Textarea
          id={idRelato}
          value={relato}
          onChange={(e) => onRelato(e.target.value)}
          rows={5}
          placeholder="Observações e interpretação do resultado..."
          className="glass-input mt-2 resize-y"
        />
      </div>

      <Button
        variant="dockPrimary"
        className="w-full rounded-2xl"
        disabled={!arquivo || processando}
        onClick={onPadronizar}
      >
        {processando ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Lendo e padronizando...
          </>
        ) : (
          <>
            <Sparkles className="size-4" /> {rotuloBotao}
          </>
        )}
      </Button>

      {pronto && !processando && (
        <p className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-xs text-success">
          Conteúdo padronizado e pronto para entrar na exportação.
        </p>
      )}

    </div>
  );
}
