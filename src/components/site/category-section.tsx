'use client'

import { Smartphone, Laptop, Tablet, Camera, Gamepad2, Watch } from 'lucide-react'
import { useSiteStore } from '@/lib/site-store'

const categories = [
  { icon: Smartphone, label: '手机回收', desc: 'iPhone / 华为 / 小米等', gradient: 'from-emerald-500 to-teal-500', count: '500+型号' },
  { icon: Laptop, label: '笔记本回收', desc: 'MacBook / 联想 / 戴尔等', gradient: 'from-blue-500 to-indigo-500', count: '200+型号' },
  { icon: Tablet, label: '平板回收', desc: 'iPad / 华为平板 / 小米平板', gradient: 'from-purple-500 to-violet-500', count: '100+型号' },
  { icon: Camera, label: '相机回收', desc: '单反 / 微单 / 运动相机', gradient: 'from-amber-500 to-orange-500', count: '80+型号' },
  { icon: Gamepad2, label: '游戏机回收', desc: 'PS5 / Switch / Xbox', gradient: 'from-rose-500 to-pink-500', count: '50+型号' },
  { icon: Watch, label: '智能手表', desc: 'Apple Watch / 华为手表', gradient: 'from-cyan-500 to-sky-500', count: '40+型号' },
]

export function CategorySection() {
  const { navigateTo } = useSiteStore()

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            回收分类
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            专业回收各类数码电子产品，覆盖主流品牌和型号，提供精准估价服务
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => navigateTo('recycle')}
              className="group flex flex-col items-center p-5 md:p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <cat.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                {cat.label}
              </h3>
              <p className="text-xs text-gray-400 mb-2">{cat.desc}</p>
              <span className={`text-xs font-medium bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
