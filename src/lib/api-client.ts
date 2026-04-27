// API Client for le-go backend
// Base URL will be configured via environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

// Get auth token from localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('lehuiso_token')
}

// Generic request function
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`

  try {
    const res = await fetch(url, { ...options, headers })
    const data = await res.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    return { code: -1, message: '网络请求失败', data: null as T }
  }
}

// ==================== Public APIs ====================

// Product & Category
export async function getCategories() {
  return request('/public/category')
}

export async function getBrands(categoryId?: number) {
  const params = categoryId ? `?category_id=${categoryId}` : ''
  return request('/public/brand' + params)
}

export async function getProducts(params?: {
  keyword?: string
  brand_id?: number
  category_id?: number
  ishot?: number
  page?: number
  size?: number
}) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v))
      }
    })
  }
  const qs = searchParams.toString()
  return request(`/public/product${qs ? '?' + qs : ''}`)
}

export async function getProductDetail(id: number) {
  return request(`/public/product/${id}`)
}

export async function getCoupons() {
  return request('/public/coupon')
}

// Pricing
export async function getPricingCategories() {
  return request('/public/pricing/category')
}

export async function getPricingBrands(categoryId?: number) {
  const params = categoryId ? `?cid=${categoryId}` : ''
  return request('/public/pricing/brand' + params)
}

export async function getPricings(params?: {
  category_id?: number
  brand_id?: number
  title?: string
}) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v))
      }
    })
  }
  const qs = searchParams.toString()
  return request(`/public/pricing${qs ? '?' + qs : ''}`)
}

// Bidding
export async function getBiddingCategories() {
  return request('/public/bidding/category')
}

export async function getBiddingProducts(params?: {
  category_id?: number
  brand_id?: number
  grade?: string
  page?: number
  size?: number
}) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v))
      }
    })
  }
  const qs = searchParams.toString()
  return request(`/public/bidding/product${qs ? '?' + qs : ''}`)
}

export async function getBiddingProductDetail(id: number) {
  return request(`/public/bidding/product/${id}`)
}

// Articles
export async function getArticleCategories() {
  return request('/public/article/category')
}

export async function getArticles(params?: {
  category_id?: number
  ishot?: number
  title?: string
  page?: number
  size?: number
}) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v))
      }
    })
  }
  const qs = searchParams.toString()
  return request(`/public/article${qs ? '?' + qs : ''}`)
}

export async function getArticleDetail(id: number) {
  return request(`/public/article/${id}`)
}

// Website/CMS
export async function getSiteConfig() {
  return request('/public/config')
}

export async function getBanners(type?: number) {
  const params = type !== undefined ? `?type=${type}` : ''
  return request('/public/banner' + params)
}

export async function getProvinces() {
  return request('/public/region/province')
}

export async function getCities(provinceId: number) {
  return request(`/public/region/city?province_id=${provinceId}`)
}

export async function getCounties(cityId: number) {
  return request(`/public/region/county?city_id=${cityId}`)
}

export async function getExpressCarriers() {
  return request('/public/express')
}

// ==================== Member/Auth APIs ====================

export async function memberLogin(phone: string, password: string) {
  const res = await request<{ token: string; user: { id: number; phone: string; nickname: string } }>(
    '/public/member/login',
    {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }
  )
  if (res.code === 0 && res.data) {
    localStorage.setItem('lehuiso_token', res.data.token)
  }
  return res
}

export async function memberRegister(phone: string, password: string, smsCode: string) {
  return request<{ token: string; user: { id: number; phone: string } }>(
    '/public/member/register',
    {
      method: 'POST',
      body: JSON.stringify({ phone, password, sms_code: smsCode }),
    }
  )
}

export async function getMemberInfo() {
  return request<{ id: number; phone: string; nickname: string; avatar: string; city: string; bank: string }>('/public/member/info')
}

export async function updateMemberInfo(data: { nickname?: string; bank_id?: number; city_id?: number; pay_meth?: number }) {
  return request('/public/member/info', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// ==================== Order APIs ====================

export async function submitOrder(data: {
  product_id: number
  method: number // 0=mail, 1=visit, 2=store
  user_name: string
  user_phone: string
  province_id?: number
  city_id?: number
  county_id?: number
  address?: string
  store_id?: number
  coupon?: string
  imei?: string
  images?: string[]
  remark?: string
}) {
  return request<{ order_id: string }>('/public/order', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getMyOrders(params?: { status?: number; page?: number; size?: number }) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v))
      }
    })
  }
  const qs = searchParams.toString()
  return request(`/public/order${qs ? '?' + qs : ''}`)
}

export async function getOrderDetail(id: string) {
  return request(`/public/order/${id}`)
}

export function logout() {
  localStorage.removeItem('lehuiso_token')
}
