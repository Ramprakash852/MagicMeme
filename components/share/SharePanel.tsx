"use client";
/**
 * SharePanel — Phase 5: full share experience.
 * Saves meme to Supabase, generates a public share URL, shows reactions.
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemeStore } from "@/store/useMemeStore";
import { Button } from "@/components/ui/Button";
import { CopyLinkButton } from "./CopyLinkButton";
import { ReactionBar } from "@/components/reactions/ReactionBar";
import { useRealtimeReactions } from "@/hooks/useRealtimeReactions";
import { cn } from "@/lib/utils";
import type { ReactionEmoji } from "@/types";

// ─── Save states ──────────────────────────────────────────────────────────────
type SaveState = "idle" | "saving" | "saved" | "error";

export function SharePanel() {
  const {
    editor,
    selectedSuggestion,
    savedMemeId,
    shareUrl,
    setStep,
    setSavedMemeId,
    setShareUrl,
    reset,
  } = useMemeStore();

  const dataUrl = editor.exportedDataUrl;
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Remote reaction state (triggers remote pop animation)
  const [remoteReaction, setRemoteReaction] = useState<string | null>(null);
  const handleRemoteReaction = useCallback((emoji: string) => {
    setRemoteReaction(emoji);
    setTimeout(() => setRemoteReaction(null), 500);
  }, []);

  // Reactions: subscribe to realtime updates
  const {
    reactions,
    loading: reactionsLoading,
    react,
    lastLocalReaction,
    totalReactions,
  } = useRealtimeReactions({
    memeId: savedMemeId || "",
    onRemoteReaction: handleRemoteReaction,
  });

  // ── Save to Supabase ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!dataUrl) return;
    setSaveState("saving");
    setSaveError(null);

    try {
      const res = await fetch("/api/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          templateId: editor.activeTemplateId,
          topText: selectedSuggestion?.topText ?? "",
          bottomText: selectedSuggestion?.bottomText ?? "",
          mainCaption: selectedSuggestion?.mainCaption ?? "",
          vibe: selectedSuggestion?.vibe ?? "",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Save failed");
      }

      const { id, shareUrl: url } = await res.json();
      setSavedMemeId(id);
      setShareUrl(url);
      // Override the step change from setSavedMemeId — we're already here
      setSaveState("saved");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
      setSaveState("error");
    }
  };

  // Auto-save on mount if not already saved
  useEffect(() => {
    if (!dataUrl || savedMemeId || saveState !== "idle") return;
    handleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUrl]);

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `magicmeme-${Date.now()}.png`;
    a.click();
  }, [dataUrl]);

  return (
    <div className="premium-card mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-[32px] px-5 py-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] md:px-8 md:py-8 lg:px-10 lg:py-10">
      {/* ── Title ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">
          {saveState === "saved" ? (
            <>
              Your meme is <span className="text-[#C8F135]">live.</span>
            </>
          ) : saveState === "error" ? (
            <>
              Something <span className="text-red-400">went wrong.</span>
            </>
          ) : (
            <>
              Your meme is <span className="text-[#C8F135]">ready.</span>
            </>
          )}
        </h2>
        <p className="mt-2 text-sm text-white/55 md:text-base">
          {saveState === "saved"
            ? "Share the link — the world is waiting."
            : saveState === "error"
              ? (saveError ?? "Could not save. Try again.")
              : "Saving your meme…"}
        </p>
      </motion.div>

      {/* ── Save status pill ───────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <SaveStatusPill state={saveState} onRetry={handleSave} />
      </AnimatePresence>

      {/* ── Preview ────────────────────────────────────────────────────────── */}
      {dataUrl ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl mx-auto"
        >
          {/* Ambient glow */}
          <div
            className="absolute -inset-6 pointer-events-none rounded-[32px] opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse, #C8F135 0%, transparent 70%)",
            }}
          />
          <img
            src={dataUrl}
            alt="Your meme"
            className="relative w-full rounded-[28px] border border-[rgba(255,255,255,0.08)] shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
          />
        </motion.div>
      ) : (
        <div className="flex aspect-[4/3] w-full max-w-3xl items-center justify-center rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
          <p className="text-sm text-white/30">No preview available</p>
        </div>
      )}

      {/* ── Share URL box ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {shareUrl && saveState === "saved" && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl mx-auto"
          >
            <ShareUrlBox url={shareUrl} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reactions bar ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {saveState === "saved" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="w-full max-w-3xl mx-auto px-0"
          >
            <ReactionBar
              reactions={reactions}
              onReact={(emoji: ReactionEmoji) => react(emoji)}
              isLoading={reactionsLoading}
              lastLocalReaction={lastLocalReaction}
              totalReactions={totalReactions}
              remoteReaction={remoteReaction}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Action buttons ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3"
      >
        <Button size="lg" onClick={handleDownload} disabled={!dataUrl}>
          ↓ Download PNG
        </Button>
        <Button size="lg" variant="secondary" onClick={() => setStep("edit")}>
          ← Back to editor
        </Button>
        <Button size="lg" variant="ghost" onClick={reset}>
          ↺ Start over
        </Button>
      </motion.div>

      {/* ── Social share row ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {shareUrl && saveState === "saved" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs text-white/20">Share on</span>
            <SocialLink
              href={`https://twitter.com/intent/tweet?text=lol&url=${encodeURIComponent(shareUrl)}`}
              label="X / Twitter"
            >
              <XIcon />
            </SocialLink>
            <SocialLink
              href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=Check+this+out`}
              label="Reddit"
            >
              <RedditIcon />
            </SocialLink>
            <SocialLink
              href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
              label="WhatsApp"
            >
              <WhatsAppIcon />
            </SocialLink>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Save status pill ─────────────────────────────────────────────────────────
function SaveStatusPill({
  state,
  onRetry,
}: {
  state: SaveState;
  onRetry: () => void;
}) {
  if (state === "idle") return null;

  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, scale: 0.9, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
        state === "saving" &&
          "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-white/55",
        state === "saved" &&
          "border-[rgba(200,241,53,0.2)] bg-[rgba(200,241,53,0.08)] text-[#C8F135]",
        state === "error" && "border-red-500/30 bg-red-500/10 text-red-300",
      )}
    >
      {state === "saving" && (
        <>
          <div className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          Saving to cloud…
        </>
      )}
      {state === "saved" && (
        <>
          <span>✓</span>
          Saved — link is live
        </>
      )}
      {state === "error" && (
        <>
          <span>✕</span>
          <span>Save failed</span>
          <button
            onClick={onRetry}
            className="ml-1 underline text-red-300 hover:text-red-200 transition-colors"
          >
            Retry
          </button>
        </>
      )}
    </motion.div>
  );
}

// ─── Share URL box ────────────────────────────────────────────────────────────
function ShareUrlBox({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-2.5 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
      <div className="flex-1 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
        <p className="truncate font-mono text-xs text-white/45">{url}</p>
      </div>
      <CopyLinkButton url={url} />
    </div>
  );
}

// ─── Social icons ─────────────────────────────────────────────────────────────
function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-white/40 transition-all hover:border-[rgba(255,255,255,0.16)] hover:text-white"
    >
      {children}
    </motion.a>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 300 300" fill="currentColor">
      <path d="M178.57 127.15L290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
