"use client";

import { motion } from "motion/react";
import { AssistantAvatar } from "@/components/chat/AssistantAvatar";
import { useAppSettings } from "@/hooks/useAppSettings";

export function TypingIndicator() {
  const { settings } = useAppSettings();
  return (
    <motion.div
      role="status"
      aria-label={settings.language === "vi" ? "Trợ lý đang trả lời" : "Assistant is typing"}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-center gap-3"
    >
      <AssistantAvatar />
      <div className="glass flex h-9 items-center gap-1.5 rounded-full px-4">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-fg-muted" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-fg-muted" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-fg-muted" />
      </div>
    </motion.div>
  );
}