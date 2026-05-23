"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  onCapture: (data: string, mimeType: string) => void;
  onClose: () => void;
}

export function WebcamCapture({ open, onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      stream?.getTracks().forEach((t) => t.stop());
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      .then((s) => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setIsLoading(false);
        }
      })
      .catch((err) => {
        const message =
          err.name === "NotAllowedError"
            ? "Camera permission denied"
            : err.name === "NotFoundError"
              ? "No camera found"
              : "Could not access camera";
        setError(message);
        setIsLoading(false);
        onClose();
      });

    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [open, stream, onClose]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL("image/jpeg", 0.92), "image/jpeg");
    onClose();
  }, [onCapture, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-[#0a0a0a] rounded-2xl overflow-hidden w-full max-w-md md:max-w-lg border border-[#222] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-4 md:px-6 py-3 md:py-4 border-b border-[#1E1E1E] flex items-center justify-between"
              style={{
                background: "rgba(12,12,12,0.8)",
                backdropFilter: "blur(12px)",
              }}
            >
              <h3
                className="text-sm md:text-base font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                📸 Capture photo
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                ✕
              </motion.button>
            </div>

            {/* Video container */}
            <div className="relative w-full aspect-video bg-black overflow-hidden">
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(30,30,30,0.9) 100%)",
                  }}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-[#333] border-t-[#C8F135] animate-spin mb-3" />
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Accessing camera…
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(30,30,30,0.95) 100%)",
                  }}
                >
                  <div className="text-3xl mb-2">⚠️</div>
                  <p
                    className="text-sm text-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {error}
                  </p>
                </motion.div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ opacity: isLoading || error ? 0.3 : 1 }}
              />

              {/* Capture indicator */}
              {!isLoading && !error && (
                <motion.div
                  className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-[11px] font-semibold text-white/60 uppercase tracking-widest">
                    Live
                  </span>
                </motion.div>
              )}
            </div>

            {/* Footer actions */}
            <div
              className="px-4 md:px-6 py-3 md:py-4 flex gap-2 md:gap-3"
              style={{
                background: "rgba(12,12,12,0.6)",
                borderTop: "1px solid #1E1E1E",
              }}
            >
              <Button
                onClick={onClose}
                variant="secondary"
                size="md"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={capture}
                size="md"
                className="flex-1"
                disabled={isLoading || !!error}
              >
                <span className="mr-1.5">📸</span>
                <span className="hidden sm:inline">Capture</span>
                <span className="sm:hidden">Take</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
