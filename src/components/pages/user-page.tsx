'use client'

import { useState } from 'react'
import { useSiteStore } from '@/lib/site-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Package, Settings, LogOut, ChevronRight, Clock, MapPin, CreditCard, Shield } from 'lucide-react'

type Tab = 'orders' | 'profile' | 'settings'

const mockOrders = [
  { id: 'ORD20240427001', product: 'iPhone 15 Pro Max 256GB', price: 4580, status: '完成交易', method: '邮寄回收', date: '2024-04-27' },
  { id: 'ORD20240425002', product: '华为 Mate 60 Pro 512GB', price: 3850, status: '已检测', method: '上门回收', date: '2024-04-25' },
  { id: 'ORD20240420003', product: '小米 14 Ultra', price: 2920, status: '已发货', method: '邮寄回收', date: '2024-04-20' },
]

const statusColors: Record<string, string> = {
  '完成交易': 'bg-emerald-100 text-emerald-700',
  '已检测': 'bg-orange-100 text-orange-700',
  '已发货': 'bg-yellow-100 text-yellow-700',
  '已受理': 'bg-blue-100 text-blue-700',
  '已签收': 'bg-purple-100 text-purple-700',
}

export function UserPage() {
  const { userInfo, setUserInfo, navigateTo } = useSiteStore()
  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [nickname, setNickname] = useState(userInfo?.nickname || '')

  const user = userInfo || { phone: '138****8888', nickname: '用户8888' }

  const handleLogout = () => {
    localStorage.removeItem('lehuiso_token')
    setUserInfo(null)
    navigateTo('home')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-xl md:text-2xl font-bold">{user.nickname}</h1>
              <p className="text-emerald-100">{user.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 pb-20">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-56 flex-shrink-0">
            <Card>
              <CardContent className="p-2">
                {[
                  { tab: 'orders' as Tab, icon: Package, label: '我的订单' },
                  { tab: 'profile' as Tab, icon: User, label: '个人资料' },
                  { tab: 'settings' as Tab, icon: Settings, label: '账户设置' },
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.tab
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    <ChevronRight className="h-4 w-4 ml-auto opacity-30" />
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border-t mt-2 pt-3"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Orders tab */}
            {activeTab === 'orders' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">我的订单</CardTitle>
                </CardHeader>
                <CardContent>
                  {mockOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>暂无订单</p>
                      <Button
                        variant="outline"
                        className="mt-4 text-emerald-600 border-emerald-200"
                        onClick={() => navigateTo('recycle')}
                      >
                        去估价回收
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mockOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">{order.product}</span>
                              <Badge variant="secondary" className={`text-xs ${statusColors[order.status] || ''}`}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>{order.id}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.date}</span>
                              <span>{order.method}</span>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-emerald-600 ml-4">¥{order.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Profile tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">个人资料</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">手机号</label>
                    <Input defaultValue={user.phone} disabled className="h-11 bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">昵称</label>
                    <Input value={nickname} onChange={(e) => setNickname(e.target.value)} className="h-11" placeholder="设置您的昵称" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">所在城市</label>
                    <Input defaultValue="广东省 深圳市 南山区" disabled className="h-11 bg-gray-50" />
                  </div>
                  <Button
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    onClick={() => {
                      setUserInfo({ ...user, nickname })
                      alert('资料已保存')
                    }}
                  >
                    保存修改
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">账户设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">修改密码</p>
                        <p className="text-xs text-gray-400">定期修改密码保护账户安全</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">修改</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">收款方式</p>
                        <p className="text-xs text-gray-400">设置收款银行卡信息</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">设置</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">默认地址</p>
                        <p className="text-xs text-gray-400">设置回收邮寄地址</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">设置</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
