'use client'

import { useSiteStore } from '@/lib/site-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Timer, Gavel, Eye, TrendingUp, Filter } from 'lucide-react'
import { useState } from 'react'

interface BidProduct {
  id: number
  name: string
  brand: string
  grade: string
  currentPrice: number
  startPrice: number
  bidCount: number
  endTime: string
  images: string[]
  specs: string
  desc: string
}

const mockProducts: BidProduct[] = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB 原色钛金属', brand: 'Apple', grade: 'S', currentPrice: 5280, startPrice: 3800, bidCount: 23, endTime: '2024-04-28 18:00', images: [], specs: 'A17 Pro / 256GB / 6.7英寸', desc: '外观全新，无使用痕迹。电池健康度98%，所有功能正常。原装配件齐全。' },
  { id: 2, name: '华为 Mate 60 Pro 512GB 雅丹黑', brand: '华为', grade: 'A', currentPrice: 4150, startPrice: 3000, bidCount: 18, endTime: '2024-04-28 20:00', images: [], specs: '麒麟9000S / 512GB / 6.82英寸', desc: '使用约3个月，外观有轻微使用痕迹。屏幕完美无划痕，电池健康度95%。' },
  { id: 3, name: '小米 14 Ultra 16+512GB 黑色', brand: '小米', grade: 'A+', currentPrice: 3480, startPrice: 2500, bidCount: 15, endTime: '2024-04-28 22:00', images: [], specs: '骁龙8 Gen3 / 16+512GB / 6.73英寸', desc: '准新机状态，使用不到1个月。徕卡影像系统，拍照效果极佳。' },
  { id: 4, name: '三星 Galaxy S24 Ultra 256GB 钛灰', brand: '三星', grade: 'S', currentPrice: 4200, startPrice: 3200, bidCount: 31, endTime: '2024-04-28 16:00', images: [], specs: '骁龙8 Gen3 / 256GB / 6.8英寸', desc: 'S Pen内嵌，Galaxy AI功能齐全。外观全新状态，电池健康度97%。' },
  { id: 5, name: 'iPhone 14 Pro 256GB 暗紫色', brand: 'Apple', grade: 'A', currentPrice: 3350, startPrice: 2200, bidCount: 42, endTime: '2024-04-28 19:00', images: [], specs: 'A16 / 256GB / 6.1英寸', desc: '灵动岛功能完好，4800万像素主摄正常。外观有轻微使用痕迹。' },
  { id: 6, name: '一加 12 16+256GB 岩黑', brand: '一加', grade: 'A', currentPrice: 2680, startPrice: 1800, bidCount: 12, endTime: '2024-04-29 12:00', images: [], specs: '骁龙8 Gen3 / 16+256GB / 6.82英寸', desc: '2K护眼屏，哈苏影像系统。使用半年，外观保养良好。' },
]

const gradeColors: Record<string, string> = { 'S': 'bg-emerald-100 text-emerald-700', 'A+': 'bg-blue-100 text-blue-700', 'A': 'bg-sky-100 text-sky-700', 'B': 'bg-amber-100 text-amber-700' }
const gradeLabels: Record<string, string> = { 'S': '外观全新', 'A+': '准新机', 'A': '轻微使用', 'B': '明显使用' }

export function BiddingPage() {
  const { navigateTo, setShowLoginDialog, isLoggedIn } = useSiteStore()
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)

  const filtered = selectedGrade
    ? mockProducts.filter(p => p.grade === selectedGrade)
    : mockProducts

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Gavel className="h-7 w-7" />
            <h1 className="text-3xl md:text-4xl font-bold">竞价专区</h1>
          </div>
          <p className="text-white/80 text-base">优质二手设备竞价购买，每一台都经过专业检测认证</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 pb-20">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">成色筛选：</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedGrade(null)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${!selectedGrade ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              全部
            </button>
            {Object.entries(gradeLabels).map(([grade, label]) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(selectedGrade === grade ? null : grade)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${selectedGrade === grade ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {grade}级 · {label}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all border border-gray-100 group">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <span className="text-white font-bold text-xl">{product.brand.charAt(0)}</span>
                </div>
                <Badge className={`absolute top-3 left-3 ${gradeColors[product.grade]}`}>
                  {product.grade}级 · {gradeLabels[product.grade]}
                </Badge>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <Timer className="h-3 w-3" />
                  <span className="hidden sm:inline">{product.endTime}</span>
                  <span className="sm:hidden">竞价中</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-400 mb-1">{product.specs}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-400">当前最高出价</p>
                    <p className="text-xl font-bold text-red-500">¥{product.currentPrice.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">起拍价 ¥{product.startPrice.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-2">{product.bidCount}人出价</p>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                      onClick={() => { if (!isLoggedIn) setShowLoginDialog(true) }}
                    >
                      <Gavel className="h-4 w-4 mr-1" />
                      出价
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
