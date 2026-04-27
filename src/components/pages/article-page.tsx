'use client'

import { useSiteStore } from '@/lib/site-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Eye, Search } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface Article {
  id: number
  title: string
  summary: string
  content: string
  category: string
  ishot: boolean
  viewCount: number
  createdAt: string
}

const mockArticles: Article[] = [
  { id: 1, title: '2024年二手手机回收市场趋势分析', summary: '随着智能手机更新换代加速...', content: '随着智能手机更新换代加速，二手手机回收市场迎来了新的发展机遇。本文深入分析了当前市场的主要趋势和未来发展方向。近年来，国家大力推动循环经济发展，出台了多项鼓励废旧电子产品回收利用的政策法规，为行业发展提供了强有力的政策支撑。同时，消费者环保意识不断提升，越来越多人开始选择将闲置电子产品通过正规渠道回收，而不是随意丢弃或闲置在家中。\n\n从市场规模来看，中国二手手机回收市场已经进入快速发展期。据行业数据显示，2023年中国二手手机交易规模突破2000亿元，预计2024年将增长至2500亿元以上。其中，线上回收平台的市场份额持续提升，已经超过线下回收渠道，成为消费者首选的回收方式。\n\n从品牌分布来看，Apple、华为、小米三大品牌占据了二手手机回收市场的主要份额。iPhone系列因其保值率较高、品牌认可度强，一直是回收市场的热门产品。华为国产品牌近年来在二手市场的表现也相当亮眼，特别是Mate系列和P系列，深受消费者青睐。', category: '行业动态', ishot: true, viewCount: 12580, createdAt: '2024-04-25' },
  { id: 2, title: 'iPhone 15系列回收价格指南', summary: '全面解析iPhone 15各型号的回收价格...', content: '全面解析iPhone 15/15 Plus/15 Pro/15 Pro Max各型号的回收价格影响因素，包括容量、成色、功能状况等。\n\niPhone 15 Pro Max 256GB：当前市场回收价格在4200-5200元之间，具体价格取决于设备成色。如果是准新机（外观无瑕疵，功能全部正常），可以获得最高回收价。如果是正常使用的设备（有轻微划痕，功能正常），回收价格约在4500-4800元之间。\n\niPhone 15 Pro 256GB：回收价格约在3500-4500元之间。相较于Pro Max，Pro版本因为屏幕尺寸和电池容量的差异，在二手市场的价格略低一些。\n\n影响iPhone回收价格的主要因素包括：设备成色（外观是否有划痕、磕碰、变形等）、功能状况（屏幕、电池、摄像头、面容ID等是否正常）、存储容量（容量越大价格越高）、购买渠道（国行版本价格最高）以及配件完整性（原装充电器、数据线等）。', category: '估价指南', ishot: true, viewCount: 9842, createdAt: '2024-04-22' },
  { id: 3, title: '旧手机回收前必做的数据安全处理', summary: '在回收旧手机之前，正确处理个人数据...', content: '在回收旧手机之前，正确处理个人数据非常重要。本文手把手教你如何彻底清除手机中的个人信息，保护你的隐私安全。\n\n第一步：备份重要数据。在清除数据之前，请务必将手机中的重要照片、联系人、文件等数据备份到云端或电脑。可以使用iCloud、Google Drive、百度网盘等云存储服务，或者直接连接电脑进行本地备份。\n\n第二步：退出所有账户。包括Apple ID、Google账号、社交媒体账号、银行APP等。确保在退出账户时选择"从设备中移除"选项，这样可以断开设备与账户的绑定关系，防止他人恢复你的数据。\n\n第三步：手动检查和删除。浏览相册、文件管理器、备忘录等应用，确保没有遗漏的敏感信息。特别注意微信聊天记录的备份和清理，建议提前将重要聊天记录迁移或备份。\n\n第四步：恢复出厂设置。进入手机设置，选择"恢复出厂设置"或"抹掉所有内容和设置"。这一步会彻底清除手机上的所有数据。对于iOS设备，抹掉后还需要确保设备已从你的Apple ID中移除（激活锁已关闭）。', category: '回收攻略', ishot: false, viewCount: 8756, createdAt: '2024-04-20' },
  { id: 4, title: '华为Mate 60系列二手回收价格持续走强', summary: '受市场供需关系影响，华为Mate 60系列...', content: '受市场供需关系影响，华为Mate 60系列在二手市场的价格表现超出预期，部分型号甚至出现溢价现象。\n\nMate 60 Pro+ 512GB作为该系列的旗舰型号，目前回收价格在4200-5000元之间，是华为品牌中保值率最高的机型之一。而Mate 60 Pro 256GB的回收价格也在3500-4200元之间，表现同样抢眼。\n\n业内人士分析，华为Mate 60系列价格走强的主要原因有三点：一是麒麟芯片回归带来的市场热度；二是华为品牌在国内市场的影响力和认可度持续提升；三是该系列手机的做工质量和拍照表现获得了消费者的高度评价，在二手市场同样备受追捧。\n\n值得注意的是，华为Mate 60系列的回收价格相比发布初期已经趋于稳定，但仍然保持在较高水平。对于准备换新机的华为用户来说，现在是一个不错的回收时机。建议用户在选择回收平台时，多比较几家平台的报价，选择信誉好、价格合理的平台进行交易。', category: '行业动态', ishot: false, viewCount: 7321, createdAt: '2024-04-18' },
  { id: 5, title: '笔记本电脑回收注意事项', summary: '笔记本电脑回收和手机回收有很大不同...', content: '笔记本电脑回收和手机回收有一些不同之处，需要注意更多细节。\n\n笔记本电脑的回收价值主要取决于以下几个方面：处理器型号和代数、内存容量、硬盘类型和容量、显卡性能、屏幕状况以及电池健康度。一般来说，近三年内发布的商务笔记本和游戏本保值率较高，尤其是ThinkPad、MacBook Pro等知名系列。\n\n在回收笔记本之前，建议做以下准备：1）清理电脑中的个人文件和浏览记录；2）退出所有已登录的账户；3）备份重要的工作文件和软件授权信息；4）恢复系统到出厂状态；5）准备好原始购买凭证，这有助于获得更好的回收价格。', category: '回收攻略', ishot: false, viewCount: 5678, createdAt: '2024-04-15' },
  { id: 6, title: '平板电脑回收市场分析：iPad保值率最高', summary: '平板电脑的回收市场近年来也在快速发展...', content: '平板电脑的回收市场近年来也在快速发展，其中iPad系列一直是最保值的产品线。\n\n根据市场数据，iPad Pro系列的年保值率约为60%-70%，iPad Air系列约为50%-60%，而基础款iPad约为40%-50%。相比之下，安卓平板的保值率普遍较低，通常在30%-40%之间。', category: '行业动态', ishot: false, viewCount: 4521, createdAt: '2024-04-12' },
]

