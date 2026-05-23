"use client";
import { motion } from "framer-motion";

const shimmerVariants = {
  initial: { x: "-100%" },
  animate: { x: "100%" },
};

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export function SuggestionSkeleton() {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          variants={cardVariants}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8,
          }}
          className="overflow-hidden rounded-[24px] md:rounded-[28px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 18px 48px rgba(0,0,0,0.38)",
          }}
        >
          {/* Image skeleton with shimmer */}
          <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-r from-[#181818] via-[#242424] to-[#181818]">
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(200,241,53,0.12), transparent)",
              }}
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Content skeleton */}
          <div className="space-y-3 border-t border-[rgba(255,255,255,0.06)] p-4 md:p-5">
            {/* Main text skeleton */}
            <div className="space-y-2">
              <div
                className="h-3.5 rounded-md overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <motion.div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(200,241,53,0.08), transparent)",
                  }}
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.1,
                  }}
                />
              </div>
              <div
                className="h-3 w-4/5 rounded-md overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <motion.div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(200,241,53,0.08), transparent)",
                  }}
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.15,
                  }}
                />
              </div>
            </div>

            {/* Badge skeleton */}
            <div
              className="w-20 h-2.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <motion.div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(200,241,53,0.08), transparent)",
                }}
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
