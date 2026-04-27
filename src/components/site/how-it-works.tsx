'use client'

import { Search, Truck, ShieldCheck, Banknote, Star } from 'lucide-react'

const steps = [
  {
    icon: Search,
    number: '01',
    title: '选择机型',
    description: '选择您要回收的设备品牌和型号，系统会自动匹配对应产品。支持手机、笔记本、平板等多种数码设备在线估价，流程简单快捷。',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Truck,
    number: '02',
    title: '选择回收方式',
    description: '提供邮寄回收、上门回收、到店回收三种方式供您选择。全国70+城市支持免费上门回收，专业检测员现场验机，安全可靠。',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ShieldCheck,
    number: '03',
    title: '专业检测估价',
    description: '由专业检测工程师对设备进行全面检测，包括外观、功能、性能等多项指标。检测过程透明公开，确保估价公正合理。',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    icon: Banknote,
    number: '04',
    title: '极速打款',
    description: '检测完成确认价格后，支持银行转账、微信、支付宝等多种打款方式。款项秒到账，绝不拖欠，让您安心回收。',
    gradient: 'from-amber-500 to-orange-500',
  },
]

const advantages = [
  { icon: Star, label: '高价回收', desc: '比同行高10%-20%', color: 'text-emerald-600' },
  { icon: ShieldCheck, label: '隐私保护', desc: '专业数据清除', color: 'text-blue-600' },
  { icon: Banknote, label: '极速打款', desc: '检测完成秒到账', color: 'text-purple-600' },
  { icon: Truck, label: '免费上门', desc: '70+城市覆盖', color: 'text-orange-600' },
]

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            回收流程
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            简单四步，轻松回收您的闲置数码设备
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-200 to-gray-100 z-0" />
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300`}>
                  <step.icon className="h-10 w-10 text-white" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">{step.number}</span>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[240px]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Advantages */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">为什么选择乐回收？</h3>
            <p className="text-gray-500 text-sm">专业、安全、高效的一站式回收服务</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {advantages.map((adv) => (
              <div key={adv.label} className="text-center">
                <adv.icon className={`h-8 w-8 ${adv.color} mx-auto mb-3`} />
                <h4 className="font-semibold text-gray-900 mb-1">{adv.label}</h4>
                <p className="text-sm text-gray-500">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
