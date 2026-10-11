"use client";

import { AIOrb } from "@/components/ui/AIOrb";

type AssistantAvatarProps = {
  state?: "idle" | "thinking" | "streaming";
  animated?: boolean;
};

export function AssistantAvatar({
  state = "idle",
  animated = true,
}: AssistantAvatarProps) {
  return (
    <span className="mt-0.5 block h-9 w-9 shrink-0">
      <AIOrb size="md" state={state} animated={animated} />
    </span>
  );
}