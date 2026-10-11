import type { ChatMessage } from "@/lib/ai/types";

export const LIMITS = {
  maxMessages: 50,
  maxMessageChars: 8_000,
  maxSelectedContextChars: 16_000,
  maxTotalChars: 32_000,
} as const;

type ValidationResult =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; message: string };

function fail(message: string): ValidationResult {
  return { ok: false, message };
}

export function validateChatRequest(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null || !("messages" in body)) {
    return fail("Request must include a messages array.");
  }

  const raw = (body as { messages: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return fail("Request must include at least one message.");
  }
  if (raw.length > LIMITS.maxMessages) {
    return fail("This conversation is too long. Please start a new chat.");
  }

  const messages: ChatMessage[] = [];
  let totalChars = 0;

  for (const item of raw) {
    if (typeof item !== "object" || item === null) {
      return fail("Each message must be an object.");
    }
    const { role, content, selectedContext } = item as Record<string, unknown>;

    // Client chỉ được gửi user/assistant. Vai "system" luôn do server đặt.
    if (role !== "user" && role !== "assistant") {
      return fail("Each message needs a role of user or assistant.");
    }
    if (typeof content !== "string" || content.trim() === "") {
      return fail("Messages cannot be empty.");
    }
    if (content.length > LIMITS.maxMessageChars) {
      return fail("A message is too long. Please shorten it.");
    }

    if (
      selectedContext !== undefined &&
      (role !== "user" ||
        typeof selectedContext !== "string" ||
        !selectedContext.trim() ||
        selectedContext.length > LIMITS.maxSelectedContextChars)
    ) {
      return fail("Selected context is invalid or too long.");
    }

    totalChars += content.length + (typeof selectedContext === "string" ? selectedContext.length : 0);
    messages.push({
      role,
      content: typeof selectedContext === "string"
        ? `Ngữ cảnh được chọn:\n${selectedContext}\n\nCâu hỏi:\n${content}`
        : content,
    });
  }

  if (totalChars > LIMITS.maxTotalChars) {
    return fail("This conversation is too long. Please start a new chat.");
  }
  if (messages[messages.length - 1].role !== "user") {
    return fail("The last message must come from the user.");
  }

  return { ok: true, messages };
}