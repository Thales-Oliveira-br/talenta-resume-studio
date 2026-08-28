import { NIGHTWAKER_LOGO_URL } from "@/components/ErsLogo";

export function PoweredByFooter() {
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-4">
      <a
        href="https://nightwakertecnologia.com"
        target="_blank"
        rel="noopener noreferrer"
        className="glass pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-muted-foreground transition hover:text-foreground"
      >
        <span className="text-[10px] uppercase tracking-widest">Powered by</span>
        <img
          src={NIGHTWAKER_LOGO_URL}
          alt="NIGHTWAKER Tecnologia"
          className="h-5 w-auto dark:invert-0"
          loading="lazy"
        />
      </a>
    </footer>
  );
}
