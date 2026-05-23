"use client";
/**
 * MemeViewClient — public meme view page
 * Shows the meme image, reactions, copy-link, and download.
 */
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { SavedMeme } from "@/types";
import type { ReactionEmoji } from "@/types";
import { ReactionBar } from "@/components/reactions/ReactionBar";
import { CopyLinkButton } from "@/components/share/CopyLinkButton";
import { useRealtimeReactions } from "@/hooks/useRealtimeReactions";

interface Props {
  meme: SavedMeme;
}

export function MemeViewClient({ meme }: Props) {
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/m/${meme.id}`;
  const [remoteReaction, setRemoteReaction] = useState<string | null>(null);

  const handleRemoteReaction = useCallback((emoji: string) => {
    setRemoteReaction(emoji);
    setTimeout(() => setRemoteReaction(null), 500);
  }, []);

  const { reactions, loading, react, lastLocalReaction, totalReactions } =
    useRealtimeReactions({
      memeId: meme.id,
      onRemoteReaction: handleRemoteReaction,
    });

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(meme.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `magicmeme-${meme.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(meme.image_url, "_blank");
    }
  }, [meme.image_url, meme.id]);

  const caption = meme.top_text || meme.main_caption || meme.bottom_text || "";

  return (
    <div className="min-h-dvh bg-[#111] text-white flex flex-col">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-[#1E1E1E] px-4 py-3 flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="w-2 h-2 rounded-full bg-[#C8F135] animate-pulse" />
          <span className="font-bold text-white">MagicMeme</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-white/50 hover:text-[#C8F135] transition-colors font-medium"
        >
          Make your own →
        </Link>
      </nav>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          {/* Caption above image */}
          {caption && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/50 text-sm text-center max-w-xs"
            >
              {caption}
            </motion.p>
          )}

          {/* ── Meme Image ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
          >
            {/* Ambient glow */}
            <div
              className="absolute -inset-6 rounded-3xl pointer-events-none opacity-25 blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, #C8F135 0%, transparent 70%)",
              }}
            />

            <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl bg-[#1A1A1A]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={meme.image_url}
                alt={caption || "MagicMeme"}
                className="w-full block"
                loading="eager"
              />
            </div>
          </motion.div>

          {/* ── Reaction Bar ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="w-full bg-[#151515] rounded-2xl border border-[#222] p-4"
          >
            <ReactionBar
              reactions={reactions}
              isLoading={loading}
              onReact={(emoji: ReactionEmoji) => react(emoji)}
              lastLocalReaction={lastLocalReaction}
              totalReactions={totalReactions}
              remoteReaction={remoteReaction}
            />
          </motion.div>

          {/* ── Action Buttons ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            className="flex flex-wrap gap-3 justify-center w-full"
          >
            {/* Copy link */}
            <CopyLinkButton url={shareUrl} />

            {/* Download */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#444] text-white/70 hover:text-white text-sm font-semibold transition-all"
            >
              <DownloadIcon />
              Download PNG
            </motion.button>

            {/* Make your own */}
            <Link href="/">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C8F135] text-black text-sm font-bold transition-all hover:bg-[#d4f54d] shadow-lg shadow-[#C8F135]/20 cursor-pointer"
              >
                ✨ Make your own
              </motion.span>
            </Link>
          </motion.div>

          {/* ── Share buttons ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex items-center gap-3"
          >
            <span className="text-white/20 text-xs">Share on</span>
            <SocialButton
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption || "lol")}&url=${encodeURIComponent(shareUrl)}`}
              label="X / Twitter"
            >
              <XIcon />
            </SocialButton>
            <SocialButton
              href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(caption || "Found this meme")}`}
              label="Reddit"
            >
              <RedditIcon />
            </SocialButton>
            <SocialButton
              href={`https://wa.me/?text=${encodeURIComponent(`${caption} ${shareUrl}`)}`}
              label="WhatsApp"
            >
              <WhatsAppIcon />
            </SocialButton>
          </motion.div>

          {/* ── Metadata footer ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-center"
          >
            <p className="text-white/15 text-xs">
              Made with{" "}
              <Link href="/" className="hover:text-white/40 transition-colors">
                MagicMeme
              </Link>{" "}
              ·{" "}
              {new Date(meme.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// ─── Social button ────────────────────────────────────────────────────────────
function SocialButton({
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
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.93 }}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#444] text-white/40 hover:text-white transition-all"
    >
      {children}
    </motion.a>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
