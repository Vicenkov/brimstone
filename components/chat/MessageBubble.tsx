"use client";

import { memo, useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, ListPlus, Pencil } from "lucide-react";
import { AssistantAvatar } from "@/components/chat/AssistantAvatar";
import { MarkdownContent } from "@/components/chat/MarkdownContent";
import { GlassButton } from "@/components/ui/GlassButton";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useAppSettings } from "@/hooks/useAppSettings";
import { cn } from "@/lib/utils/cn";
import type { Message } from "@/types/chat";

type MessageBubbleProps = {
  message: Message;
  isStreaming?: boolean;
  canEdit?: boolean;
  onEdit?: (messageId: string, content: string) => void;
};

function formatSelectedContext(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^(?:->|→|[-*•]\s*)$/.test(line))
    .map((line) => line.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, ""));
  return lines.filter((line, index) => line !== lines[index - 1]).join("\n");
}

function MessageBubbleBase({
  message,
  isStreaming = false,
  canEdit = false,
  onEdit,
}: MessageBubbleProps) {
  const { copied, copy } = useCopyToClipboard();
  const { settings } = useAppSettings();
  const isVietnamese = settings.language === "vi";
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
      aria-label={isUser
        ? isVietnamese ? "Bạn" : "You"
        : isVietnamese ? "Trợ lý" : "Assistant"}
      className={cn("group flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && <AssistantAvatar />}

      <div className={cn("min-w-0", isUser ? "max-w-[85%]" : "flex-1")}>
        {isUser ? (
          isEditing ? (
            <textarea
              aria-label={isVietnamese ? "Chỉnh sửa tin nhắn" : "Edit message"}
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
            <div
              data-chat-message-content
              className="max-w-full rounded-[22px] rounded-br-lg bg-accent px-4 py-2.5 text-[15px] leading-relaxed break-words text-accent-fg"
            >
              {message.selectedContext && (
                <div className="mb-2 rounded-xl border border-white/20 bg-black/5 px-3 py-2">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium opacity-75">
                    <ListPlus size={14} />
                    {isVietnamese ? "Ngữ cảnh được chọn:" : "Selected context:"}
                  </div>
                  <p
                    title={message.selectedContext}
                    className="line-clamp-4 whitespace-pre-wrap break-words text-sm"
                  >
                    {formatSelectedContext(message.selectedContext)}
                  </p>
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          )
        ) : (
          <div data-chat-message-content>
            <MarkdownContent content={message.content} isStreaming={isStreaming} />
          </div>
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
                  {isVietnamese ? "Hủy" : "Cancel"}
                </GlassButton>
                <GlassButton
                  variant="accent"
                  onClick={saveEdit}
                  disabled={!draft.trim()}
                  className="ml-1 h-8 rounded-[10px] px-3"
                >
                  {isVietnamese ? "Lưu" : "Save"}
                </GlassButton>
              </>
            ) : (
              <>
                <GlassButton
                  variant="ghost"
                  aria-label={copied
                    ? isVietnamese ? "Đã sao chép tin nhắn" : "Message copied"
                    : isVietnamese ? "Sao chép tin nhắn" : "Copy message"}
                  onClick={() => void copy(message.content)}
                  className="reveal-on-hover h-8 w-8 rounded-[10px] px-0"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </GlassButton>
                {isUser && (
                  <GlassButton
                    variant="ghost"
                    aria-label={isVietnamese ? "Chỉnh sửa tin nhắn" : "Edit message"}
                    title={canEdit
                      ? isVietnamese ? "Chỉnh sửa tin nhắn" : "Edit message"
                      : isVietnamese ? "Vui lòng đợi trợ lý trả lời xong" : "Wait for the response to finish"}
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