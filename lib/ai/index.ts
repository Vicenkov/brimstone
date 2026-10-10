import { OpenAICompatibleProvider } from "@/lib/ai/openai-compatible";
import { AIProviderError, type AIProvider } from "@/lib/ai/types";

const DEFAULT_BASE_URL = "https://api.xkiro.com/v1";

export function getAIProvider(): AIProvider {
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();
  const baseUrl = (process.env.AI_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(
    /\/+$/,
    "",
  );

  if (!apiKey || !model) {
    console.error("[ai] Missing AI_API_KEY or AI_MODEL in .env.local");
    throw new AIProviderError("config", "The AI service is not configured.");
  }

  return new OpenAICompatibleProvider({ apiKey, baseUrl, model });
}