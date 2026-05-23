"use client";
/**
 * CopyLinkButton — copies the share URL to clipboard.
 * Shows a tick + "Copied!" confirmation with spring animation.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  url: string;
}

export function CopyLinkButton({ url }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2200);
    } catch {
      // Fallback for non-secure contexts
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setState("copied");
        setTimeout(() => setState("idle"), 2200);
      } catch {
        setState("error");
        setTimeout(() => setState("idle"), 2000);
      }
    }
  }, [url]);

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={state === "idle" ? { scale: 1.04 } : {}}
      whileTap={state === "idle" ? { scale: 0.94 } : {}}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="relative flex items-center justify-center gap-2 overflow-hidden rounded-full border px-4 py-2.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F135]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] md:justify-start md:px-5 md:py-3 md:text-sm"
      style={{
        background:
          state === "copied" ? "var(--lime)" : "rgba(255,255,255,0.04)",
        borderColor:
          state === "copied"
            ? "var(--lime)"
            : state === "error"
              ? "#ef4444"
              : "rgba(255,255,255,0.08)",
        color:
          state === "copied"
            ? "#000"
            : state === "error"
              ? "#f87171"
              : "var(--text-secondary)",
        boxShadow:
          state === "copied"
            ? "0 10px 24px rgba(200,241,53,0.28)"
            : state === "error"
              ? "0 4px 12px rgba(244,63,94,0.2)"
              : "0 10px 24px rgba(0,0,0,0.24)",
      }}
      disabled={state !== "idle"}
    >
      {/* Shimmer sweep on copy */}
      {state === "copied" && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      )}

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.85, y: 2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -2 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 relative z-10"
          >
            <LinkIcon />
            <span className="hidden sm:inline">Copy link</span>
            <span className="sm:hidden">Copy</span>
          </motion.div>
        )}
        {state === "copied" && (
          <motion.div
            key="copied"
            initial={{ opacity: 0, scale: 0.6, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -4 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            className="flex items-center gap-2 relative z-10"
          >
            <CheckIcon />
            <span className="hidden sm:inline">Copied!</span>
            <span className="sm:hidden">Done</span>
          </motion.div>
        )}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 relative z-10"
          >
            <span>✕</span>
            <span className="hidden sm:inline">Failed</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M5.5 8.5a3.5 3.5 0 0 0 5 0l2-2a3.536 3.536 0 0 0-5-5L6.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 5.5a3.5 3.5 0 0 0-5 0l-2 2a3.536 3.536 0 0 0 5 5L7.5 11.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.5 7l3.5 3.5 5.5-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
