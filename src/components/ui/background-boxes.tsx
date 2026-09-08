"use client";
import React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const COLORS = [
  "hsl(230 30% 66%)",
  "hsl(230 40% 55%)",
  "hsl(230 40% 45%)",
  "hsl(230 24% 82%)",
  "hsl(230 40% 62%)",
];

const getRandomColor = (): string =>
  COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0]!;

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(24).fill(1);
  const cols = new Array(40).fill(1);

  return (
    <div
      className={cn(
        "absolute inset-0 z-0 flex h-full w-full flex-col justify-center",
        className,
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <div key={`row-${i}`} className="flex w-full">
          {cols.map((_, j) => (
            <motion.div
              key={`col-${j}`}
              whileHover={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
              transition={{ duration: 1.6 }}
              className="relative h-12 w-12 shrink-0 border-b border-r border-border/30"
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="pointer-events-none absolute -right-[11px] -top-[11px] h-6 w-6 stroke-border/50"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
