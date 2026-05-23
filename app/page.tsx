"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemeStore } from "@/store/useMemeStore";
import { UploadZone } from "@/components/upload/UploadZone";
import { WebcamCapture } from "@/components/upload/WebcamCapture";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { SuggestionGrid } from "@/components/suggest/SuggestionGrid";
import { MemeCanvas } from "@/components/editor/MemeCanvas";
import { SharePanel } from "@/components/share/SharePanel";

const stepVariants = {
  enter: { opacity: 0, y: 20, filter: "blur(4px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(4px)" },
};

const stepTransition = {
  duration: 0.32,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

const isFullscreen = (step: string) => step === "edit";

const FEED_HIGHLIGHTS = [
  {
    badge: "Tooling",
    title: "Fast import pipeline",
    description:
      "Drag, paste, or browse. Image lands in the editor flow instantly.",
    comments: 124,
  },
  {
    badge: "AI",
    title: "Context-aware caption generation",
    description:
      "Claude analyzes visual context and returns structured meme suggestions.",
    comments: 89,
  },
  {
    badge: "Sharing",
    title: "Publish-ready output",
    description:
      "Edit on canvas, export to PNG, publish with live reaction support.",
    comments: 63,
  },
];

const QUICK_FILTERS = ["Hot", "New", "Top", "Rising", "AI Picks"];

const TRENDING_COMMUNITIES = [
  "r/magicmeme",
  "r/aicreators",
  "r/memelabs",
  "r/frontenddesign",
];

export default function Home() {
  const { step, setImage, setStep, reset } = useMemeStore();
  const [webcamOpen, setWebcamOpen] = useState(false);

  const handleUpload = (data: string, mimeType: string) => {
    setImage(data, mimeType);
    setStep("suggest");
  };

  return (
    <main className="premium-shell min-h-[100dvh] flex flex-col relative overflow-hidden text-[var(--text-primary)]">
      {/* Ambient background gradients */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div
          className="hero-orb lime absolute top-[-8rem] left-1/2 -translate-x-1/2 w-[44rem] h-[20rem] opacity-50"
          style={{
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="hero-orb white absolute bottom-[-8rem] right-[-6rem] w-[24rem] h-[24rem] opacity-60"
          style={{
            transform: "none",
          }}
        />
      </div>

      {/* Nav — hidden during fullscreen edit */}
      <AnimatePresence>
        {!isFullscreen(step) && (
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 shrink-0 sticky top-0 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,5,0.72)] backdrop-blur-2xl"
          >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
              {/* Logo */}
              <motion.button
                onClick={reset}
                whileHover={{ opacity: 0.85 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 shrink-0 group"
              >
                <div className="relative w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-[#C8F135] animate-ping opacity-40" />
                  <span className="relative w-2 h-2 rounded-full bg-[#C8F135] block" />
                </div>
                <span
                  className="font-black tracking-tight text-sm sm:text-base"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  Magic
                  <span style={{ color: "var(--lime)" }}>Meme</span>
                </span>
              </motion.button>

              {/* Step indicator — centered */}
              <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                <StepIndicator current={step} />
              </div>

              {/* Badge */}
              <div
                className="shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(200,241,53,0.16)] bg-[rgba(200,241,53,0.06)]"
                style={{
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8F135]" />
                <span className="text-[10px] font-semibold text-[#C8F135] tracking-[0.24em] uppercase">
                  AI
                </span>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="flex-1 flex flex-col"
            >
              <UploadScreen
                onUpload={handleUpload}
                onWebcam={() => setWebcamOpen(true)}
              />
            </motion.div>
          )}

          {step === "suggest" && (
            <motion.div
              key="suggest"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="flex-1"
            >
              <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
                <SuggestionGrid />
              </div>
            </motion.div>
          )}

          {step === "edit" && (
            <motion.div
              key="edit"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col min-h-0"
              style={{ height: "100dvh" }}
            >
              <MemeCanvas />
            </motion.div>
          )}

          {step === "share" && (
            <motion.div
              key="share"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="flex-1"
            >
              <div className="max-w-7xl mx-auto px-6 py-8 md:py-14">
                <SharePanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WebcamCapture
        open={webcamOpen}
        onCapture={handleUpload}
        onClose={() => setWebcamOpen(false)}
      />
    </main>
  );
}

// ─── Upload Screen (extracted for cleanliness) ───────────────────────────────────────────────
function UploadScreen({
  onUpload,
  onWebcam,
}: {
  onUpload: (data: string, mimeType: string) => void;
  onWebcam: () => void;
}) {
  return (
    <section className="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 flex items-center gap-2 overflow-x-auto rounded-2xl border border-[#2f2f2f] bg-[#101114] p-2"
        >
          {QUICK_FILTERS.map((filter, idx) => (
            <button
              key={filter}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                idx === 0
                  ? "bg-[#ff4500] text-white"
                  : "bg-[#1b1d22] text-white/70 hover:bg-[#252831]"
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-4">
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-2xl border border-[#2d2f36] bg-[#0f1014]"
            >
              <div className="flex items-start gap-3 border-b border-[#23262d] bg-[#12141a] px-3 py-2.5 sm:px-4">
                <div className="flex w-10 shrink-0 flex-col items-center rounded-lg bg-[#171a21] px-1.5 py-1 text-[11px] font-semibold text-white/55">
                  <span className="text-[#ff6a2b]">▲</span>
                  <span>1.2k</span>
                  <span>▼</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-white/45">
                    r/magicmeme • Posted by @you • now
                  </p>
                  <h1 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
                    Create a meme from any image with AI suggestions
                  </h1>
                  <p className="mt-1 text-sm text-white/60">
                    Upload your image to start the flow. Next step auto-opens
                    caption suggestions.
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <UploadZone onUpload={onUpload} onWebcam={onWebcam} />
              </div>
            </motion.article>

            {FEED_HIGHLIGHTS.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.05 + index * 0.06,
                  duration: 0.28,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex overflow-hidden rounded-2xl border border-[#2d2f36] bg-[#111318]"
              >
                <aside className="flex w-12 shrink-0 flex-col items-center justify-start gap-1 bg-[#161922] py-3 text-xs font-semibold text-white/55">
                  <span className="text-[#ff6a2b]">▲</span>
                  <span>{320 - index * 38}</span>
                  <span>▼</span>
                </aside>

                <div className="min-w-0 flex-1 p-4">
                  <div className="flex items-center gap-2 text-xs text-white/45">
                    <span className="rounded-full bg-[#232733] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#7aa2ff]">
                      {item.badge}
                    </span>
                    <span>r/frontend</span>
                    <span>•</span>
                    <span>{item.comments} comments</span>
                  </div>

                  <h2 className="mt-2 text-base font-semibold tracking-tight text-white sm:text-lg">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-white/65">
                    {item.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.28 }}
            className="space-y-4 lg:sticky lg:top-[5.5rem]"
          >
            <div className="overflow-hidden rounded-2xl border border-[#2d2f36] bg-[#101216]">
              <div className="border-b border-[#23262d] bg-gradient-to-r from-[#ff4500] to-[#ff7b45] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
                  About MagicMeme
                </p>
              </div>
              <div className="space-y-3 p-4">
                <p className="text-sm leading-6 text-white/70">
                  A frontend-first meme studio with AI-assisted captioning,
                  canvas editing, and social sharing.
                </p>
                <button
                  onClick={onWebcam}
                  className="w-full rounded-full bg-[#ff4500] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff5a1f]"
                >
                  Create Post (Camera)
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2d2f36] bg-[#101216] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                Trending communities
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                {TRENDING_COMMUNITIES.map((community) => (
                  <li
                    key={community}
                    className="flex items-center justify-between rounded-lg bg-[#171a22] px-3 py-2"
                  >
                    <span>{community}</span>
                    <span className="text-[#86b7ff]">Join</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#2d2f36] bg-[#101216] p-4 text-sm text-white/70">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                Creation flow
              </p>
              <ol className="space-y-2">
                <li>1. Upload image</li>
                <li>2. Review AI suggestions</li>
                <li>3. Edit in canvas</li>
                <li>4. Share and collect reactions</li>
              </ol>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}