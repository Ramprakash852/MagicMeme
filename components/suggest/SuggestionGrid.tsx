"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemeStore } from "@/store/useMemeStore";
import { SuggestionCard } from "./SuggestionCard";
import { SuggestionSkeleton } from "./SuggestionSkeleton";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const LOADING_PHRASES = [
  "Reading the vibes…",
  "Analyzing chaos level…",
  "Consulting the meme lords…",
  "Summoning creativity…",
  "Cooking something spicy…",
];

export function SuggestionGrid() {
  const {
    imageData,
    imageMimeType,
    suggestions,
    setSuggestions,
    selectSuggestion,
    isLoading,
    setLoading,
    setError,
    reset,
    error,
  } = useMemeStore();

  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    if (!imageData || suggestions.length > 0) return;
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData]);

  // Cycle loading phrases
  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % LOADING_PHRASES.length);
    }, 2000);
    return () => clearInterval(id);
  }, [isLoading]);

  async function fetchSuggestions() {
    setLoading(true);
    setError(null);
    setPhraseIdx(0);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, mimeType: imageMimeType }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch {
      setError("AI request failed");
      toast.error("Could not generate captions. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* AI thinking indicator */}
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ background: "var(--lime)" }}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
              <motion.div className="space-y-1.5">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                  AI is cooking…
                </h2>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phraseIdx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm md:text-base"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {LOADING_PHRASES[phraseIdx]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2"
                style={{
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                <span className="text-red-400 text-2xl">!</span>
              </div>
              <motion.div className="space-y-1.5">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                  Something went wrong
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  The AI had a moment. Try again?
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2"
            >
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                Pick your caption
              </h2>
              <p
                className="text-sm md:text-base"
                style={{ color: "var(--text-secondary)" }}
              >
                <span style={{ color: "var(--lime)", fontWeight: 600 }}>
                  {suggestions.length}
                </span>{" "}
                options generated · tap to edit
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <SuggestionSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.06,
                    delayChildren: 0.08,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {suggestions.map((s, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.96 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        mass: 0.8,
                      },
                    },
                  }}
                >
                  <SuggestionCard
                    suggestion={s}
                    imageData={imageData!}
                    index={i}
                    onSelect={selectSuggestion}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer actions */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2"
        >
          <Button variant="ghost" size="sm" onClick={reset}>
            <BackIcon />
            <span>New photo</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchSuggestions}
            loading={isLoading}
          >
            <RefreshIcon />
            <span>Regenerate</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M7.5 2L3.5 6l4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M10 6A4 4 0 1 1 6 2a4 4 0 0 1 3.5 2.06M10 2v2.5H7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
