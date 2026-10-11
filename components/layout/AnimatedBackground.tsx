"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

export function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(-1000);
  const pointerY = useMotionValue(-1000);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 28, mass: 0.8 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 28, mass: 0.8 });
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${smoothX}px ${smoothY}px, var(--spotlight-color), transparent 78%)`;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const finePointer = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    if (!finePointer.matches) return;

    let latestPointerEvent: PointerEvent | null = null;
    let specularFrame = 0;

    // Cập nhật bằng MotionValue để theo chuột mà không render lại React.
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !finePointer.matches) return;
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);

      latestPointerEvent = event;
      if (specularFrame) return;
      specularFrame = requestAnimationFrame(() => {
        specularFrame = 0;
        const currentEvent = latestPointerEvent;
        if (!currentEvent) return;
        const target = currentEvent.target;
        if (!(target instanceof Element)) return;

        const surface = target.closest<HTMLElement>(
          ".glass, .light-new-chat, .light-settings-button, .ai-assistant-pill",
        );
        if (!surface) return;
        const bounds = surface.getBoundingClientRect();
        surface.style.setProperty("--mx", `${currentEvent.clientX - bounds.left}px`);
        surface.style.setProperty("--my", `${currentEvent.clientY - bounds.top}px`);
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(specularFrame);
    };
  }, [pointerX, pointerY, prefersReducedMotion]);

  return (
    <div className="animated-background" aria-hidden="true">
      <span className="aurora-blob aurora-blob--purple" />
      <span className="aurora-blob aurora-blob--blue" />
      <span className="aurora-blob aurora-blob--peach" />
      <span className="aurora-blob aurora-blob--pink" />
      {!prefersReducedMotion && (
        <motion.div className="aurora-spotlight" style={{ background: spotlight }} />
      )}
    </div>
  );
}
