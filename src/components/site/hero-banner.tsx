'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSiteStore } from '@/lib/site-store'

interface Banner {
  id: number
  title: string
  subtitle?: string
  image: string
  link?: string
}

const mockBanners: Banner[] = [
  { id: 1, title: '高价回收 二手手机', subtitle: '比同行高10%-20% 极速打款', image: '/banners/banner1.jpg', link: 'recycle' },
  { id: 2, title: '全国70+城市 免费上门', subtitle: '专业检测员上门回收 一站式服务', image: '/banners/banner2.jpg', link: 'recycle' },
  { id: 3, title: '竞价拍卖 更多选择', subtitle: '优质二手手机竞价购买 性价比之选', image: '/banners/banner3.jpg', link: 'bidding' },
  { id: 4, title: '加盟合作 互利共赢', subtitle: '诚招全国城市代理 携手共进', image: '/banners/banner4.jpg', link: 'join' },
]

// Gradient backgrounds as banner placeholders
const bannerGradients = [
  'from-emerald-600 via-teal-500 to-cyan-500',
  'from-blue-600 via-indigo-500 to-purple-500',
  'from-orange-500 via-amber-500 to-yellow-400',
  'from-rose-500 via-pink-500 to-fuchsia-500',
]

export function HeroBanner() {
  const { navigateTo } = useSiteStore()
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((c) => (c + 1) % mockBanners.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + mockBanners.length) % mockBanners.length), [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const banner = mockBanners[current]

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[320px] sm:h-[400px] md:h-[480px] lg:h-[520px]">
        {/* Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${bannerGradients[current]} transition-all duration-700`}>
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-2 border-white" />
            <div className="absolute top-20 left-20 w-60 h-60 rounded-full border border-white" />
            <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full border-2 border-white" />
            <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full border border-white" />
          </div>
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 animate-fade-in">
              {banner.title}
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 animate-fade-in-delay">
              {banner.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-delay-2">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl text-base px-8 h-12"
                onClick={() => navigateTo(banner.link as 'recycle')}
              >
                <Search className="h-5 w-5 mr-2" />
                立即估价
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white text-base px-8 h-12"
                onClick={() => navigateTo('recycle')}
              >
                了解更多
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          onClick={prev}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          onClick={next}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {mockBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
