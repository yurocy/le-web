'use client'

import { useSiteStore } from '@/lib/site-store'
import { MapPin, Phone, Mail, Clock, Shield, Award, Users, Recycle, Leaf } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <Recycle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">关于乐回收</h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
            国内权威的二手手机回收平台，致力于打造最专业、最安全、最便捷的数码产品回收服务
          </p>
        </div>
      </div>

      {/* Company intro */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">我们的故事</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  乐回收成立于2014年，是国内最早一批专注于二手手机回收的互联网平台之一。十年来，我们始终秉承"让闲置价值最大化"的理念，不断创新回收服务模式，为用户提供便捷、安全、高价的专业回收服务。
                </p>
                <p>
                  经过十年的发展，乐回收已经成长为覆盖全国70+城市、拥有500+合作伙伴的行业领先平台。我们累计服务超过500万用户，回收处理的手机超过1000万台，为环保事业做出了积极的贡献。
                </p>
                <p>
                  未来，乐回收将继续深耕数码产品回收领域，通过技术创新和服务升级，让每一位用户的闲置设备都能得到最大化的价值回收，同时为建设绿色循环经济贡献力量。
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8">
              <div className="space-y-6">
                {[
                  { icon: Users, label: '服务用户', value: '500万+' },
                  { icon: Recycle, label: '回收手机', value: '1000万+台' },
                  { icon: MapPin, label: '覆盖城市', value: '70+' },
                  { icon: Award, label: '合作伙伴', value: '500+' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <stat.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">企业使命与价值观</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Recycle, title: '使命', desc: '让闲置价值最大化，推动绿色循环经济发展。我们致力于构建一个高效、透明、可信赖的数码产品回收生态系统，让每一台闲置设备都能找到最佳的去处。' },
              { icon: Shield, title: '愿景', desc: '成为中国最受信赖的数码产品回收平台。通过持续的技术创新和服务优化，为用户提供最优质的回收体验，引领行业发展方向。' },
              { icon: Leaf, title: '价值观', desc: '诚信为本、用户至上、环保先行、合作共赢。我们坚信，通过诚信经营和优质服务，可以实现商业价值与社会价值的统一。' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">联系我们</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Phone, title: '客服热线', content: '400-888-6666', sub: '周一至周日 9:00-22:00' },
              { icon: Mail, title: '邮箱', content: 'service@lehuiso.com', sub: '24小时内回复' },
              { icon: MapPin, title: '总部地址', content: '深圳市南山区', sub: '科技园南区' },
              { icon: Clock, title: '工作时间', content: '9:00 - 22:00', sub: '全年无休' },
            ].map((item) => (
              <div key={item.title} className="text-center p-5 rounded-2xl bg-gray-50 hover:bg-emerald-50 transition-colors">
                <item.icon className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-700">{item.content}</p>
                <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
