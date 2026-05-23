"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref as React.RefObject<HTMLButtonElement>}
        disabled={isDisabled}
        whileHover={
          isDisabled
            ? {}
            : {
                scale: variant === "primary" ? 1.03 : 1.02,
                y: variant === "primary" ? -1 : 0,
              }
        }
        whileTap={isDisabled ? {} : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className={cn(
          // Base
          "relative inline-flex items-center justify-center gap-2 overflow-hidden",
          "font-semibold select-none cursor-pointer whitespace-nowrap",
          "transition-colors duration-150 will-change-transform",
          // Disabled
          "disabled:opacity-40 disabled:cursor-not-allowed",
          // Focus
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F135]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c]",
          // Variants
          variant === "primary" && [
            "rounded-full bg-[#C8F135] text-black font-black tracking-tight",
            "shadow-[0_10px_30px_rgba(200,241,53,0.22)]",
            "hover:bg-[#d2f444] hover:shadow-[0_16px_36px_rgba(200,241,53,0.3)]",
          ],
          variant === "secondary" && [
            "rounded-full border font-semibold",
            "bg-[var(--surface-card)] text-white/80 hover:text-white",
            "border-[var(--border)] hover:border-[rgba(200,241,53,0.28)]",
            "hover:bg-[var(--surface-hover)]",
          ],
          variant === "ghost" && [
            "rounded-full",
            "text-white/55 hover:text-white",
            "hover:bg-white/[0.06]",
          ],
          variant === "danger" && [
            "rounded-full border",
            "bg-red-500/8 text-red-300",
            "border-red-500/20 hover:border-red-500/40",
            "hover:bg-red-500/15",
          ],
          // Sizes
          size === "sm" && "px-3.5 py-1.5 text-xs h-8",
          size === "md" && "px-4.5 py-2.5 text-sm h-10",
          size === "lg" && "px-6 py-3 text-sm h-12",
          className,
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {/* Primary shine sweep */}
        {variant === "primary" && !isDisabled && (
          <span
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
              transition: "opacity 0.2s",
            }}
          />
        )}

        {loading && (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current/25 border-t-current animate-spin shrink-0" />
        )}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
