'use client'

import { useState } from 'react'
import { useSiteStore } from '@/lib/site-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronRight, ArrowLeft, Check, Smartphone, MapPin, Truck, Store, CreditCard, Clock, Star } from 'lucide-react'

// ==================== Brands Data ====================
const brands = [
  { id: 1, name: 'Apple', models: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13'] },
  { id: 2, name: '华为', models: ['Mate 60 Pro+', 'Mate 60 Pro', 'Mate 60', 'P60 Pro', 'P60', 'Mate 50 Pro', 'Mate 50', 'nova 12 Ultra', 'nova 12 Pro'] },
  { id: 3, name: '小米', models: ['小米 14 Ultra', '小米 14 Pro', '小米 14', '小米 13 Ultra', '小米 13 Pro', '小米 13', 'Redmi K70 Pro', 'Redmi K70'] },
  { id: 4, name: 'OPPO', models: ['Find X7 Ultra', 'Find X7', 'Reno 11 Pro+', 'Reno 11 Pro', 'Reno 11', 'Find N3 Flip', 'Find N3'] },
  { id: 5, name: 'vivo', models: ['X100 Ultra', 'X100 Pro', 'X100', 'X90 Pro+', 'X90 Pro', 'X90', 'iQOO 12 Pro', 'iQOO 12'] },
  { id: 6, name: '三星', models: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy Z Fold5', 'Galaxy Z Flip5', 'Galaxy S23 Ultra'] },
  { id: 7, name: '一加', models: ['一加 12', '一加 11', '一加 Ace 3', '一加 Ace 2 Pro', '一加 Ace 2'] },
  { id: 8, name: '荣耀', models: ['Magic6 至臻版', 'Magic6 Pro', 'Magic6', 'Magic5 Pro', 'Magic5', '90 Pro', '90'] },
]

const brandColors: Record<string, string> = {
  'Apple': 'from-gray-800 to-gray-900',
  '华为': 'from-red-500 to-red-600',
  '小米': 'from-orange-500 to-orange-600',
  'OPPO': 'from-green-500 to-green-600',
  'vivo': 'from-blue-500 to-blue-600',
  '三星': 'from-indigo-500 to-indigo-600',
  '一加': 'from-red-400 to-red-500',
  '荣耀': 'from-sky-500 to-sky-600',
}

const brandLogos: Record<string, string> = {
  'Apple': '', '华为': 'H', '小米': 'MI', 'OPPO': 'O', 'vivo': 'V', '三星': 'S', '一加': '1+', '荣耀': 'H'
}

type RecycleStep = 'brand' | 'model' | 'condition' | 'price' | 'order'

const conditions = [
  { id: 'excellent', label: '优良', desc: '外观无划痕、无磕碰，所有功能正常，屏幕无损坏', priceRatio: 1.0 },
  { id: 'good', label: '良好', desc: '外观有轻微使用痕迹，功能全部正常，屏幕可能有极轻微划痕', priceRatio: 0.85 },
  { id: 'fair', label: '一般', desc: '外观有明显划痕或磕碰，部分功能可能有小问题，屏幕可能有划痕', priceRatio: 0.7 },
  { id: 'poor', label: '较差', desc: '外观严重磨损，部分功能异常，屏幕可能有裂纹或显示异常', priceRatio: 0.5 },
]

const additionalIssues = [
  { id: 'battery', label: '电池健康度低于80%', deduct: 100 },
  { id: 'backlight', label: '屏幕背光不均', deduct: 150 },
  { id: 'button', label: '按键失灵', deduct: 80 },
  { id: 'camera', label: '摄像头有瑕疵', deduct: 120 },
  { id: 'speaker', label: '扬声器异常', deduct: 80 },
  { id: 'charging', label: '充电口松动', deduct: 60 },
]

export function RecyclePage() {
  const { navigateTo, setShowLoginDialog, isLoggedIn } = useSiteStore()
  const [step, setStep] = useState<RecycleStep>('brand')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<typeof brands[0] | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [basePrice] = useState(() => Math.floor(Math.random() * 3000) + 2000)

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  const getFinalPrice = () => {
    const condition = conditions.find(c => c.id === selectedCondition)
    const ratio = condition?.priceRatio || 0.7
    let price = basePrice * ratio
    selectedIssues.forEach(issueId => {
      const issue = additionalIssues.find(i => i.id === issueId)
      if (issue) price -= issue.deduct
    })
    return Math.max(Math.floor(price), 100)
  }

  // Brand select step
  if (step === 'brand') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">选择品牌</h1>
            <p className="text-emerald-100">请选择您要回收设备的品牌</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="搜索品牌..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {filteredBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => { setSelectedBrand(brand); setStep('model') }}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${brandColors[brand.name]} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <span className="text-white font-bold text-lg">{brandLogos[brand.name] || brand.name.charAt(0)}</span>
                  </div>
                  <span className="font-medium text-gray-900">{brand.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Model select step
  if (step === 'model' && selectedBrand) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 text-white">
            <button onClick={() => setStep('brand')} className="flex items-center gap-1 text-emerald-100 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" /> 返回品牌选择
            </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{selectedBrand.name}</h1>
            <p className="text-emerald-100">请选择您的设备型号</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedBrand.models.map((model) => (
                <button
                  key={model}
                  onClick={() => { setSelectedModel(model); setStep('condition') }}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${brandColors[selectedBrand.name]} flex items-center justify-center flex-shrink-0`}>
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{model}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Condition assessment step
  if (step === 'condition') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 text-white">
            <button onClick={() => setStep('model')} className="flex items-center gap-1 text-emerald-100 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" /> 返回型号选择
            </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">设备状况评估</h1>
            <p className="text-emerald-100">{selectedBrand?.name} {selectedModel}</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 -mt-6 pb-20">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-emerald-600" />
              请选择设备整体成色
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conditions.map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setSelectedCondition(cond.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedCondition === cond.id
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{cond.label}</span>
                    {selectedCondition === cond.id && <Check className="h-5 w-5 text-emerald-600" />}
                  </div>
                  <p className="text-sm text-gray-500">{cond.desc}</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    价格系数：{Math.round(cond.priceRatio * 100)}%
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">是否有以下问题？（可多选）</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {additionalIssues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssues(prev =>
                    prev.includes(issue.id) ? prev.filter(i => i !== issue.id) : [...prev, issue.id]
                  )}
                  className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between ${
                    selectedIssues.includes(issue.id)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-sm text-gray-700">{issue.label}</span>
                  {selectedIssues.includes(issue.id) && (
                    <Badge variant="secondary" className="text-xs text-red-600 bg-red-100">-{issue.deduct}元</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-base font-semibold shadow-lg"
            onClick={() => setStep('price')}
            disabled={!selectedCondition}
          >
            查看估价结果
          </Button>
        </div>
      </div>
    )
  }

  // Price result step
  if (step === 'price') {
    const finalPrice = getFinalPrice()
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 text-white">
            <button onClick={() => setStep('condition')} className="flex items-center gap-1 text-emerald-100 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" /> 重新评估
            </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">估价结果</h1>
            <p className="text-emerald-100">{selectedBrand?.name} {selectedModel}</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 -mt-6 pb-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-10 w-10 text-emerald-600" />
            </div>
            <p className="text-gray-500 mb-2">预估回收价格</p>
            <p className="text-5xl md:text-6xl font-bold text-emerald-600 mb-2">¥{finalPrice.toLocaleString()}</p>
            <p className="text-sm text-gray-400">实际价格以专业检测为准</p>

            <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-xs text-gray-400 mb-1">设备型号</p>
                <p className="text-sm font-medium text-gray-900">{selectedBrand?.name} {selectedModel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">设备成色</p>
                <p className="text-sm font-medium text-gray-900">{conditions.find(c => c.id === selectedCondition)?.label}</p>
              </div>
              {selectedIssues.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">扣除项目</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedIssues.map(id => {
                      const issue = additionalIssues.find(i => i.id === id)
                      return issue ? (
                        <Badge key={id} variant="secondary" className="text-xs">-{issue.deduct}元 {issue.label}</Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">选择回收方式</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Truck, label: '邮寄回收', desc: '邮寄到检测中心', method: 0 },
                { icon: MapPin, label: '上门回收', desc: '70+城市免费上门', method: 1 },
                { icon: Store, label: '到店回收', desc: '附近门店自提', method: 2 },
              ].map((item) => (
                <button
                  key={item.method}
                  onClick={() => {
                    if (!isLoggedIn) { setShowLoginDialog(true); return }
                    setStep('order')
                  }}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <item.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-base font-semibold shadow-lg"
            onClick={() => navigateTo('home')}
          >
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  // Order submission step
  if (step === 'order') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 text-white">
            <button onClick={() => setStep('price')} className="flex items-center gap-1 text-emerald-100 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" /> 返回估价
            </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">提交回收订单</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 -mt-6 pb-20">
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">回收设备</p>
                <p className="font-semibold text-gray-900">{selectedBrand?.name} {selectedModel}</p>
              </div>
              <p className="text-xl font-bold text-emerald-600">¥{getFinalPrice().toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">联系人姓名</label>
              <Input placeholder="请输入您的姓名" className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">联系电话</label>
              <Input placeholder="请输入手机号码" type="tel" className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">收货地址</label>
              <Input placeholder="请输入详细地址" className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">IMEI号（选填）</label>
              <Input placeholder="在拨号界面输入 *#06# 查看" className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">备注</label>
              <textarea className="w-full h-24 px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="其他需要说明的情况..." />
            </div>
            <Button
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-base font-semibold shadow-lg"
              onClick={() => {
                alert('订单提交成功！我们会尽快联系您。')
                navigateTo('user')
              }}
            >
              提交订单
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
