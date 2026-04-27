'use client'

import { useSiteStore } from '@/lib/site-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Phone, Mail, Building2, Users, TrendingUp, Shield, Award, CheckCircle, ArrowRight } from 'lucide-react'
import { useState } from 'react'

const joinSteps = [
  { number: '01', title: '提交申请', desc: '填写加盟申请表，提交基本信息和经营计划', icon: Building2 },
  { number: '02', title: '资质审核', desc: '总部对申请材料进行审核评估，1-3个工作日内回复', icon: Shield },
  { number: '03', title: '签订合同', desc: '审核通过后签订正式加盟合同，缴纳相关费用', icon: Award },
  { number: '04', title: '培训开业', desc: '参加总部培训，完成店铺装修和设备配置，正式开业', icon: CheckCircle },
]

const advantages = [
  { icon: TrendingUp, title: '品牌优势', desc: '10年行业经验，全国知名品牌，强大的品牌影响力和市场认可度，助您快速打开当地市场' },
  { icon: Shield, title: '技术支持', desc: '提供完整的在线估价系统、订单管理系统和数据后台，确保业务运营高效顺畅' },
  { icon: Users, title: '培训支持', desc: '专业的运营团队提供全面培训，包括业务流程、检测标准、客户服务等全方面指导' },
  { icon: Award, title: '供应链支持', desc: '稳定的销售渠道和分销网络，确保回收的设备能够快速变现，降低库存风险' },
]

export function JoinPage() {
  const { navigateTo, setShowLoginDialog, isLoggedIn } = useSiteStore()
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', experience: '' })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border-2 border-white" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full border border-white" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">加盟乐回收 共享千亿市场</h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto mb-8">
            中国二手手机回收市场规模突破2000亿元，年均增长率超过25%。加入乐回收，一起分享快速增长的市场红利。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '合作城市', value: '70+' },
              { label: '合作伙伴', value: '500+' },
              { label: '年增长率', value: '25%' },
              { label: '行业经验', value: '10年' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-emerald-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Join process */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">加盟流程</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {joinSteps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <step.icon className="h-9 w-9 text-white" />
                </div>
                <div className="text-sm text-emerald-600 font-bold mb-1">STEP {step.number}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">加盟优势</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advantages.map((adv) => (
              <div key={adv.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <adv.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{adv.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{adv.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply form */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">提交加盟申请</h2>
          <p className="text-gray-500 text-center mb-8">填写以下信息，我们会在1-3个工作日内与您联系</p>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">您的姓名 *</label>
              <Input placeholder="请输入姓名" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">联系电话 *</label>
              <Input placeholder="请输入手机号码" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">意向城市 *</label>
              <Input placeholder="请输入您所在的城市" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">相关经验</label>
              <textarea className="w-full h-28 px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="请简要描述您的相关行业经验（选填）" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
            </div>
            <Button
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-base font-semibold shadow-lg"
              onClick={() => alert('加盟申请已提交，我们会尽快与您联系！')}
            >
              提交申请 <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact info */}
      <section className="py-16 md:py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">联系我们</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Phone className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">加盟热线</h3>
              <p className="text-gray-400">400-888-6666</p>
            </div>
            <div>
              <Mail className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">邮箱</h3>
              <p className="text-gray-400">join@lehuiso.com</p>
            </div>
            <div>
              <MapPin className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">总部地址</h3>
              <p className="text-gray-400">深圳市南山区科技园</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