const categories = ['全部', '行业动态', '估价指南', '回收攻略']

export function ArticlePage() {
  const { navigateTo } = useSiteStore()
  const [activeCategory, setActiveCategory] = useState('全部')
  const [search, setSearch] = useState('')

  const filteredArticles = mockArticles.filter(a => {
    const matchCategory = activeCategory === '全部' || a.category === activeCategory
    const matchSearch = !search || a.title.includes(search) || a.summary.includes(search)
    return matchCategory && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">资讯中心</h1>
          <p className="text-emerald-100">了解最新回收资讯和行业动态</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 pb-20">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索文章..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Article list */}
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => navigateTo('article-detail', { articleId: article.id })}
                className="w-full flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="w-24 h-24 md:w-32 md:h-24 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl text-emerald-200 font-bold">{article.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                      {article.category}
                    </Badge>
                    {article.ishot && <Badge className="text-xs bg-red-500 text-white border-none">热门</Badge>}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2 hidden sm:block">{article.summary}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.createdAt}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.viewCount.toLocaleString()}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 self-center group-hover:text-emerald-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ArticleDetailPage({ articleId }: { articleId?: number }) {
  const { navigateTo } = useSiteStore()
  const article = mockArticles.find(a => a.id === (articleId || 1))

  if (!article) return <div className="p-8 text-center text-gray-500">文章不存在</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-white">
          <button onClick={() => navigateTo('article')} className="flex items-center gap-1 text-emerald-100 hover:text-white mb-4 transition-colors">
            ← 返回资讯列表
          </button>
          <Badge className="mb-3 bg-white/20 text-white border-none">{article.category}</Badge>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-emerald-100">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.createdAt}</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{article.viewCount.toLocaleString()} 阅读</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 pb-20">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <div className="prose prose-gray max-w-none">
            {article.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4 text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
