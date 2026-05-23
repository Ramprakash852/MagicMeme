"use client";
/**
 * ExportButton — animated export CTA with loading state
 */
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

export function ExportButton({ onClick, loading, className }: Props) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={loading ? {} : { scale: 1.04 }}
      whileTap={loading ? {} : { scale: 0.96 }}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all overflow-hidden disabled:cursor-not-allowed",
        loading
          ? "bg-[#C8F135]/60 text-black/60"
          : "bg-[#C8F135] text-black hover:bg-[#d4f54d] shadow-lg shadow-[#C8F135]/25",
        className,
      )}
    >
      {/* Shimmer on hover */}
      {!loading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
            <span>Exporting…</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5"
          >
            <DownloadIcon />
            <span>Share Meme</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 1v8M4 6l3 3 3-3M2 11h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
