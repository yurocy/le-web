import { create } from 'zustand'

export type PageName =
  | 'home'
  | 'recycle'
  | 'order'
  | 'bidding'
  | 'article'
  | 'article-detail'
  | 'join'
  | 'about'
  | 'user'
  | 'login'
  | 'register'

interface SiteState {
  currentPage: PageName
  navigateTo: (page: PageName, params?: Record<string, unknown>) => void
  params: Record<string, unknown>
  isLoggedIn: boolean
  userInfo: { id: number; phone: string; nickname: string } | null
  setUserInfo: (user: { id: number; phone: string; nickname: string } | null) => void
  showLoginDialog: boolean
  setShowLoginDialog: (show: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export const useSiteStore = create<SiteState>((set) => ({
  currentPage: 'home',
  params: {},
  navigateTo: (page, params = {}) => set({ currentPage: page, params, mobileMenuOpen: false }),
  isLoggedIn: false,
  userInfo: null,
  setUserInfo: (user) => set({ isLoggedIn: !!user, userInfo: user }),
  showLoginDialog: false,
  setShowLoginDialog: (show) => set({ showLoginDialog: show }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}))
