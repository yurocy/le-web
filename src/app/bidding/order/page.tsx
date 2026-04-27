'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, Eye } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || '';
const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options?.headers },
  });
  return res.json();
};

interface BiddingOrder {
  id: number;
  user_id: number;
  product_id: number;
  price: number;
  status: number;
  user_name?: string;
  user_tel?: string;
  product_title?: string;
  created_at?: string;
  updated_at?: string;
}

const STATUS_MAP: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  0: { label: '待支付', variant: 'outline' },
  1: { label: '已支付', variant: 'default' },
  2: { label: '已发货', variant: 'secondary' },
  3: { label: '已完成', variant: 'default' },
  4: { label: '已取消', variant: 'destructive' },
};

export default function BiddingOrderPage() {
  const [data, setData] = useState<BiddingOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<BiddingOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await fetchApi(`/api/v1/bidding/order${params}`);
      setData(res.data || res.list || res || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const openDetail = (item: BiddingOrder) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">竞拍订单管理</CardTitle>
          <div className="flex gap-2">
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="0">待支付</option>
              <option value="1">已支付</option>
              <option value="2">已发货</option>
              <option value="3">已完成</option>
              <option value="4">已取消</option>
            </select>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>商品</TableHead>
                  <TableHead className="w-24">价格</TableHead>
                  <TableHead className="w-24">状态</TableHead>
                  <TableHead className="w-40">时间</TableHead>
                  <TableHead className="w-20 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="mx-auto size-6 animate-spin" />
                      <p className="mt-2">加载中...</p>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => {
                    const statusInfo = STATUS_MAP[item.status] || STATUS_MAP[0];
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{item.user_name || `用户${item.user_id}`}</p>
                            {item.user_tel && <p className="text-xs text-muted-foreground">{item.user_tel}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-48 truncate">{item.product_title || `商品${item.product_id}`}</TableCell>
                        <TableCell className="font-medium text-red-600">¥{item.price}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(item.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>订单 #{detailItem?.id}</DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">订单ID：</span>
                  <span className="font-medium">{detailItem.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">状态：</span>
                  <Badge variant={STATUS_MAP[detailItem.status]?.variant}>
                    {STATUS_MAP[detailItem.status]?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">用户：</span>
                  <span>{detailItem.user_name || `用户${detailItem.user_id}`}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">手机：</span>
                  <span>{detailItem.user_tel || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">商品：</span>
                  <span>{detailItem.product_title || `商品${detailItem.product_id}`}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">成交价：</span>
                  <span className="text-lg font-bold text-red-600">¥{detailItem.price}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">下单时间：</span>
                  <span>{formatDate(detailItem.created_at)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">更新时间：</span>
                  <span>{formatDate(detailItem.updated_at)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
