"use client";

import { useEffect, useRef, useState } from "react";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { api, chatSocketUrl } from "@/lib/api";
import type { ChatSession, Message } from "@/types";

const SESSION_KEY_STORAGE = "chat_session_key";

const SUGGESTED_PROMPTS = [
  "What careers fit someone who loves math and problem-solving?",
  "What's the job outlook for careers in healthcare?",
  "Which universities have strong computer science programs?",
  "How do I choose between a college diploma and a university degree?",
];

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export default function ChatPage() {
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [input, setInput] = useState("");
  const [connectionState, setConnectionState] = useState<"connecting" | "open" | "closed">(
    "connecting"
  );

  const wsRef = useRef<WebSocket | null>(null);
  const streamingContentRef = useRef("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      let key = localStorage.getItem(SESSION_KEY_STORAGE);

      if (!key) {
        const { data } = await api.post<ChatSession>("/api/chat/sessions/");
        key = data.session_key;
        localStorage.setItem(SESSION_KEY_STORAGE, key);
      } else {
        try {
          const { data } = await api.get<ChatSession>(`/api/chat/sessions/${key}/`);
          if (!cancelled) setMessages(data.messages ?? []);
        } catch {
          const { data } = await api.post<ChatSession>("/api/chat/sessions/");
          key = data.session_key;
          localStorage.setItem(SESSION_KEY_STORAGE, key);
        }
      }

      if (!cancelled) setSessionKey(key);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionKey) return;

    const socket = new WebSocket(chatSocketUrl(sessionKey));
    wsRef.current = socket;
    setConnectionState("connecting");

    socket.onopen = () => setConnectionState("open");
    socket.onclose = () => setConnectionState("closed");
    socket.onerror = () => setConnectionState("closed");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "delta") {
        streamingContentRef.current += data.content;
        setIsAssistantTyping(true);
        setStreamingContent(streamingContentRef.current);
      } else if (data.type === "done") {
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: streamingContentRef.current,
            created_at: new Date().toISOString(),
          },
        ]);
        streamingContentRef.current = "";
        setStreamingContent("");
        setIsAssistantTyping(false);
      }
    };

    return () => {
      socket.close();
    };
  }, [sessionKey]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || wsRef.current?.readyState !== WebSocket.OPEN) return;

    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: "user", content: trimmed, created_at: new Date().toISOString() },
    ]);
    wsRef.current.send(JSON.stringify({ message: trimmed }));
    setInput("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Chat Assistant</h1>
        <p className="text-sm text-slate-600">
          Ask about careers, universities, or programs — grounded in CampusIQ&apos;s catalog.
        </p>
      </div>

      {messages.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={connectionState !== "open"}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <ChatWindow
        messages={messages}
        streamingContent={streamingContent}
        isAssistantTyping={isAssistantTyping}
      />

      {connectionState === "connecting" && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Spinner size={14} /> Connecting...
        </div>
      )}
      {connectionState === "closed" && (
        <p className="text-xs text-red-500">Disconnected. Refresh the page to reconnect.</p>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question..."
          disabled={connectionState !== "open"}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50"
        />
        <Button type="submit" disabled={connectionState !== "open" || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
