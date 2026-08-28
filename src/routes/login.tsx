import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ErsLogo } from "@/components/ErsLogo";
import { entrar } from "@/lib/session";
import { TalentaBackdrop } from "@/components/TalentaBackdrop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  return (
    <div className="relative flex min-h-screen">
      <TalentaBackdrop />

      <div className="hidden flex-1 flex-col justify-between p-12 lg:flex">
        <div className="flex flex-col gap-5">
          <ErsLogo className="h-14 w-auto" />
          <span className="font-display text-2xl font-semibold tracking-tight">Talenta</span>
        </div>
        <div className="max-w-lg">
          <h2 className="font-display text-5xl font-semibold leading-[1.05]">
            <span className="text-brand-gradient">Seu talento.</span>
            <br />
            No formato certo.
          </h2>
          <p className="mt-5 text-base text-muted-foreground">
            Leitura, estruturação e padronização de currículos conforme o padrão da empresa.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Uso interno · Elizabete Rosa Scain — Desenvolvimento Humano
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <form
          className="glass w-full max-w-sm space-y-5 rounded-3xl p-8"
          onSubmit={(e) => {
            e.preventDefault();
            entrar();
            navigate({ to: "/" });
          }}
        >
          <div className="lg:hidden">
            <ErsLogo className="h-10 w-auto" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">Entrar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use o e-mail corporativo cadastrado pelo administrador.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              className="glass-input"
              placeholder="nome@empresa.com.br"
              defaultValue="elizabete@elizabetescain.com.br"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              className="glass-input"
              placeholder="••••••••"
              defaultValue="demonstracao"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl">
            Entrar no sistema
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Versão de demonstração — o login ainda não valida credenciais.
          </p>
        </form>
      </div>
    </div>
  );
}
