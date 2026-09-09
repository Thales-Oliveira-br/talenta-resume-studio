import { useEffect, useState } from "react";

import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";

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

  return <AnimatedThemeToggle isDark={tema === "dark"} onToggle={alternar} className={className} />;
}
