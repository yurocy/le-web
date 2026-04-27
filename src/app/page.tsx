'use client'

import { useEffect } from 'react'
import { useSiteStore } from '@/lib/site-store'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { LoginDialog } from '@/components/site/login-dialog'
import { HeroBanner } from '@/components/site/hero-banner'
import { CategorySection } from '@/components/site/category-section'
import { HotProductsSection } from '@/components/site/hot-products'
import { HowItWorksSection } from '@/components/site/how-it-works'
import { ArticleSection } from '@/components/site/article-section'
import { BiddingSection } from '@/components/site/bidding-section'
import { JoinSection } from '@/components/site/join-section'
import { RecyclePage } from '@/components/pages/recycle-page'
import { ArticlePage, ArticleDetailPage } from '@/components/pages/article-page'
import { BiddingPage } from '@/components/pages/bidding-page'
import { JoinPage } from '@/components/pages/join-page'
import { AboutPage } from '@/components/pages/about-page'
import { UserPage } from '@/components/pages/user-page'

function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategorySection />
      <HotProductsSection />
      <HowItWorksSection />
      <BiddingSection />
      <ArticleSection />
      <JoinSection />
    </>
  )
}

export default function MainPage() {
  const { currentPage, params } = useSiteStore()

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Check for existing token on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('lehuiso_token') : null
    if (token) {
      useSiteStore.getState().setUserInfo({
        id: 1,
        phone: '138****8888',
        nickname: '用户8888',
      })
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'recycle':
        return <RecyclePage />
      case 'order':
        return <RecyclePage />
      case 'bidding':
        return <BiddingPage />
      case 'article':
        return <ArticlePage />
      case 'article-detail':
        return <ArticleDetailPage articleId={params.articleId as number} />
      case 'join':
        return <JoinPage />
      case 'about':
        return <AboutPage />
      case 'user':
      case 'login':
      case 'register':
        return <UserPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        {renderPage()}
      </main>
      <SiteFooter />
      <LoginDialog />
    </div>
  )
}
