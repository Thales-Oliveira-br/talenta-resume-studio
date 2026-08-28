import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { TalentaBackdrop } from "@/components/TalentaBackdrop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { entrar, estaLogado } from "@/lib/session";

const LOGO_URL = "/nighttracker-logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Talenta — Seu talento. No formato certo." },
      {
        name: "description",
        content:
          "Acesso ao Talenta: leitura, estruturação e padronização de currículos conforme o padrão da empresa.",
      },
      { property: "og:title", content: "Talenta — Seu talento. No formato certo." },
      {
        property: "og:description",
        content: "Leitura, estruturação e padronização de currículos conforme o padrão da empresa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    if (estaLogado()) navigate({ to: "/", replace: true });
  }, [navigate]);

  return (
    <main className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <TalentaBackdrop />

      {/* Painel de marca */}
      <section className="relative flex flex-col justify-between px-8 py-10 lg:px-16 lg:py-14">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Talenta</p>

        <div className="max-w-md py-16">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
            Seu talento.
            <br />
            No formato certo.
          </h1>
          <div className="mt-5 h-1 w-16 bg-primary" />
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Leitura, estruturação e padronização de currículos conforme o padrão da empresa. Envie
            qualquer modelo em PDF ou DOCX e exporte no layout oficial em .docx ou .pdf.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">Uso interno · Documentos controlados</p>
      </section>

      {/* Painel de acesso */}
      <section className="flex items-center justify-center px-8 py-16">
        <div className="glass w-full max-w-sm rounded-3xl p-8">
          <div className="text-center">
            <img
              src={LOGO_URL}
              alt="Night Tracker — Tecnologia e Informação"
              width={450}
              height={220}
              className="mx-auto h-16 w-auto object-contain"
            />
            <p className="mt-6 text-5xl font-bold tracking-tight text-foreground">Talenta</p>
            <div className="mx-auto mt-3 h-1 w-16 bg-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Seu talento. No formato certo.</p>
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              entrar();
              navigate({ to: "/", replace: true });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-xs font-semibold">
                Usuário
              </Label>
              <Input
                id="usuario"
                autoComplete="username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-xs font-semibold">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="glass-input"
                required
              />
            </div>

            <Button type="submit" className="w-full font-semibold">
              Entrar no sistema
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Talenta — Seu talento. No formato certo.
          </p>
        </div>
      </section>
    </main>
  );
}
