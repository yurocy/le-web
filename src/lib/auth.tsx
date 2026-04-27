"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import api, { UnauthorizedError } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserInfo {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  role_id?: number;
  permissions?: string[];
  [key: string]: unknown;
}

interface AuthContextValue {
  /** Current logged-in user, or null if not authenticated */
  user: UserInfo | null;
  /** JWT token (may be stored but not yet verified) */
  token: string | null;
  /** Whether the initial token-verification check has completed */
  isLoading: boolean;
  /** True when user is authenticated and user info has been loaded */
  isAuthenticated: boolean;
  /** Perform login – stores token and fetches user info */
  login: (username: string, password: string) => Promise<void>;
  /** Clear token and redirect to login */
  logout: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived
  const isAuthenticated = !!token && !!user;

  // ── Read token from localStorage on mount ──────────────────────────────

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
    } else {
      setIsLoading(false);
    }
  }, []);

  // ── Fetch user info whenever token changes ─────────────────────────────

  const fetchUserInfo = useCallback(async (t: string) => {
    try {
      const info = await api.auth.getInfo();
      setUser(info as unknown as UserInfo);
    } catch (err) {
      // Token invalid – clear it
      console.warn("Failed to fetch user info:", err);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserInfo(token);
    }
  }, [token, fetchUserInfo]);

  // ── Listen for server-forced logout events ─────────────────────────────

  useEffect(() => {
    const handler = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      router.push("/login");
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [router]);

  // ── Login ─────────────────────────────────────────────────────────────

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        const t = await api.auth.login({ username, password });
        setToken(t);
        // After setting token, the effect above will fetch user info
      } catch (err) {
        setIsLoading(false);
        throw err;
      }
    },
    [],
  );

  // ── Logout ────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    // Fire-and-forget server logout
    api.auth.logout().catch(() => {});
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  // ── Memoized value ────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      logout,
    }),
    [user, token, isLoading, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

export default AuthContext;
