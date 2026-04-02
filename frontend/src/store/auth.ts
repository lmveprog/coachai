"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isNewUser: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setNewUser: () => void;
  clearNewUser: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isNewUser: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAuth: (user, token, refreshToken) => {
        set({ user, token, refreshToken: refreshToken ?? get().refreshToken });
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", token);
          if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
        }
      },
      setNewUser: () => set({ isNewUser: true }),
      clearNewUser: () => set({ isNewUser: false }),
      logout: () => {
        // Blackliste le refresh token côté backend (fire & forget)
        const rt = get().refreshToken ?? (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null);
        if (rt) {
          fetch(`${BASE_URL}/api/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: rt }),
          }).catch(() => {});
        }
        set({ user: null, token: null, refreshToken: null, isNewUser: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      },
    }),
    {
      name: "coachai-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isNewUser: state.isNewUser,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window === "undefined") return;
        if (state?.token) localStorage.setItem("access_token", state.token);
        if (state?.refreshToken) localStorage.setItem("refresh_token", state.refreshToken);
      },
    }
  )
);
