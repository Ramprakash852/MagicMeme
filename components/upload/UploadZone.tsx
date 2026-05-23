"use client";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { imageToBase64 } from "@/lib/utils";

interface Props {
  onUpload: (data: string, mimeType: string) => void;
  onWebcam: () => void;
}

export function UploadZone({ onUpload, onWebcam }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setIsProcessing(true);
      try {
        const data = await imageToBase64(file);
        onUpload(data, file.type);
      } finally {
        setIsProcessing(false);
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxSize: 10 * 1024 * 1024,
    onDrop: ([file]) => file && processFile(file),
  });
  const { onAnimationStart: _onAnimationStart, ...dropzoneRootProps } =
    getRootProps() as React.HTMLAttributes<HTMLDivElement>;

  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      if (!item) return;
      const file = item.getAsFile();
      if (file) processFile(file);
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [processFile]);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4 mx-auto">
      {/* Main drop zone */}
      <div
        {...dropzoneRootProps}
        className="premium-card accent-outline relative cursor-pointer overflow-hidden rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F135]/50"
        style={{
          background: isDragActive
            ? "linear-gradient(180deg, rgba(200,241,53,0.08), rgba(255,255,255,0.02))"
            : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          border:
            isDragActive || isProcessing
              ? "1px solid rgba(200,241,53,0.45)"
              : "1px dashed rgba(255,255,255,0.12)",
          boxShadow: isDragActive
            ? "0 0 0 1px rgba(200,241,53,0.18), 0 24px 60px rgba(0,0,0,0.45), 0 0 70px rgba(200,241,53,0.08) inset"
            : isProcessing
              ? "0 0 0 1px rgba(200,241,53,0.12), 0 24px 60px rgba(0,0,0,0.42)"
              : "0 24px 60px rgba(0,0,0,0.42)",
          transition: "all 0.24s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        role="button"
        aria-label="Upload image"
      >
        <input {...getInputProps()} />

        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-60"
          animate={{
            backgroundPosition: isDragActive
              ? ["0% 0%", "100% 100%"]
              : ["0% 0%", "0% 0%"],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at top left, rgba(200,241,53,0.08), transparent 35%), radial-gradient(circle at bottom right, rgba(255,255,255,0.05), transparent 28%)",
            backgroundSize: "160% 160%",
          }}
        />

        <div className="relative flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-10 text-center sm:min-h-[340px] sm:px-10 sm:py-12">
          {/* Icon area */}
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="relative"
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-3xl sm:h-20 sm:w-20"
                  style={{
                    background: "rgba(200,241,53,0.08)",
                    border: "1px solid rgba(200,241,53,0.2)",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full animate-spin"
                    style={{
                      border: "2.5px solid rgba(200,241,53,0.2)",
                      borderTopColor: "#C8F135",
                    }}
                  />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(200,241,53,0.12), transparent)",
                  }}
                />
              </motion.div>
            ) : isDragActive ? (
              <motion.div
                key="drag"
                initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 20 }}
                className="flex h-16 w-16 items-center justify-center rounded-3xl text-3xl sm:h-20 sm:w-20"
                style={{
                  background: "rgba(200,241,53,0.12)",
                  border: "1px solid rgba(200,241,53,0.3)",
                }}
              >
                <motion.span
                  animate={{ y: [0, -4, 0], rotate: [0, -8, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                >
                  🎯
                </motion.span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative"
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-3xl sm:h-20 sm:w-20"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <UploadArrowIcon />
                </div>
                {/* Subtle orbit accent */}
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(200,241,53,0.12)",
                    border: "1px solid rgba(200,241,53,0.25)",
                  }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "easeInOut",
                  }}
                >
                  <span className="text-[#C8F135] text-[8px] font-bold">+</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isProcessing ? "proc" : isDragActive ? "drag" : "idle"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-2"
            >
              <p
                className="font-semibold text-base leading-snug sm:text-lg"
                style={{ color: "var(--text-primary)" }}
              >
                {isProcessing
                  ? "Processing image…"
                  : isDragActive
                    ? "Release to upload 🔥"
                    : "Drop your photo here"}
              </p>
              <p
                className="text-sm sm:text-[15px]"
                style={{ color: "var(--text-secondary)" }}
              >
                {isProcessing
                  ? "AI is getting ready…"
                  : isDragActive
                    ? "Almost there!"
                    : "or tap to browse · paste from clipboard"}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Browse CTA */}
          {!isProcessing && !isDragActive && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="pointer-events-none rounded-full px-4 py-2.5 text-sm font-semibold"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--text-secondary)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset",
              }}
            >
              Browse files
            </motion.div>
          )}
        </div>

        {/* Active drag glow inset */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-[28px] pointer-events-none"
              style={{
                boxShadow: "0 0 60px rgba(200,241,53,0.12) inset",
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Secondary actions row */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.02, borderColor: "#3a3a3a" }}
          whileTap={{ scale: 0.97 }}
          onClick={onWebcam}
          className="premium-panel flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "var(--text-secondary)";
          }}
        >
          <CameraIcon />
          <span>Camera</span>
        </motion.button>

        <div
          className="flex items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] py-3 text-sm select-none text-[var(--text-quaternary)]"
          style={{}}
        >
          <PasteIcon />
          <span className="text-xs">⌘ V to paste</span>
        </div>
      </div>

      {/* Format note */}
      <p
        className="text-center text-[11px] uppercase tracking-[0.24em]"
        style={{ color: "var(--text-quaternary)" }}
      >
        JPG, PNG, WEBP · up to 10 MB
      </p>
    </div>
  );
}

function UploadArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 16V8M8 12l4-4 4 4"
        stroke="rgba(245,245,245,0.5)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 18h16"
        stroke="rgba(245,245,245,0.2)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M14 11.667A1.333 1.333 0 0 1 12.667 13H3.333A1.333 1.333 0 0 1 2 11.667V6a1.333 1.333 0 0 1 1.333-1.333h1.334L6 3h4l1.333 1.667h1.334A1.333 1.333 0 0 1 14 6v5.667Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function PasteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect
        x="3"
        y="4"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M3 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M5.5 7h3M5.5 9h3"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
