'use client'

import { useState, useEffect } from 'react'
import {
  Menu,
  X,
  Phone,
  User,
  LogIn,
  ChevronDown,
  Smartphone,
  Recycle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSiteStore, type PageName } from '@/lib/site-store'

const navItems: { label: string; page: PageName }[] = [
  { label: '首页', page: 'home' },
  { label: '手机回收', page: 'recycle' },
  { label: '竞价专区', page: 'bidding' },
  { label: '资讯中心', page: 'article' },
  { label: '加盟合作', page: 'join' },
  { label: '关于我们', page: 'about' },
]

export function SiteHeader() {
  const { currentPage, navigateTo, isLoggedIn, userInfo, setShowLoginDialog, mobileMenuOpen, setMobileMenuOpen } = useSiteStore()
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClick = () => setUserMenuOpen(false)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <>
      {/* Top bar */}
      <div className="bg-emerald-700 text-white text-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              客服热线：400-888-6666
            </span>
            <span className="text-emerald-200">|</span>
            <span>全国70+城市免费上门回收</span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn && userInfo ? (
              <div className="relative">
                <button
                  className="flex items-center gap-1 hover:text-emerald-100 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen) }}
                >
                  <User className="h-3.5 w-3.5" />
                  {userInfo.nickname || userInfo.phone}
                  <ChevronDown className={`h-3 w-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => { navigateTo('user'); setUserMenuOpen(false) }}
                    >
                      <User className="h-4 w-4" /> 个人中心
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => {
                        localStorage.removeItem('lehuiso_token')
                        useSiteStore.getState().setUserInfo(null)
                        setUserMenuOpen(false)
                      }}
                    >
                      <LogIn className="h-4 w-4" /> 退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="flex items-center gap-1 hover:text-emerald-100 transition-colors"
                onClick={() => setShowLoginDialog(true)}
              >
                <LogIn className="h-3.5 w-3.5" />
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigateTo('home')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-none">乐回收</h1>
                <p className="text-[10px] text-gray-400 tracking-wider">LEHUISO.COM</p>
              </div>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.page
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                onClick={() => navigateTo('recycle')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                立即估价
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === item.page
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-3 border-t mt-3">
                {isLoggedIn ? (
                  <button
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                    onClick={() => navigateTo('user')}
                  >
                    个人中心
                  </button>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    onClick={() => { setShowLoginDialog(true); setMobileMenuOpen(false) }}
                  >
                    登录 / 注册
                  </Button>
                )}
              </div>
              <div className="pt-2">
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  onClick={() => { navigateTo('recycle'); setMobileMenuOpen(false) }}
                >
                  立即估价
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
