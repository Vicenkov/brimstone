import { Menu, PanelLeft, Sparkles } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAppSettings } from "@/hooks/useAppSettings";

type ChatHeaderProps = {
  title: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenDrawer: () => void;
};

export function ChatHeader({
  title,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenDrawer,
}: ChatHeaderProps) {
  const { settings } = useAppSettings();
  const isVietnamese = settings.language === "vi";
  return (
    <header className="border-b border-[var(--glass-border)] pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        {/* Điện thoại và tablet: mở drawer */}
        <GlassButton
          variant="ghost"
          aria-label={isVietnamese ? "Mở danh sách trò chuyện" : "Open sidebar"}
          onClick={onOpenDrawer}
          className="w-11 px-0 lg:hidden"
        >
          <Menu size={20} />
        </GlassButton>

        {/* Màn hình lớn: thu gọn / mở rộng sidebar */}
        <GlassButton
          variant="ghost"
          aria-label={sidebarCollapsed
            ? isVietnamese ? "Hiện thanh bên" : "Show sidebar"
            : isVietnamese ? "Ẩn thanh bên" : "Hide sidebar"}
          aria-expanded={!sidebarCollapsed}
          onClick={onToggleSidebar}
          className="hidden w-11 px-0 lg:inline-flex"
        >
          <PanelLeft size={20} />
        </GlassButton>

        <h1 className="min-w-0 flex-1 truncate text-sm font-medium">
          {title === "New chat" && isVietnamese ? "Cuộc trò chuyện mới" : title}
        </h1>

        {/* Tên model đang để tạm, Phase 7 và 11 sẽ lấy từ cấu hình thật */}
        <div className="inline-flex h-8 items-center gap-1.5 rounded-full border border-purple-300/50 bg-purple-100/80 px-3 text-xs text-purple-700 shadow-[0_0_12px_rgba(147,51,234,0.2)] transition-all duration-300 hover:shadow-[0_0_18px_rgba(147,51,234,0.35)] dark:border-purple-500/30 dark:bg-purple-950/20 dark:text-purple-300 dark:shadow-[0_0_15px_rgba(147,51,234,0.25)] dark:hover:shadow-[0_0_22px_rgba(147,51,234,0.45)]">
          <Sparkles size={14} className="text-purple-700 dark:text-purple-300" />
          {isVietnamese ? "Trợ lý AI" : "AI Assistant"}
        </div>
      </div>
    </header>
  );
}