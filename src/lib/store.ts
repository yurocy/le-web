import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  permissions?: string[];
  [key: string]: unknown;
}

export interface AppState {
  // ── Sidebar ───────────────────────────────────────────────────────────
  /** Whether the sidebar is collapsed (icon-only mode) */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // ── Breadcrumbs ───────────────────────────────────────────────────────
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;

  // ── User info cache ───────────────────────────────────────────────────
  currentUser: UserInfo | null;
  setCurrentUser: (user: UserInfo | null) => void;

  // ── Global loading overlay ────────────────────────────────────────────
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ── Sidebar ──────────────────────────────────────────────────────
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // ── Breadcrumbs ──────────────────────────────────────────────────
      breadcrumbs: [{ label: "首页", href: "/" }],
      setBreadcrumbs: (items) => set({ breadcrumbs: items }),

      // ── User info cache ──────────────────────────────────────────────
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      // ── Global loading ───────────────────────────────────────────────
      globalLoading: false,
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
    }),
    {
      name: "admin-app-store",
      // Only persist sidebar state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);

export default useAppStore;
