'use client'

import { useSiteStore } from '@/lib/site-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Timer, Eye, Gavel } from 'lucide-react'

interface BidProduct {
  id: number
  name: string
  brand: string
  grade: string
  currentPrice: number
  bidCount: number
  endTime: string
  image: string
}

const mockBidProducts: BidProduct[] = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', grade: 'S', currentPrice: 5280, bidCount: 23, endTime: '2小时后', image: '' },
  { id: 2, name: '华为 Mate 60 Pro 512GB', brand: '华为', grade: 'A', currentPrice: 4150, bidCount: 18, endTime: '5小时后', image: '' },
  { id: 3, name: '小米 14 Ultra 16+512GB', brand: '小米', grade: 'A+', currentPrice: 3480, bidCount: 15, endTime: '8小时后', image: '' },
  { id: 4, name: '三星 Galaxy S24 Ultra', brand: '三星', grade: 'S', currentPrice: 4200, bidCount: 31, endTime: '1小时后', image: '' },
]

const gradeColors: Record<string, string> = {
  'S': 'bg-emerald-100 text-emerald-700',
  'A+': 'bg-blue-100 text-blue-700',
  'A': 'bg-sky-100 text-sky-700',
  'B': 'bg-amber-100 text-amber-700',
}

export function BiddingSection() {
  const { navigateTo } = useSiteStore()

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gavel className="h-5 w-5 text-emerald-600" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">竞价专区</h2>
            </div>
            <p className="text-gray-500 text-sm">优质二手设备竞价购买，性价比之选</p>
          </div>
          <Button
            variant="ghost"
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigateTo('bidding')}
          >
            进入专区 <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {mockBidProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => navigateTo('bidding')}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-emerald-100 transition-all duration-300 text-left"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <span className="text-white font-bold text-lg">{product.brand.charAt(0)}</span>
                </div>
                <Badge className={`absolute top-3 right-3 ${gradeColors[product.grade] || 'bg-gray-100'}`}>
                  {product.grade}级
                </Badge>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <Timer className="h-3 w-3" />
                  {product.endTime}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-emerald-700 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">当前竞价</p>
                    <p className="text-lg font-bold text-red-500">¥{product.currentPrice.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {product.bidCount}人出价
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
