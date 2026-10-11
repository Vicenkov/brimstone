"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";

type TextSelectionListenerProps = {
  onSelectText?: (text: string) => void;
};

type Selection = {
  text: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
};

const TOOLBAR_WIDTH = 156;
const TOOLBAR_HEIGHT = 40;
const VIEWPORT_GAP = 8;

export function TextSelectionListener({
  onSelectText,
}: TextSelectionListenerProps) {
  const { settings } = useAppSettings();
  const label = settings.language === "vi" ? "Hỏi Brimstone" : "Ask Brimstone";
  const toolbarRef = useRef<HTMLDivElement>(null);
  const lastSelectionRef = useRef("");
  const [selection, setSelection] = useState<Selection | null>(null);

  const captureSelection = useCallback(() => {
    const currentSelection = window.getSelection();
    const text = currentSelection?.toString().trim() ?? "";

    if (!text || !currentSelection || currentSelection.rangeCount === 0) {
      lastSelectionRef.current = "";
      if (!document.activeElement?.closest(".composer-textarea")) {
        setSelection(null);
      }
      return;
    }

    const range = currentSelection.getRangeAt(0);
    const messageContents = document.querySelectorAll("[data-chat-message-content]");
    let isInsideMessage = false;
    for (const element of messageContents) {
      try {
        if (range.intersectsNode(element)) {
          isInsideMessage = true;
          break;
        }
      } catch {
        // Ignore nodes removed while the browser is updating its selection.
      }
    }

    if (!isInsideMessage) {
      lastSelectionRef.current = "";
      setSelection(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) return;

    setSelection({
      text,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    });

    lastSelectionRef.current = text;
  }, []);

  useEffect(() => {
    let selectionTimer: number | undefined;
    let touchTimer: number | undefined;

    const handleSelectionChange = () => {
      if (!window.getSelection()?.toString().trim()) {
        lastSelectionRef.current = "";
        window.clearTimeout(selectionTimer);
        if (!document.activeElement?.closest(".composer-textarea")) {
          setSelection(null);
        }
        return;
      }
      window.clearTimeout(selectionTimer);
      selectionTimer = window.setTimeout(captureSelection, 150);
    };
    const handleMouseUp = () => {
      window.clearTimeout(selectionTimer);
      captureSelection();
    };
    const handleTouchEnd = () => {
      window.clearTimeout(touchTimer);
      touchTimer = window.setTimeout(captureSelection, 100);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!toolbarRef.current?.contains(event.target as Node)) {
        setSelection(null);
      }
    };
    const handleViewportChange = () => {
      if (window.getSelection()?.toString().trim()) captureSelection();
      else if (!document.activeElement?.closest(".composer-textarea")) {
        setSelection(null);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.clearTimeout(selectionTimer);
      window.clearTimeout(touchTimer);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [captureSelection]);

  if (!selection) return null;

  const width = Math.min(TOOLBAR_WIDTH, window.innerWidth - VIEWPORT_GAP * 2);
  const left = Math.min(
    Math.max((selection.left + selection.right) / 2 - width / 2, VIEWPORT_GAP),
    window.innerWidth - width - VIEWPORT_GAP,
  );
  const spaceAbove = selection.top;
  const top =
    spaceAbove >= TOOLBAR_HEIGHT + VIEWPORT_GAP
      ? selection.top - TOOLBAR_HEIGHT - VIEWPORT_GAP
      : Math.min(
          selection.bottom + VIEWPORT_GAP,
          window.innerHeight - TOOLBAR_HEIGHT - VIEWPORT_GAP,
        );

  const attachContext = () => {
    if (typeof onSelectText === "function") onSelectText(selection.text);
    window.getSelection()?.removeAllRanges();
    lastSelectionRef.current = "";
    setSelection(null);
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[100] rounded-full border border-white/15 bg-[var(--glass-bg)] p-1 text-fg shadow-xl backdrop-blur-xl"
      style={{ top: Math.max(VIEWPORT_GAP, top), left, width }}
      onPointerDown={(event) => event.preventDefault()}
    >
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={attachContext}
        className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-full bg-accent px-3 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Sparkles size={14} />
        {label}
      </button>
    </div>
  );
}
