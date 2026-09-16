export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export function chatSocketUrl(conversationId: string): string {
  return `${WS_URL}/ws/chat/${conversationId}/`;
}
