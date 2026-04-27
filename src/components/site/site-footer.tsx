'use client'

import { useSiteStore } from '@/lib/site-store'
import { Recycle, Phone, Mail, MapPin, Shield, Clock, Award } from 'lucide-react'

const quickLinks = [
  { label: '手机回收', page: 'recycle' as const },
  { label: '竞价专区', page: 'bidding' as const },
  { label: '资讯中心', page: 'article' as const },
  { label: '加盟合作', page: 'join' as const },
  { label: '关于我们', page: 'about' as const },
]

const features = [
  { icon: Shield, label: '安全保障', desc: '数据加密传输' },
  { icon: Clock, label: '极速打款', desc: '检测完成秒到账' },
  { icon: Award, label: '高价回收', desc: '比同行高10%-20%' },
]

export function SiteFooter() {
  const { navigateTo } = useSiteStore()

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-none">乐回收</h3>
                <p className="text-[10px] text-gray-500 tracking-wider">LEHUISO.COM</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              乐回收是国内权威的二手手机回收平台，提供精准的在线估价系统，支持全国范围内手机、笔记本、平板等数码产品回收服务。
            </p>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-emerald-500" />
                客服热线：400-888-6666
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-emerald-500" />
                service@lehuiso.com
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-emerald-500" />
                全国70+城市覆盖
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4">快速导航</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.page}>
                  <button
                    onClick={() => navigateTo(item.page)}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Service links */}
          <div>
            <h4 className="text-white font-semibold mb-4">回收服务</h4>
            <ul className="space-y-2.5">
              {['手机回收', '笔记本回收', '平板电脑回收', '相机回收', '游戏机回收'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => navigateTo('recycle')}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">平台保障</h4>
            <div className="space-y-4">
              {features.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} 乐回收 lehuiso.com 版权所有</p>
          <div className="flex items-center gap-4">
            <span>粤ICP备XXXXXXXX号</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">增值电信业务经营许可证</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
