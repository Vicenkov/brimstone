"use client";

import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/chat/EmptyState";
import { MessageList } from "@/components/chat/MessageList";
import {
  Composer,
  type ComposerHandle,
} from "@/components/chat/Composer";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";

export default function Home() {
  const {
    conversations,
    activeConversation,
    selectConversation,
    startNewChat,
    renameConversation,
    removeConversation,
  } = useConversations();
  const { messages, status, error, send, editMessage, stop, retry } = useChat(activeConversation?.id ?? null);

  const [draft, setDraft] = useState("");
  const [selectedContext, setSelectedContext] = useState<string | null>(null);

  const composerRef =
    useRef<ComposerHandle>(null);

  const submit = () => {
    const content = draft.trim();

    if (!content || status !== "idle") {
      return;
    }

    const targetConversationId = activeConversation?.id ?? startNewChat().id;
    send(content, targetConversationId, selectedContext ?? undefined);
    setDraft("");
    setSelectedContext(null);

    requestAnimationFrame(() => {
      composerRef.current?.focus();
    });
  };

  const handleSelectPrompt = (prompt: string) => {
    setDraft(prompt);

    requestAnimationFrame(() => {
      composerRef.current?.focus();
    });
  };

  const handleSelectText = useCallback((selectedText: string) => {
    if (status !== "idle" || !selectedText.trim()) return;
    setSelectedContext(selectedText.trim());
    requestAnimationFrame(() => composerRef.current?.focus());
  }, [status]);

  const composer = (
    <Composer
      ref={composerRef}
      value={draft}
      onChange={setDraft}
      onSubmit={submit}
      onStop={stop}
      status={status}
      selectedContext={selectedContext}
      onRemoveSelectedContext={() => setSelectedContext(null)}
    />
  );

  return (
    <AppShell
      composer={composer}
      conversations={conversations}
      activeConversation={activeConversation}
      onSelectConversation={selectConversation}
      onNewChat={startNewChat}
      onRenameConversation={renameConversation}
      onDeleteConversation={removeConversation}
    >
      {messages.length === 0 ? (
        <EmptyState
          onSelectPrompt={handleSelectPrompt}
        />
      ) : (
        <MessageList
          messages={messages}
          status={status}
          error={error} 
          onRetry={retry}
          onEditMessage={editMessage}
          onSelectText={handleSelectText}
        />
      )}
    </AppShell>
  );
}