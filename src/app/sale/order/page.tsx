'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, RefreshCw, Eye } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || '';
const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });
  return res.json();
};

interface SaleOrder {
  id: number;
  goods_name: string;
  customer_name: string;
  bid_amount: number;
  success_amount: number;
  price: number;
  status: number;
  created_at: string;
  updated_at?: string;
}

interface PageData {
  list: SaleOrder[];
  total: number;
  page: number;
  page_size: number;
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: '已取消', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  1: { label: '已报价', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  2: { label: '竞价成功', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  3: { label: '竞价失败', className: 'bg-red-100 text-red-700 border-red-200' },
  4: { label: '已付款', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  5: { label: '已发货', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  6: { label: '已收货', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  7: { label: '已收款', className: 'bg-green-100 text-green-700 border-green-200' },
  9: { label: '交易完成', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: '0', label: '已取消' },
  { value: '1', label: '已报价' },
  { value: '2', label: '竞价成功' },
  { value: '3', label: '竞价失败' },
  { value: '4', label: '已付款' },
  { value: '5', label: '已发货' },
  { value: '6', label: '已收货' },
  { value: '7', label: '已收款' },
  { value: '9', label: '交易完成' },
];

export default function SaleOrderPage() {
  const [data, setData] = useState<PageData>({ list: [], total: 0, page: 1, page_size: 20 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const res = await fetchApi(
        `/api/v1/sale/order?page=${page}&page_size=${pageSize}${statusParam}`
      );
      if (res.code === 0) {
        setData(res.data);
      } else {
        toast.error(res.msg || '获取数据失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleStatusUpdate = async (id: number, status: number) => {
    try {
      const res = await fetchApi(`/api/v1/sale/order/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.code === 0) {
        toast.success('状态更新成功');
        fetchData();
      } else {
        toast.error(res.msg || '状态更新失败');
      }
    } catch {
      toast.error('网络错误');
    }
  };

  const totalPages = Math.ceil(data.total / pageSize);

  const getNextStatus = (currentStatus: number): number | null => {
    const flow: Record<number, number | null> = {
      1: 2,
      2: 4,
      4: 5,
      5: 6,
      6: 7,
      7: 9,
    };
    return flow[currentStatus] ?? null;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">分销订单管理</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground whitespace-nowrap">状态筛选:</span>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => fetchData()}>
              <RefreshCw className="size-4" />
              刷新
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>商品</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>竞价数量</TableHead>
                  <TableHead>成功数量</TableHead>
                  <TableHead>价格</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : data.list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  data.list.map((item) => {
                    const nextStatus = getNextStatus(item.status);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="font-medium">{item.goods_name}</TableCell>
                        <TableCell>{item.customer_name}</TableCell>
                        <TableCell>{item.bid_amount}</TableCell>
                        <TableCell>{item.success_amount || 0}</TableCell>
                        <TableCell className="font-medium">¥{item.price?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={STATUS_MAP[item.status]?.className || ''}
                          >
                            {STATUS_MAP[item.status]?.label || '未知'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString('zh-CN')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="size-3.5" />
                            </Button>
                            {nextStatus !== null && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleStatusUpdate(item.id, nextStatus)}
                              >
                                {STATUS_MAP[nextStatus]?.label}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                共 {data.total} 条，第 {page}/{totalPages} 页
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Status Legend */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">状态流转说明</h4>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.filter((s) => s.value !== 'all').map((opt) => (
                <Badge
                  key={opt.value}
                  variant="outline"
                  className={STATUS_MAP[Number(opt.value)]?.className || ''}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              流程: 已报价 → 竞价成功 → 已付款 → 已发货 → 已收货 → 已收款 → 交易完成
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
