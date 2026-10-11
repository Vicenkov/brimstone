"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type AIOrbProps = {
  size: "sm" | "md" | "lg";
  state: "idle" | "thinking" | "streaming";
  animated?: boolean;
};

const ORB_SIZES = {
  sm: 28,
  md: 36,
  lg: 56,
} as const;

const ORBIT_PARTICLES = [
  { size: 2, duration: 8.5, delay: -1.2, inset: 2 },
  { size: 3, duration: 11, delay: -4.3, inset: -2 },
  { size: 2, duration: 9.5, delay: -6.1, inset: 1 },
  { size: 2, duration: 12.5, delay: -8.2, inset: -3 },
] as const;

export function AIOrb({ size, state, animated = true }: AIOrbProps) {
  const reducedMotion = useReducedMotion();
  const isMotionEnabled = animated && !reducedMotion;
  const gradientId = `ai-orb-${useId().replace(/:/g, "")}`;
  const previousState = useRef(state);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (previousState.current === "streaming" && state === "idle" && isMotionEnabled) {
      setShowFlash(true);
      const timeout = window.setTimeout(() => setShowFlash(false), 420);
      previousState.current = state;
      return () => window.clearTimeout(timeout);
    }

    previousState.current = state;
  }, [isMotionEnabled, state]);

  const breathDuration =
    state === "streaming" ? 1.6 : state === "thinking" ? 2.2 : 3.5;

  return (
    <motion.span
      initial={isMotionEnabled ? { opacity: 0, scale: 0.6, filter: "blur(3px)" } : false}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={`ai-orb ai-orb--${size} ai-orb--${state}${isMotionEnabled ? " ai-orb--animated" : ""}`}
      style={{ width: ORB_SIZES[size], height: ORB_SIZES[size] }}
      aria-hidden="true"
    >
      {isMotionEnabled && (
        <motion.span
          className="ai-orb__glow"
          animate={{
            opacity: state === "idle" ? [0.62, 1, 0.7] : [0.8, 1, 0.84],
            scale: state === "streaming" ? [1, 1.08, 1] : [1, 1.04, 1],
          }}
          transition={{
            duration: breathDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {state === "thinking" && isMotionEnabled && (
        <motion.span
          className="ai-orb__state-ring"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      )}

      {state === "streaming" && isMotionEnabled && (
        <>
          <motion.span
            className="ai-orb__wave"
            animate={{ opacity: [0.48, 0], scale: [1, 1.62] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="ai-orb__wave ai-orb__wave--delayed"
            animate={{ opacity: [0.4, 0], scale: [1, 1.62] }}
            transition={{ duration: 1.2, delay: 0.6, repeat: Infinity, ease: "easeOut" }}
          />
        </>
      )}

      <motion.span
        className="ai-orb__glass"
        animate={isMotionEnabled
          ? { scale: [1, state === "streaming" ? 1.04 : 1.025, 1] }
          : { scale: 1 }}
        transition={isMotionEnabled
          ? { duration: breathDuration, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.2 }}
      >
        <span className="ai-orb__reflection" />
        <span className="ai-orb__shimmer" />
        <svg
          className="ai-orb__symbol"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`${gradientId}-main`} x1="7" y1="5" x2="27" y2="28" gradientUnits="userSpaceOnUse">
              <stop className="ai-orb__star-stop--one" offset="0" />
              <stop className="ai-orb__star-stop--two" offset=".52" />
              <stop className="ai-orb__star-stop--three" offset="1" />
            </linearGradient>
            <linearGradient id={`${gradientId}-small`} x1="5" y1="6" x2="15" y2="17" gradientUnits="userSpaceOnUse">
              <stop className="ai-orb__star-stop--one" offset="0" />
              <stop className="ai-orb__star-stop--two" offset=".52" />
              <stop className="ai-orb__star-stop--three" offset="1" />
            </linearGradient>
          </defs>
          <motion.g
            className="ai-orb__star ai-orb__star--main"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={isMotionEnabled
              ? state === "idle"
                ? { opacity: [0.82, 1, 0.9], scale: [0.9, 1.08, 0.96], rotate: [-8, 8, -5] }
                : { opacity: [0.82, 1, 0.82], scale: [0.92, 1.08, 0.92], rotate: state === "streaming" ? [0, 360] : [0, 360] }
              : { opacity: 1, scale: 1, rotate: 0 }}
            transition={isMotionEnabled
              ? {
                  duration: state === "streaming" ? 2.5 : state === "thinking" ? 7 : 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.2 }}
          >
            <path
              d="M16 2.5 19.4 12.6 29.5 16 19.4 19.4 16 29.5 12.6 19.4 2.5 16 12.6 12.6 16 2.5Z"
              fill={`url(#${gradientId}-main)`}
            />
          </motion.g>
          <motion.g
            className="ai-orb__star ai-orb__star--small-one"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={isMotionEnabled
              ? { opacity: [0.72, 1, 0.78], scale: [0.85, 1.1, 0.9], rotate: [0, 12, -4] }
              : { opacity: 0.9, scale: 1, rotate: 0 }}
            transition={isMotionEnabled
              ? { duration: state === "thinking" ? 1.3 : 2.4, delay: 0.18, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }}
          >
            <path
              d="M25 3.5 26.1 7 29.5 8.2 26.1 9.4 25 13 23.8 9.4 20.5 8.2 23.8 7 25 3.5Z"
              fill={`url(#${gradientId}-small)`}
            />
          </motion.g>
          <motion.g
            className="ai-orb__star ai-orb__star--small-two"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={isMotionEnabled
              ? { opacity: [0.68, 0.96, 0.72], scale: [0.88, 1.08, 0.9], rotate: [0, -12, 5] }
              : { opacity: 0.82, scale: 1, rotate: 0 }}
            transition={isMotionEnabled
              ? { duration: state === "thinking" ? 1.55 : 3.1, delay: 0.62, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }}
          >
            <path
              d="M7 21 8.2 24.5 11.5 25.7 8.2 26.9 7 30.5 5.8 26.9 2.5 25.7 5.8 24.5 7 21Z"
              fill={`url(#${gradientId}-small)`}
            />
          </motion.g>
        </svg>
        {(size === "md" || size === "lg") && isMotionEnabled && (
          <span className="ai-orb__particles">
            {ORBIT_PARTICLES.map((particle, index) => (
              <motion.span
                key={index}
                className="ai-orb__orbit"
                animate={{ rotate: 360 }}
                transition={{
                  duration: state === "streaming" ? particle.duration * 0.55 : particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <span
                  className="ai-orb__particle"
                  style={{
                    width: particle.size,
                    height: particle.size,
                    top: particle.inset,
                  }}
                />
              </motion.span>
            ))}
          </span>
        )}
      </motion.span>

      <motion.span
        className="ai-orb__flash"
        animate={showFlash ? { opacity: [0, 0.9, 0], scale: [0.75, 1.35, 1.7] } : { opacity: 0, scale: 0.75 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      />
    </motion.span>
  );
}
