'use client'

import { useSiteStore } from '@/lib/site-store'
import { Button } from '@/components/ui/button'
import { ArrowRight, MapPin, TrendingUp, Users, Award, Headphones } from 'lucide-react'

export function JoinSection() {
  const { navigateTo } = useSiteStore()

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border-2 border-white" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full border border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            加盟乐回收 共创绿色未来
          </h2>
          <p className="text-emerald-100 text-base md:text-lg max-w-2xl mx-auto">
            诚招全国城市代理和合作伙伴，共享千亿级二手回收市场红利。提供完整的运营体系、技术平台和培训支持。
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: MapPin, label: '覆盖城市', value: '70+' },
            { icon: TrendingUp, label: '月增长', value: '25%' },
            { icon: Users, label: '合作伙伴', value: '500+' },
            { icon: Award, label: '行业经验', value: '10年' },
          ].map((stat) => (
            <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <stat.icon className="h-8 w-8 text-white/90 mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-emerald-100">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-emerald-700 hover:bg-gray-50 shadow-xl text-base px-10 h-12 font-semibold"
            onClick={() => navigateTo('join')}
          >
            了解加盟详情 <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 hover:text-white text-base px-10 h-12"
          >
            <Headphones className="h-5 w-5 mr-2" />
            加盟热线：400-888-6666
          </Button>
        </div>
      </div>
    </section>
  )
}
