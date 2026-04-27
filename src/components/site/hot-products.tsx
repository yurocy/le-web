'use client'

import { useSiteStore } from '@/lib/site-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, ArrowRight } from 'lucide-react'

interface Product {
  id: number
  name: string
  brand: string
  model: string
  image: string
  price: number
  originalPrice: number
  ishot: boolean
}

const mockProducts: Product[] = [
  { id: 1, name: 'iPhone 15 Pro Max', brand: 'Apple', model: '256GB', image: '/products/iphone15pm.png', price: 4580, originalPrice: 9999, ishot: true },
  { id: 2, name: '华为 Mate 60 Pro', brand: '华为', model: '512GB', image: '/products/mate60pro.png', price: 3850, originalPrice: 6999, ishot: true },
  { id: 3, name: '小米 14 Ultra', brand: '小米', model: '16+512GB', image: '/products/mi14u.png', price: 2920, originalPrice: 5999, ishot: true },
  { id: 4, name: 'iPhone 14 Pro', brand: 'Apple', model: '256GB', image: '/products/iphone14p.png', price: 3280, originalPrice: 7999, ishot: false },
  { id: 5, name: 'OPPO Find X7 Ultra', brand: 'OPPO', model: '16+256GB', image: '/products/findx7.png', price: 2650, originalPrice: 5999, ishot: false },
  { id: 6, name: 'vivo X100 Pro', brand: 'vivo', model: '16+512GB', image: '/products/x100pro.png', price: 2780, originalPrice: 4999, ishot: false },
  { id: 7, name: '三星 Galaxy S24 Ultra', brand: '三星', model: '256GB', image: '/products/s24u.png', price: 3200, originalPrice: 9699, ishot: true },
  { id: 8, name: '一加 12', brand: '一加', model: '16+256GB', image: '/products/oneplus12.png', price: 2350, originalPrice: 4299, ishot: false },
]

const brandColors: Record<string, string> = {
  'Apple': 'bg-gray-900',
  '华为': 'bg-red-600',
  '小米': 'bg-orange-500',
  'OPPO': 'bg-green-600',
  'vivo': 'bg-blue-600',
  '三星': 'bg-indigo-600',
  '一加': 'bg-red-500',
}

export function HotProductsSection() {
  const { navigateTo } = useSiteStore()

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">热门回收</h2>
            </div>
            <p className="text-gray-500 text-sm">实时更新热门机型回收价格</p>
          </div>
          <Button
            variant="ghost"
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigateTo('recycle')}
          >
            查看全部 <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {mockProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => navigateTo('recycle', { productId: product.id })}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-emerald-100 transition-all duration-300 text-left"
            >
              {/* Product image placeholder */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                <div className={`w-24 h-24 rounded-2xl ${brandColors[product.brand] || 'bg-gray-500'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <span className="text-white font-bold text-lg">{product.brand.charAt(0)}</span>
                </div>
                {product.ishot && (
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white border-none text-xs">
                    热门
                  </Badge>
                )}
              </div>

              {/* Product info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1 group-hover:text-emerald-700 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-400 mb-3">{product.brand} {product.model}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-400">最高回收价</p>
                    <p className="text-xl font-bold text-emerald-600">
                      ¥{product.price.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 line-through">
                    ¥{product.originalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
