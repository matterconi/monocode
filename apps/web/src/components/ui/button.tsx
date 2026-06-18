import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "glass";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-sm font-semibold transition-transform duration-200 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-foreground text-background hover:scale-[1.02]",
        variant === "glass" && "liquid-glass text-foreground hover:scale-[1.02]",
        className,
      )}
      {...props}
    />
  );
}
