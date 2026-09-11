import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Estilo "dock" (inspirado no dock do macOS): pílula de vidro, brilho superior
 * sutil, leve elevação no hover e ícone acima/à esquerda do rótulo.
 */
export const dockButtonClass =
  "group relative inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-foreground shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/20 hover:shadow-[0_16px_32px_-14px_rgba(0,0,0,0.7)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export const dockButtonPrimaryClass =
  "group relative inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/90 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_-12px_hsl(var(--primary)/0.8)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_18px_36px_-14px_hsl(var(--primary)/0.9)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export interface DockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "glass" | "primary";
}

export const DockButton = React.forwardRef<HTMLButtonElement, DockButtonProps>(
  ({ className, tone = "glass", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(tone === "primary" ? dockButtonPrimaryClass : dockButtonClass, className)}
      {...props}
    />
  ),
);
DockButton.displayName = "DockButton";

export function Dock({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-2xl",
        className,
      )}
      {...props}
    />
  );
}
