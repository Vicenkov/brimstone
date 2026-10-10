import { createId } from "@/lib/utils/id";

export type AppLanguage = "en" | "vi";
export type AppTheme = "light" | "dark";
export type AppFontSize = "small" | "medium" | "large";
export type AppFontFamily = "system" | "mono";
export type LoadingGlowPreset = "rainbow" | "amber" | "purple" | "blue";
export type ActivityType = "created" | "renamed" | "deleted" | "message";

export type ActivityEntry = {
  id: string;
  type: ActivityType;
  detail: string;
  createdAt: number;
};

export type AppSettings = {
  language: AppLanguage;
  theme: AppTheme;
  fontSize: AppFontSize;
  fontFamily: AppFontFamily;
  loadingGlow: LoadingGlowPreset;
  activities: ActivityEntry[];
};

const STORAGE_KEY = "chatbot.settings.v1";
const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  theme: "light",
  fontSize: "medium",
  fontFamily: "system",
  loadingGlow: "rainbow",
  activities: [],
};
const listeners = new Set<() => void>();
let cache: AppSettings | null = null;

type StoredAppSettings = Omit<
  Partial<AppSettings>,
  "fontFamily"
> &
  Pick<AppSettings, "language" | "theme" | "fontSize" | "activities"> & {
    fontFamily?: AppFontFamily | "inter" | "serif";
  };

function isAppSettings(value: unknown): value is StoredAppSettings {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    (item.language === "en" || item.language === "vi") &&
    (item.theme === "light" || item.theme === "dark") &&
    (item.fontSize === "small" || item.fontSize === "medium" || item.fontSize === "large") &&
    (item.fontFamily === undefined ||
      item.fontFamily === "system" ||
      item.fontFamily === "mono" ||
      item.fontFamily === "inter" ||
      item.fontFamily === "serif") &&
    (item.loadingGlow === undefined ||
      item.loadingGlow === "rainbow" ||
      item.loadingGlow === "amber" ||
      item.loadingGlow === "purple" ||
      item.loadingGlow === "blue") &&
    Array.isArray(item.activities)
  );
}

function readSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (!isAppSettings(parsed)) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      language: parsed.language,
      theme: parsed.theme,
      fontSize: parsed.fontSize,
      fontFamily:
        parsed.fontFamily === "system"
          ? "system"
          : parsed.fontFamily === undefined
            ? DEFAULT_SETTINGS.fontFamily
            : "mono",
      loadingGlow: parsed.loadingGlow ?? DEFAULT_SETTINGS.loadingGlow,
      activities: parsed.activities,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function applySettings(settings: AppSettings) {
  document.documentElement.classList.toggle("dark", settings.theme === "dark");
  document.documentElement.dataset.fontSize = settings.fontSize;
  document.documentElement.dataset.fontFamily = settings.fontFamily;
  document.documentElement.dataset.loadingGlow = settings.loadingGlow;
  document.documentElement.lang = settings.language;
}

function commit(next: AppSettings) {
  cache = next;
  applySettings(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Settings remain available for the current session when storage is blocked.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeSettings(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = readSettings();
    applySettings(cache);
    listener();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getSettingsSnapshot(): AppSettings {
  cache ??= readSettings();
  return cache;
}

export function getSettingsServerSnapshot(): AppSettings {
  return DEFAULT_SETTINGS;
}

export function updateSettings(patch: Partial<Omit<AppSettings, "activities">>) {
  commit({ ...getSettingsSnapshot(), ...patch });
}

export function addActivity(type: ActivityType, detail: string) {
  const current = getSettingsSnapshot();
  const activities = [
    { id: createId(), type, detail, createdAt: Date.now() },
    ...current.activities,
  ].slice(0, 30);
  commit({ ...current, activities });
}

export function clearActivityLog() {
  commit({ ...getSettingsSnapshot(), activities: [] });
}

export function deleteActivityEntries(ids: string[]) {
  if (ids.length === 0) return;
  const selectedIds = new Set(ids);
  const current = getSettingsSnapshot();
  commit({
    ...current,
    activities: current.activities.filter((entry) => !selectedIds.has(entry.id)),
  });
}

export function applyStoredSettings() {
  applySettings(getSettingsSnapshot());
}
