"use client";

import { motion } from "motion/react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAppSettings } from "@/hooks/useAppSettings";

type ErrorNoticeProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  const { settings } = useAppSettings();
  const isVietnamese = settings.language === "vi";
  const displayMessage = isVietnamese ? getVietnameseError(message) : message;

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="glass flex items-center gap-3 rounded-[20px] p-3 pl-4 text-sm"
    >
      <AlertCircle size={18} className="shrink-0 text-red-500" />
      <p className="min-w-0 flex-1">{displayMessage}</p>
      <GlassButton
        aria-label={isVietnamese ? "Thử lại" : "Retry"}
        onClick={onRetry}
        className="h-9 shrink-0 rounded-[12px] px-3 text-xs"
      >
        <RotateCcw size={14} />
        {isVietnamese ? "Thử lại" : "Retry"}
      </GlassButton>
    </motion.div>
  );
}

function getVietnameseError(message: string): string {
  if (/message is too long/i.test(message)) {
    const maxLength = message.match(/max ([\d,]+)/i)?.[1];
    return maxLength
      ? `Tin nhắn quá dài (tối đa ${maxLength} ký tự).`
      : "Tin nhắn quá dài. Vui lòng rút ngắn nội dung.";
  }

  const translations: Record<string, string> = {
    "Something went wrong. Please try again.": "Đã xảy ra lỗi. Vui lòng thử lại.",
    "Could not reach the server. Check your connection and try again.":
      "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.",
    "The AI service is not configured yet.": "Dịch vụ AI chưa được cấu hình.",
    "The AI service is unavailable. Please try again later.":
      "Dịch vụ AI hiện không khả dụng. Vui lòng thử lại sau.",
    "Too many requests. Please wait a moment and try again.":
      "Bạn gửi quá nhiều yêu cầu. Vui lòng đợi một lát rồi thử lại.",
    "The AI service is temporarily unavailable. Please try again shortly.":
      "Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.",
    "The AI took too long to respond. Please try again.":
      "AI phản hồi quá lâu. Vui lòng thử lại.",
    "Could not reach the AI service. Please try again.":
      "Không thể kết nối đến dịch vụ AI. Vui lòng thử lại.",
    "The AI service returned an error. Please try again.":
      "Dịch vụ AI đã xảy ra lỗi. Vui lòng thử lại.",
    "This conversation is too long. Please start a new chat.":
      "Cuộc trò chuyện quá dài. Vui lòng bắt đầu cuộc trò chuyện mới.",
    "A message is too long. Please shorten it.":
      "Tin nhắn quá dài. Vui lòng rút ngắn nội dung.",
  };

  return translations[message] ?? "Đã xảy ra lỗi. Vui lòng thử lại.";
}