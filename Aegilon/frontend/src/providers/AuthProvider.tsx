"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TOKEN_KEY } from "@/lib/axios";
import { AUTH_BYPASS } from "@/lib/config";
import { getMe, login as loginRequest } from "@/services/auth";
import type { User } from "@/types";

const PREVIEW_USER: User = {
  id: "preview",
  name: "Preview User",
  email: "preview@aegilon.local",
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(AUTH_BYPASS ? PREVIEW_USER : null);
  const [isLoading, setIsLoading] = useState(!AUTH_BYPASS);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    if (AUTH_BYPASS) {
      setUser(PREVIEW_USER);
      setIsLoading(false);
      return;
    }
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (username: string, password: string) => {
      const token = await loginRequest(username, password);
      localStorage.setItem(TOKEN_KEY, token.access_token);
      const me = await getMe();
      setUser(me);
      router.push("/");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
