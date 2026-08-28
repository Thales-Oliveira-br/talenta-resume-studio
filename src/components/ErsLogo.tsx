import logo from "@/assets/ers-logo.png.asset.json";

export const ERS_LOGO_URL = logo.url;

export function ErsLogo({ className }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="Elizabete Rosa Scain — Desenvolvimento Humano"
      className={className}
      loading="eager"
    />
  );
}
