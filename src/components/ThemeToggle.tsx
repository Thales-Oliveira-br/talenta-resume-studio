import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const CHAVE = "talenta.tema";
type Tema = "dark" | "light";

function aplicar(tema: Tema) {
  document.documentElement.classList.toggle("dark", tema === "dark");
}

export function ThemeToggle({ className }: { className?: string }) {
  const [tema, setTema] = useState<Tema>("dark");

  useEffect(() => {
    const salvo = (localStorage.getItem(CHAVE) as Tema | null) ?? "dark";
    setTema(salvo);
    aplicar(salvo);
  }, []);

  const alternar = () => {
    const proximo: Tema = tema === "dark" ? "light" : "dark";
    setTema(proximo);
    localStorage.setItem(CHAVE, proximo);
    aplicar(proximo);
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={tema === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      className={`glass-soft inline-flex size-9 items-center justify-center rounded-xl text-foreground transition hover:bg-accent/50 ${className ?? ""}`}
    >
      {tema === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
