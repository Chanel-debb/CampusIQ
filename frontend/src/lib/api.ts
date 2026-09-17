import axios from "axios";

import { useAuthStore } from "@/store/authStore";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export function chatSocketUrl(sessionKey: string): string {
  return `${WS_URL}/ws/chat/${sessionKey}/`;
}

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Lazy access: this module and authStore import each other, but by the time a
      // real response comes back both modules have finished loading, so this is safe.
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
