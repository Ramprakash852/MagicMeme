"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AppStep } from "@/store/useMemeStore";

const STEPS: { id: AppStep; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "suggest", label: "Caption" },
  { id: "edit", label: "Edit" },
  { id: "share", label: "Share" },
];

export function StepIndicator({ current }: { current: AppStep }) {
  const idx = STEPS.findIndex((s) => s.id === current);

  return (
    <div
      className="flex items-center gap-0 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(17,17,17,0.72)] px-2 py-1 shadow-[0_16px_40px_rgba(0,0,0,0.38)] backdrop-blur-xl"
      role="list"
      aria-label="Progress"
    >
      {STEPS.map((step, i) => {
        const done = i < idx;
        const active = i === idx;

        return (
          <div key={step.id} className="flex items-center" role="listitem">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                {/* Active ring pulse */}
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: "rgba(200,241,53,0.2)" }}
                    animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeOut",
                    }}
                  />
                )}

                <motion.div
                  animate={{
                    scale: active ? 1 : done ? 0.9 : 0.8,
                    backgroundColor: done
                      ? "#C8F135"
                      : active
                        ? "#C8F135"
                        : "#1f1f1f",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "relative w-[26px] h-[26px] rounded-full flex items-center justify-center",
                    "text-[9px] font-black transition-colors",
                    done || active ? "text-black" : "text-white/20",
                    active &&
                      "ring-2 ring-[#C8F135]/28 ring-offset-1 ring-offset-[#050505]",
                  )}
                  style={{
                    border: done || active ? "none" : "1px solid #2f2f2f",
                  }}
                >
                  {done ? (
                    <motion.svg
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 600,
                        damping: 22,
                      }}
                      width="9"
                      height="9"
                      viewBox="0 0 9 9"
                      fill="none"
                    >
                      <path
                        d="M1.5 4.5L3.5 6.5L7.5 2.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </motion.div>
              </div>

              {/* Label */}
              <motion.span
                animate={{
                  opacity: active ? 1 : done ? 0.45 : 0.2,
                  color: active ? "#C8F135" : "#f5f5f5",
                }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-semibold leading-none whitespace-nowrap tracking-wide hidden sm:block"
              >
                {step.label}
              </motion.span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                className="w-5 sm:w-7 mx-1.5 sm:mx-2 relative"
                style={{ height: "1.5px" }}
              >
                {/* Track */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "#1e1e1e" }}
                />
                {/* Fill */}
                <motion.div
                  className="absolute inset-0 rounded-full origin-left"
                  style={{ background: "#C8F135" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: done ? 1 : 0 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.1,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
