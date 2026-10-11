"use client";

import { motion } from "motion/react";
import {
  FileSearch,
  Lightbulb,
  PenLine,
  Puzzle,
  type LucideIcon,
} from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";

type Suggestion = {
  title: string;
  hint: string;
  prompt: string;
  icon: LucideIcon;
};

const SUGGESTIONS: Suggestion[] = [
  {
    title: "Giải thích khái niệm",
    hint: "Phân tích chủ đề một cách đơn giản",
    prompt: "Giải thích cách Internet hoạt động bằng ngôn ngữ đơn giản.",
    icon: Lightbulb,
  },
  {
    title: "Soạn thảo văn bản",
    hint: "Email, bài luận, phụ đề",
    prompt: "Viết email lịch sự xin giáo viên gia hạn thời hạn nộp bài.",
    icon: PenLine,
  },
  {
    title: "Giải quyết vấn đề",
    hint: "Xử lý từng bước một",
    prompt: "Giúp tôi giải quyết vấn đề này từng bước: ",
    icon: Puzzle,
  },
  {
    title: "Phân tích tệp tin",
    hint: "Tóm tắt hoặc kiểm tra văn bản",
    prompt: "Tóm tắt các ý chính của văn bản sau: ",
    icon: FileSearch,
  },
];

const ENGLISH_SUGGESTIONS: Suggestion[] = [
  {
    title: "Explain something",
    hint: "Break down a topic simply",
    prompt: "Explain how the internet works in simple terms.",
    icon: Lightbulb,
  },
  {
    title: "Write something",
    hint: "Emails, essays, captions",
    prompt: "Write a short, polite email asking my teacher for a deadline extension.",
    icon: PenLine,
  },
  {
    title: "Solve a problem",
    hint: "Work through it step by step",
    prompt: "Help me solve a problem step by step. Here it is: ",
    icon: Puzzle,
  },
  {
    title: "Analyze a file",
    hint: "Summarize or review text",
    prompt: "Summarize the key points of this text: ",
    icon: FileSearch,
  },
];

type EmptyStateProps = {
  onSelectPrompt: (prompt: string) => void;
};

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const { settings } = useAppSettings();
  const isVietnamese = settings.language === "vi";
  const suggestions = isVietnamese ? SUGGESTIONS : ENGLISH_SUGGESTIONS;
  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="m-auto w-full max-w-2xl text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {isVietnamese
            ? "Brimstone đây. Hãy nêu mục tiêu, chúng ta sẽ bắt đầu ngay."
            : "Brimstone here. State the objective, and we'll get moving."}
        </h2>
        <p className="mt-2 text-fg-muted">
          {isVietnamese
            ? "Báo cáo tình huống hoặc mục tiêu. Tôi sẽ đưa ra kế hoạch rõ ràng, chính xác."
            : "Report the situation or objective. I'll provide a clear, precise plan."}
        </p>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          {suggestions.map(({ title, hint, prompt, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + index * 0.05, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                className="glass glass-sheen flex w-full flex-col gap-2 rounded-[24px] p-4 text-left transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98]"
              >
                <Icon size={20} className="text-accent" />
                <span className="font-medium">{title}</span>
                <span className="text-sm text-fg-muted">{hint}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}