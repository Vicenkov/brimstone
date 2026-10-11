"use client";

import { memo, useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, Pencil } from "lucide-react";
import { AssistantAvatar } from "@/components/chat/AssistantAvatar";
import { MarkdownContent } from "@/components/chat/MarkdownContent";
import { GlassButton } from "@/components/ui/GlassButton";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils/cn";
import type { Message } from "@/types/chat";

type MessageBubbleProps = {
  message: Message;
  isStreaming?: boolean;
  canEdit?: boolean;
  onEdit?: (messageId: string, content: string) => void;
};

function MessageBubbleBase({
  message,
  isStreaming = false,
  canEdit = false,
  onEdit,
}: MessageBubbleProps) {
  const { copied, copy } = useCopyToClipboard();
  const isUser = message.role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const startEditing = () => {
    setDraft(message.content);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(message.content);
    setIsEditing(false);
  };

  const saveEdit = () => {
    if (!draft.trim() || !onEdit) return;
    onEdit(message.id, draft);
    setIsEditing(false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      aria-label={isUser ? "You" : "Assistant"}
      className={cn("group flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && <AssistantAvatar />}

      <div className={cn("min-w-0", isUser ? "max-w-[85%]" : "flex-1")}>
        {isUser ? (
          isEditing ? (
            <textarea
              aria-label="Edit message"
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") cancelEditing();
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                  saveEdit();
                }
              }}
              rows={Math.max(2, Math.min(8, message.content.split("\n").length))}
              className="w-full min-w-0 resize-y rounded-[22px] rounded-br-lg border border-white/20 bg-accent px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-accent-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          ) : (
            <div className="rounded-[22px] rounded-br-lg bg-accent px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-accent-fg">
              {message.content}
            </div>
          )
        ) : (
          <MarkdownContent content={message.content} isStreaming={isStreaming} />
        )}

        {!isStreaming && message.content && (
          <div className={cn("mt-1 flex", isUser && "justify-end")}>
            {isEditing ? (
              <>
                <GlassButton
                  variant="ghost"
                  onClick={cancelEditing}
                  className="h-8 rounded-[10px] px-3"
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  variant="accent"
                  onClick={saveEdit}
                  disabled={!draft.trim()}
                  className="ml-1 h-8 rounded-[10px] px-3"
                >
                  Save
                </GlassButton>
              </>
            ) : (
              <>
                <GlassButton
                  variant="ghost"
                  aria-label={copied ? "Message copied" : "Copy message"}
                  onClick={() => void copy(message.content)}
                  className="reveal-on-hover h-8 w-8 rounded-[10px] px-0"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </GlassButton>
                {isUser && (
                  <GlassButton
                    variant="ghost"
                    aria-label="Edit message"
                    title={canEdit ? "Edit message" : "Wait for the response to finish"}
                    disabled={!canEdit}
                    onClick={startEditing}
                    className="reveal-on-hover h-8 w-8 rounded-[10px] px-0"
                  >
                    <Pencil size={15} />
                  </GlassButton>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}

// memo: khi AI đang trả lời, chỉ tin nhắn cuối render lại, các tin cũ thì không.
export const MessageBubble = memo(MessageBubbleBase);