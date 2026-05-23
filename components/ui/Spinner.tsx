"use client";
import { motion } from "framer-motion";

export function Spinner({
  size = "md",
  label,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizeConfig = {
    sm: { wrapper: "w-6 h-6", dot: "w-1.5 h-1.5" },
    md: { wrapper: "w-10 h-10", dot: "w-2 h-2" },
    lg: { wrapper: "w-14 h-14", dot: "w-2.5 h-2.5" },
  }[size];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Premium rotating spinner */}
      <div className={`${sizeConfig.wrapper} relative`}>
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid transparent",
            borderTopColor: "var(--lime)",
            borderRightColor: "rgba(200,241,53,0.3)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner rotating ring (opposite direction) */}
        <motion.div
          className="absolute inset-0.5 rounded-full"
          style={{
            border: "1px solid transparent",
            borderTopColor: "rgba(200,241,53,0.5)",
          }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Center dot pulse */}
        <motion.div
          className={`${sizeConfig.dot} rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
          style={{ background: "var(--lime)" }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Label with fade animation */}
      {label && (
        <motion.p
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
