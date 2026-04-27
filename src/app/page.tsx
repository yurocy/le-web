'use client'

import { useEffect, useState } from 'react'
import {
  Package,
  Users,
  Warehouse,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts'
import { AdminLayout } from '@/components/layout/admin-layout'

// ==================== Types ====================
interface SummaryData {
  todayOrders: number
  totalUsers: number
  totalInventory: number
  monthProfit: number
  todayOrdersChange: number
  totalUsersChange: number
  totalInventoryChange: number
  monthProfitChange: number
}

interface OrderItem {
  id: string
  productName: string
  phone: string
  price: number
  status: OrderStatus
  createdAt: string
}

type OrderStatus =
  | '未提交'
  | '已受理'
  | '已发货'
  | '已签收'
  | '已检测'
  | '完成交易'
  | '订单取消'

// ==================== Mock Data ====================
const mockSummary: SummaryData = {
  todayOrders: 128,
  totalUsers: 15842,
  totalInventory: 3256,
  monthProfit: 286750,
  todayOrdersChange: 12.5,
  totalUsersChange: 8.3,
  totalInventoryChange: -2.1,
  monthProfitChange: 15.7,
}

// Generate 30 days of order data
function generateOrderTrend() {
  const data: { date: string; orders: number; revenue: number }[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    data.push({
      date: `${month}-${day}`,
      orders: Math.floor(Math.random() * 80) + 60,
      revenue: Math.floor(Math.random() * 15000) + 8000,
    })
  }
  return data
}

const orderTrendData = generateOrderTrend()

const recyclingMethodData = [
  { method: '邮寄', value: 42, fill: 'var(--color-mail)' },
  { method: '上门', value: 35, fill: 'var(--color-visit)' },
  { method: '到店', value: 23, fill: 'var(--color-store)' },
]

const mockOrders: OrderItem[] = [
  {
    id: 'ORD20240427001',
    productName: 'iPhone 15 Pro Max 256GB',
    phone: '138****5521',
    price: 4580,
    status: '完成交易',
    createdAt: '2024-04-27 14:32:00',
  },
  {
    id: 'ORD20240427002',
    productName: '华为 Mate 60 Pro 512GB',
    phone: '139****8832',
    price: 3850,
    status: '已检测',
    createdAt: '2024-04-27 13:18:00',
  },
  {
    id: 'ORD20240427003',
    productName: '小米 14 Ultra 16+512GB',
    phone: '186****2210',
    price: 2920,
    status: '已签收',
    createdAt: '2024-04-27 12:05:00',
  },
  {
    id: 'ORD20240427004',
    productName: 'iPhone 14 128GB',
    phone: '155****7743',
    price: 2180,
    status: '已发货',
    createdAt: '2024-04-27 11:45:00',
  },
  {
    id: 'ORD20240427005',
    productName: 'OPPO Find X7 Ultra 16+256GB',
    phone: '177****0091',
    price: 2650,
    status: '已受理',
    createdAt: '2024-04-27 10:22:00',
  },
  {
    id: 'ORD20240427006',
    productName: '三星 Galaxy S24 Ultra',
    phone: '132****4456',
    price: 3200,
    status: '未提交',
    createdAt: '2024-04-27 09:58:00',
  },
  {
    id: 'ORD20240427007',
    productName: 'vivo X100 Pro 16+512GB',
    phone: '188****3327',
    price: 2780,
    status: '完成交易',
    createdAt: '2024-04-27 09:15:00',
  },
  {
    id: 'ORD20240427008',
    productName: 'iPhone 13 128GB',
    phone: '159****6618',
    price: 1580,
    status: '订单取消',
    createdAt: '2024-04-27 08:42:00',
  },
  {
    id: 'ORD20240427009',
    productName: '一加 12 16+256GB',
    phone: '136****9904',
    price: 2350,
    status: '完成交易',
    createdAt: '2024-04-27 08:10:00',
  },
  {
    id: 'ORD20240427010',
    productName: '荣耀 Magic6 至臻版',
    phone: '182****1155',
    price: 3100,
    status: '已检测',
    createdAt: '2024-04-27 07:35:00',
  },
]

// ==================== Chart Config ====================
const orderTrendConfig = {
  orders: {
    label: '订单数',
    color: 'var(--chart-1)',
  },
  revenue: {
    label: '营收 (元)',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

const pieChartConfig = {
  mail: {
    label: '邮寄',
    color: 'hsl(142, 71%, 45%)',
  },
  visit: {
    label: '上门',
    color: 'hsl(217, 91%, 60%)',
  },
  store: {
    label: '到店',
    color: 'hsl(43, 96%, 56%)',
  },
} satisfies ChartConfig

// ==================== Status helpers ====================
const statusColorMap: Record<OrderStatus, string> = {
  '未提交': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  '已受理': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  '已发货': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  '已签收': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  '已检测': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  '完成交易': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  '订单取消': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="secondary" className={statusColorMap[status]}>
      {status}
    </Badge>
  )
}

// ==================== API functions (mock, easily switchable) ====================
async function fetchSummaryData(): Promise<SummaryData> {
  return mockSummary
}

async function fetchOrderTrend(): Promise<typeof orderTrendData> {
  return orderTrendData
}

async function fetchRecyclingMethods(): Promise<typeof recyclingMethodData> {
  return recyclingMethodData
}

async function fetchRecentOrders(): Promise<OrderItem[]> {
  return mockOrders
}

// ==================== Components ====================
function SummaryCard({
  title,
  value,
  change,
  icon: Icon,
  prefix = '',
  suffix = '',
}: {
  title: string
  value: number
  change: number
  icon: React.ComponentType<{ className?: string }>
  prefix?: string
  suffix?: string
}) {
  const isPositive = change >= 0

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {prefix}
              {value.toLocaleString()}
              {suffix}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-muted-foreground">较昨日</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [orderTrend, setOrderTrend] = useState<typeof orderTrendData>([])
  const [recyclingMethods, setRecyclingMethods] = useState<typeof recyclingMethodData>([])
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [summaryData, trendData, methodData, ordersData] = await Promise.all([
          fetchSummaryData(),
          fetchOrderTrend(),
          fetchRecyclingMethods(),
          fetchRecentOrders(),
        ])
        setSummary(summaryData)
        setOrderTrend(trendData)
        setRecyclingMethods(methodData)
        setRecentOrders(ordersData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm">加载中...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">工作台</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              欢迎回来，以下是今日的运营概况
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Badge variant="outline" className="gap-1 font-normal">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              系统运行正常
            </Badge>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="今日订单"
            value={summary?.todayOrders ?? 0}
            change={summary?.todayOrdersChange ?? 0}
            icon={Package}
          />
          <SummaryCard
            title="总用户数"
            value={summary?.totalUsers ?? 0}
            change={summary?.totalUsersChange ?? 0}
            icon={Users}
          />
          <SummaryCard
            title="库存总数"
            value={summary?.totalInventory ?? 0}
            change={summary?.totalInventoryChange ?? 0}
            icon={Warehouse}
          />
          <SummaryCard
            title="本月利润"
            value={summary?.monthProfit ?? 0}
            change={summary?.monthProfitChange ?? 0}
            icon={DollarSign}
            prefix="¥"
          />
        </div>

        {/* Charts section */}
        <div className="grid gap-4 lg:grid-cols-7">
          {/* Line chart - Order trend */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-base font-semibold">近30天订单趋势</CardTitle>
              <CardDescription>每日订单数量与营收金额</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={orderTrendConfig} className="h-[320px] w-full">
                <LineChart data={orderTrend} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="orders"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="revenue"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 10000).toFixed(0)}w`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(label) => `${label}`}
                        formatter={(value, name) => {
                          if (name === 'revenue') {
                            return [`¥${Number(value).toLocaleString()}`, '营收']
                          }
                          return [value, '订单数']
                        }}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--color-orders)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie chart - Recycling method distribution */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">回收方式分布</CardTitle>
              <CardDescription>用户选择的不同回收方式占比</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ChartContainer config={pieChartConfig} className="h-[320px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="method" hideLabel />} />
                  <Pie
                    data={recyclingMethods}
                    dataKey="value"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {recyclingMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="method" />}
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent orders table */}
        <Card>
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">最近订单</CardTitle>
              <CardDescription>最近提交的 10 个回收订单</CardDescription>
            </div>
            <Badge variant="outline" className="w-fit font-normal">
              共 {recentOrders.length} 条记录
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">订单号</TableHead>
                    <TableHead className="font-semibold">产品名称</TableHead>
                    <TableHead className="font-semibold">手机号</TableHead>
                    <TableHead className="font-semibold text-right">回收价</TableHead>
                    <TableHead className="font-semibold">状态</TableHead>
                    <TableHead className="font-semibold">下单时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {order.id}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {order.productName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.phone}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        ¥{order.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {order.createdAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
