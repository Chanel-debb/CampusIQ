import { create } from "zustand";

import { api } from "@/lib/api";
import type { User, UserRole } from "@/types";

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
  role?: UserRole;
  province?: string;
  grad_year?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,

  login: async (email, password) => {
    const { data } = await api.post<{ access: string; refresh: string }>("/api/auth/token/", {
      email,
      password,
    });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    set({ accessToken: data.access, refreshToken: data.refresh });

    const { data: user } = await api.get<User>("/api/auth/me/");
    set({ user });
  },

  register: async (payload) => {
    await api.post("/api/auth/register/", payload);
    await get().login(payload.email, payload.password);
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, accessToken: null, refreshToken: null });
  },

  hydrate: async () => {
    const token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!token) {
      set({ isHydrated: true });
      return;
    }

    set({ accessToken: token, refreshToken });

    try {
      const { data: user } = await api.get<User>("/api/auth/me/");
      set({ user, isHydrated: true });
    } catch {
      get().logout();
      set({ isHydrated: true });
    }
  },
}));
