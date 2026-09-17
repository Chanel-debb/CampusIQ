import { cn } from "@/lib/utils";
import type { MessageRole } from "@/types";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm",
          isUser ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"
        )}
      >
        {content || " "}
      </div>
    </div>
  );
}
