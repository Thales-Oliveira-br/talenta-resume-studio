import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-input bg-muted transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "peer-checked:border-primary peer-checked:bg-primary",
        destructive: "peer-checked:border-destructive peer-checked:bg-destructive",
      },
      size: {
        default: "h-8 w-[52px]",
        sm: "h-6 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function playHapticFeedback(type: "heavy" | "light" | "none") {
  if (type === "none" || typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.type = type === "heavy" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(type === "heavy" ? 180 : 800, now);
    if (type === "heavy") oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    gain.gain.setValueAtTime(type === "heavy" ? 0.4 : 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (type === "heavy" ? 0.12 : 0.08));
    oscillator.start(now);
    oscillator.stop(now + (type === "heavy" ? 0.15 : 0.08));
    oscillator.addEventListener("ended", () => void context.close());
  } catch {
    // Feedback is optional and must never interrupt the control.
  }
}

export interface MaterialSwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange">,
    VariantProps<typeof switchVariants> {
  onCheckedChange?: (checked: boolean) => void;
  showIcons?: boolean;
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
  haptic?: "heavy" | "light" | "none";
}

const Switch = React.forwardRef<HTMLInputElement, MaterialSwitchProps>(
  (
    {
      className,
      size,
      variant,
      checked,
      defaultChecked,
      onCheckedChange,
      showIcons = false,
      checkedIcon,
      uncheckedIcon,
      haptic = "none",
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
    const [pressed, setPressed] = React.useState(false);
    const currentChecked = checked ?? internalChecked;
    const small = size === "sm";
    const renderIcons = showIcons || checkedIcon || uncheckedIcon;

    const changeChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextChecked = event.target.checked;
      playHapticFeedback(haptic);
      if (checked === undefined) setInternalChecked(nextChecked);
      onCheckedChange?.(nextChecked);
    };

    return (
      <span
        className="relative inline-flex shrink-0 items-center"
        onPointerDown={() => !disabled && setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
      >
        <input
          {...props}
          ref={ref}
          id={id}
          type="checkbox"
          checked={currentChecked}
          disabled={disabled}
          onChange={changeChecked}
          className={cn("absolute inset-0 z-10 m-0 cursor-pointer opacity-0", disabled && "cursor-not-allowed")}
        />
        <span className={cn(switchVariants({ variant, size }), className)} aria-hidden="true">
          <span
            className={cn(
              "relative grid place-items-center rounded-full bg-muted-foreground text-background shadow-sm transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
              small ? "ml-0.5 size-3" : "ml-0.5 size-4",
              currentChecked && (small ? "translate-x-4 size-4 bg-primary-foreground text-primary" : "translate-x-5 size-6 bg-primary-foreground text-primary"),
              pressed && (small ? "-ml-0.5 size-5" : "-ml-0.5 size-7"),
            )}
          >
            {renderIcons && (
              <span className={cn("grid place-items-center", small ? "size-2.5" : "size-3.5")}>
                {currentChecked
                  ? checkedIcon ?? <Check className="size-full" strokeWidth={3} />
                  : uncheckedIcon ?? <X className="size-full" strokeWidth={3} />}
              </span>
            )}
          </span>
        </span>
      </span>
    );
  },
);
Switch.displayName = "MaterialDesign3Switch";

export { Switch };