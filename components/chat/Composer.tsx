"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  ArrowUp,
  ListPlus,
  Mic,
  Plus,
  X,
  Square,
} from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { cn } from "@/lib/utils/cn";
import type { ChatStatus } from "@/types/chat";
import { useAppSettings } from "@/hooks/useAppSettings";

export type ComposerHandle = {
  focus: () => void;
  setValue: (value: string) => void;
};

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  status: ChatStatus;
  disabled?: boolean;
  selectedContext?: string | null;
  onRemoveSelectedContext?: () => void;
};

export const Composer = forwardRef<ComposerHandle, ComposerProps>(
  function Composer(
    {
      value,
      onChange,
      onSubmit,
      onStop,
      status,
      disabled = false,
      selectedContext = null,
      onRemoveSelectedContext,
    },
    ref,
  ) {
    const { settings } = useAppSettings();
    const isVietnamese = settings.language === "vi";
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isBusy = status !== "idle";
    const canSend = value.trim().length > 0 && !isBusy && !disabled;

    useImperativeHandle(
      ref,
      () => ({
        focus() {
          textareaRef.current?.focus();
        },

        setValue(nextValue: string) {
          onChange(nextValue);

          requestAnimationFrame(() => {
            textareaRef.current?.focus();
          });
        },
      }),
      [onChange],
    );

    const resizeTextarea = () => {
      const textarea = textareaRef.current;

      if (!textarea) return;

      textarea.style.height = "auto";

      const nextHeight = Math.min(textarea.scrollHeight, 180);

      textarea.style.height = `${nextHeight}px`;

      textarea.style.overflowY =
        textarea.scrollHeight > 180 ? "auto" : "hidden";
    };

    useEffect(() => {
      resizeTextarea();
    }, [value]);

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
      if (event.key !== "Enter") return;

      // Shift + Enter = xuống dòng
      if (event.shiftKey) {
        return;
      }

      // Không gửi khi đang dùng IME
      if (event.nativeEvent.isComposing) {
        return;
      }

      event.preventDefault();

      if (canSend) {
        onSubmit();
      }
    };

    const handleChange = (
      event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      onChange(event.target.value);
    };

    return (
      <div
        className={cn(
          "composer-textarea relative w-full rounded-2xl p-3",
          isBusy && "is-generating",
        )}
      >
        {selectedContext && (
          <div className="mb-2 flex min-w-0 items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-3 py-2 text-sm text-fg">
            <ListPlus size={16} className="shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <div className="truncate" title={selectedContext}>
                {selectedContext.replace(/\s+/g, " ").trim()}
              </div>
            </div>
            <button
              type="button"
              aria-label={isVietnamese ? "Xóa ngữ cảnh đã chọn" : "Remove selected context"}
              title={isVietnamese ? "Xóa ngữ cảnh" : "Remove context"}
              onClick={onRemoveSelectedContext}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-accent/15 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X size={15} />
            </button>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onInput={resizeTextarea}
          disabled={disabled}
          rows={1}
          placeholder={isVietnamese ? "Hỏi bất cứ điều gì..." : "Ask anything..."}
          aria-label={isVietnamese ? "Tin nhắn" : "Message"}
          className={cn(
            "block w-full resize-none bg-transparent",
            "min-h-10 px-3 py-2",
            "text-[length:var(--chat-font-size)] leading-6",
            "outline-none",
            "placeholder:text-fg-muted",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />

        <div className="flex items-center justify-between gap-2 px-1 pb-1">
          <div className="flex items-center gap-1">
            <GlassButton
              type="button"
              variant="ghost"
              aria-label={isVietnamese ? "Thêm tệp đính kèm" : "Add attachment"}
              disabled={isBusy}
              className="composer-action h-9 w-9 rounded-full px-0"
              onClick={() => {
                // File attachment sẽ được nối ở phase sau.
              }}
            >
              <Plus size={18} />
            </GlassButton>

            <GlassButton
              type="button"
              variant="ghost"
              aria-label={isVietnamese ? "Nhập bằng giọng nói" : "Voice input"}
              disabled={isBusy}
              className="composer-action h-9 w-9 rounded-full px-0"
              onClick={() => {
                // Voice input sẽ được nối ở phase sau.
              }}
            >
              <Mic size={18} />
            </GlassButton>
          </div>

          {isBusy ? (
            <GlassButton
              type="button"
              variant="ghost"
              aria-label={isVietnamese ? "Dừng tạo câu trả lời" : "Stop response"}
              onClick={onStop}
              className="composer-action h-9 w-9 rounded-full px-0"
            >
              <Square size={15} fill="currentColor" />
            </GlassButton>
          ) : (
            <GlassButton
              type="button"
              variant="accent"
              aria-label={isVietnamese ? "Gửi tin nhắn" : "Send message"}
              disabled={!canSend}
              onClick={onSubmit}
              className="h-9 w-9 rounded-full px-0"
            >
              <ArrowUp size={18} />
            </GlassButton>
          )}
        </div>
      </div>
    );
  },
);