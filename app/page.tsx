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

const HERO_FEATURES = [
  {
    title: "Fast import",
    description: "Drag, paste, or browse in one motion.",
  },
  {
    title: "AI captions",
    description: "Generate sharper punchlines from any image.",
  },
  {
    title: "Ready to share",
    description: "Edit, export, and post without leaving the flow.",
  },
];

const WORKFLOW_STEPS = [
  {
    label: "01",
    title: "Upload a shot",
    description: "Drop a photo, paste from clipboard, or use your camera.",
  },
  {
    label: "02",
    title: "Pick the angle",
    description: "Let the AI suggest captions, then fine-tune the tone.",
  },
  {
    label: "03",
    title: "Publish the meme",
    description: "Polish the layout and share a clean link instantly.",
  },
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
    <section className="w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_minmax(0,0.9fr)] lg:gap-10">
        <div className="flex flex-col gap-8">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,241,53,0.18)] bg-[rgba(200,241,53,0.08)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C8F135] shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]"
            >
              <span className="h-2 w-2 rounded-full bg-[#C8F135] shadow-[0_0_18px_rgba(200,241,53,0.55)]" />
              AI-powered meme studio
            </motion.div>

            <div className="max-w-3xl space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.05,
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-display max-w-3xl"
              >
                Turn any image into a polished meme in seconds.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.4 }}
                className="max-w-2xl text-base leading-7 sm:text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                Drop a photo, let the model suggest the caption, then refine the
                layout in a clean editor built for fast, shareable output.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="grid gap-3 sm:grid-cols-3"
            >
              {HERO_FEATURES.map((feature, index) => (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.22 + index * 0.06,
                    duration: 0.32,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="premium-panel rounded-[22px] p-4"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(200,241,53,0.16)] bg-[rgba(200,241,53,0.06)] text-sm font-bold text-[#C8F135]">
                    0{index + 1}
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </motion.article>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              {[
                "Drag and drop upload",
                "Paste from clipboard",
                "Webcam capture",
                "One-flow editing",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm text-[var(--text-secondary)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C8F135]" />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-4 rounded-[28px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:grid-cols-3"
          >
            {WORKFLOW_STEPS.map((step) => (
              <div key={step.label} className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C8F135]">
                  {step.label}
                </div>
                <h3 className="text-base font-semibold tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[36px] bg-[radial-gradient(circle_at_top,_rgba(200,241,53,0.16),_transparent_58%)] blur-2xl" />

          <div className="relative rounded-[32px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,10,0.72)] p-4 shadow-[0_32px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-6">
            <div className="mb-4 flex flex-col gap-3 border-b border-[rgba(255,255,255,0.06)] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
                  Start here
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                  Upload your image
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,241,53,0.16)] bg-[rgba(200,241,53,0.06)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8F135]">
                Ready for desktop and mobile
              </div>
            </div>

            <UploadZone onUpload={onUpload} onWebcam={onWebcam} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
