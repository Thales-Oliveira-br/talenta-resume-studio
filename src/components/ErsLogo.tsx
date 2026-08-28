export const ERS_LOGO_URL = "/ers-logo.png";
export const NIGHTWAKER_LOGO_URL = "/nighttracker-logo.png";

export function ErsLogo({ className }: { className?: string }) {
  return (
    <img
      src={ERS_LOGO_URL}
      alt="Elizabete Rosa Scain — Desenvolvimento Humano"
      className={className}
      loading="eager"
    />
  );
}
