import ReactMarkdown, { type Components } from "react-markdown";

import { cn } from "@/lib/utils";
import type { MessageRole } from "@/types";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2 hover:text-indigo-600"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-xs">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-slate-800 p-3 text-xs text-slate-100 last:mb-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-slate-300 pl-3 italic text-slate-600 last:mb-0">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => <h3 className="mb-1 text-base font-semibold">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-1 text-base font-semibold">{children}</h3>,
  h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold">{children}</h3>,
};

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
          isUser ? "whitespace-pre-wrap bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"
        )}
      >
        {isUser ? (
          content || " "
        ) : (
          <ReactMarkdown components={markdownComponents}>{content || " "}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
