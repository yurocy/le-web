'use client'

import { useSiteStore } from '@/lib/site-store'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock, Eye, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Article {
  id: number
  title: string
  summary: string
  category: string
  ishot: boolean
  viewCount: number
  createdAt: string
}

const mockArticles: Article[] = [
  {
    id: 1,
    title: '2024年二手手机回收市场趋势分析',
    summary: '随着智能手机更新换代加速，二手手机回收市场迎来了新的发展机遇。本文深入分析了当前市场的主要趋势和未来发展方向...',
    category: '行业动态',
    ishot: true,
    viewCount: 12580,
    createdAt: '2024-04-25',
  },
  {
    id: 2,
    title: 'iPhone 15系列回收价格指南：你的手机值多少钱？',
    summary: '全面解析iPhone 15/15 Plus/15 Pro/15 Pro Max各型号的回收价格影响因素，包括容量、成色、功能状况等...',
    category: '估价指南',
    ishot: true,
    viewCount: 9842,
    createdAt: '2024-04-22',
  },
  {
    id: 3,
    title: '旧手机回收前必做的数据安全处理',
    summary: '在回收旧手机之前，正确处理个人数据非常重要。本文手把手教你如何彻底清除手机中的个人信息...',
    category: '回收攻略',
    ishot: false,
    viewCount: 8756,
    createdAt: '2024-04-20',
  },
  {
    id: 4,
    title: '华为Mate 60系列二手回收价格持续走强',
    summary: '受市场供需关系影响，华为Mate 60系列在二手市场的价格表现超出预期，部分型号甚至出现溢价现象...',
    category: '行业动态',
    ishot: false,
    viewCount: 7321,
    createdAt: '2024-04-18',
  },
]

export function ArticleSection() {
  const { navigateTo } = useSiteStore()

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">资讯中心</h2>
            <p className="text-gray-500 text-sm">了解最新回收资讯和行业动态</p>
          </div>
          <Button
            variant="ghost"
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigateTo('article')}
          >
            更多资讯 <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => navigateTo('article-detail', { articleId: article.id })}
              className="group flex gap-5 p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all duration-300 text-left"
            >
              {/* Thumbnail placeholder */}
              <div className="w-32 h-24 md:w-40 md:h-28 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors">
                <TrendingUp className="h-8 w-8 text-emerald-500/50" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 py-0.5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                    {article.category}
                  </Badge>
                  {article.ishot && (
                    <Badge className="text-xs bg-red-500 text-white border-none">
                      热门
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1.5 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2 hidden sm:block">
                  {article.summary}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.viewCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
