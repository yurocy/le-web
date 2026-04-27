'use client'

import { useState } from 'react'
import { X, Phone, Lock, Eye, EyeOff, UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSiteStore } from '@/lib/site-store'

export function LoginDialog() {
  const { showLoginDialog, setShowLoginDialog, setUserInfo } = useSiteStore()
  const [isLogin, setIsLogin] = useState(true)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!phone || !password) {
      setError('请填写手机号和密码')
      return
    }
    if (!isLogin && password !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号')
      return
    }

    setLoading(true)
    try {
      // Mock login/register - in production, call the API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUserInfo({
        id: 1,
        phone: phone,
        nickname: isLogin ? `用户${phone.slice(-4)}` : phone,
      })
      localStorage.setItem('lehuiso_token', 'mock-jwt-token')
      setShowLoginDialog(false)
      resetForm()
    } catch {
      setError('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setPhone('')
    setPassword('')
    setConfirmPassword('')
    setSmsCode('')
    setError('')
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  return (
    <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white text-center relative">
          <button
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
            onClick={() => setShowLoginDialog(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {isLogin ? '欢迎回来' : '加入乐回收'}
            </DialogTitle>
            <p className="text-emerald-100 text-sm mt-1">
              {isLogin ? '登录您的账户，享受便捷回收服务' : '注册新账户，开启环保回收之旅'}
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-11"
                maxLength={11}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={isLogin ? '请输入密码' : '设置登录密码（6-20位）'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11"
                maxLength={20}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {!isLogin && (
              <>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="请确认密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-11"
                    maxLength={20}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="验证码"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    className="h-11 flex-1"
                    maxLength={6}
                  />
                  <Button
                    variant="outline"
                    className="h-11 px-4 flex-shrink-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    获取验证码
                  </Button>
                </div>
              </>
            )}
          </div>

          <Button
            className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-base"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isLogin ? '登录中...' : '注册中...'}
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                {isLogin ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {isLogin ? '登 录' : '注 册'}
              </span>
            )}
          </Button>

          <div className="text-center pt-2">
            <button
              className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
              onClick={switchMode}
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
            </button>
          </div>

          {isLogin && (
            <p className="text-center text-xs text-gray-400">
              登录即表示您同意
              <button className="text-emerald-600 hover:underline">《用户协议》</button>
              和
              <button className="text-emerald-600 hover:underline">《隐私政策》</button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
