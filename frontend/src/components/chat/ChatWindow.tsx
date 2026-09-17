import { useEffect, useRef } from "react";

import { Spinner } from "@/components/ui/Spinner";
import type { Message } from "@/types";

import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  messages: Message[];
  streamingContent: string;
  isAssistantTyping: boolean;
}

export function ChatWindow({ messages, streamingContent, isAssistantTyping }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-1 py-4">
      {messages.length === 0 && !isAssistantTyping && (
        <p className="mt-8 text-center text-sm text-slate-400 dark:text-slate-300">
          Ask about careers, universities, or programs to get started.
        </p>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} role={message.role} content={message.content} />
      ))}

      {isAssistantTyping && (
        <div className="flex items-center gap-2">
          <MessageBubble role="assistant" content={streamingContent} />
          {!streamingContent && <Spinner size={16} />}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
