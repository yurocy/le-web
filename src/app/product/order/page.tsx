'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Eye, Pencil } from 'lucide-react';

// ── Types ──────────────────────────────────────────────
interface Order {
  id: number;
  orderno: string;
  productname: string;
  username?: string;
  usertel?: string;
  productprice: number;
  actualprice?: number;
  status: number;
  tradetype?: string;
  expressno?: string;
  actualdesc?: string;
  info?: string;
  address?: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
}

interface OrderEditForm {
  status: number;
  actualdesc: string;
  actualprice: string;
  info: string;
}

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '未提交', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  1: { label: '已受理', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  2: { label: '已发货', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  3: { label: '已签收', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  4: { label: '已检测', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  5: { label: '已接单', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' },
  8: { label: '完成', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  9: { label: '取消', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  10: { label: '已退货', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

const STATUS_OPTIONS = [
  { value: 0, label: '未提交' },
  { value: 1, label: '已受理' },
  { value: 2, label: '已发货' },
  { value: 3, label: '已签收' },
  { value: 4, label: '已检测' },
  { value: 5, label: '已接单' },
  { value: 8, label: '完成' },
  { value: 9, label: '取消' },
  { value: 10, label: '已退货' },
];

const emptyEditForm: OrderEditForm = { status: 0, actualdesc: '', actualprice: '', info: '' };

export default function OrderPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / pageSize);

  // Filters
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dialogs
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<OrderEditForm>(emptyEditForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pagesize', String(pageSize));
      if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
      if (keyword.trim()) params.set('keyword', keyword.trim());
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      const res = await fetchApi(`/api/v1/product/order?${params.toString()}`);
      if (res.code === 0 || res.data) {
        const d = res.data;
        if (Array.isArray(d)) {
          setData(d);
          setTotal(d.length);
        } else {
          setData(d?.list || []);
          setTotal(d?.total || d?.count || 0);
        }
      }
    } catch {
      toast({ title: '加载失败', description: '请检查网络连接', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, selectedStatuses, keyword, dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [selectedStatuses, keyword, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleStatus = (s: number) => {
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s],
    );
  };

  const getStatusBadge = (status: number) => {
    const s = STATUS_MAP[status] || { label: `状态${status}`, color: 'bg-gray-100 text-gray-700' };
    return (
      <Badge className={s.color} variant="outline">
        {s.label}
      </Badge>
    );
  };

  const handleDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status,
      actualdesc: order.actualdesc || '',
      actualprice: String(order.actualprice || ''),
      info: order.info || '',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      const payload = {
        status: editForm.status,
        actualdesc: editForm.actualdesc,
        actualprice: Number(editForm.actualprice) || 0,
        info: editForm.info,
      };
      const res = await fetchApi(`/api/v1/product/order/${selectedOrder.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.code === 0 || res.code === 200) {
        toast({ title: '更新成功' });
        setEditOpen(false);
        fetchData();
      } else {
        toast({ title: '更新失败', description: res.msg || '请重试', variant: 'destructive' });
      }
    } catch {
      toast({ title: '更新失败', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
          {start > 1 && (
            <>
              <PaginationItem><PaginationLink onClick={() => setPage(1)} className="cursor-pointer">1</PaginationLink></PaginationItem>
              {start > 2 && <PaginationItem><span className="px-2 text-muted-foreground">…</span></PaginationItem>}
            </>
          )}
          {pages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">{p}</PaginationLink>
            </PaginationItem>
          ))}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <PaginationItem><span className="px-2 text-muted-foreground">…</span></PaginationItem>}
              <PaginationItem><PaginationLink onClick={() => setPage(totalPages)} className="cursor-pointer">{totalPages}</PaginationLink></PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const formatTime = (t?: string) => {
    if (!t) return '-';
    try {
      return new Date(t).toLocaleString('zh-CN');
    } catch {
      return t;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>订单管理</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-4 flex flex-col gap-4">
              {/* Status multi-select */}
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <Badge
                    key={s.value}
                    variant={selectedStatuses.includes(s.value) ? 'default' : 'outline'}
                    className="cursor-pointer select-none"
                    onClick={() => toggleStatus(s.value)}
                  >
                    {s.label}
                  </Badge>
                ))}
                {selectedStatuses.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedStatuses([])}>
                    清除筛选
                  </Button>
                )}
              </div>
              {/* Search & Date */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="订单号 / 手机号..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="whitespace-nowrap text-sm">日期范围</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
                  <span className="text-muted-foreground">~</span>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>订单号</TableHead>
                        <TableHead>产品名</TableHead>
                        <TableHead>用户</TableHead>
                        <TableHead className="text-right">回收价</TableHead>
                        <TableHead className="text-right">评估价</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>交易方式</TableHead>
                        <TableHead>快递单号</TableHead>
                        <TableHead>下单时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                        </TableRow>
                      ) : (
                        data.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs">{item.orderno}</TableCell>
                            <TableCell className="font-medium max-w-[150px] truncate">{item.productname}</TableCell>
                            <TableCell>
                              <div className="text-sm">{item.username || '-'}</div>
                              <div className="text-xs text-muted-foreground">{item.usertel || ''}</div>
                            </TableCell>
                            <TableCell className="text-right">¥{Number(item.productprice).toFixed(2)}</TableCell>
                            <TableCell className="text-right">¥{Number(item.actualprice || 0).toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>{item.tradetype || '-'}</TableCell>
                            <TableCell className="font-mono text-xs">{item.expressno || '-'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(item.created_at)}</TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => handleDetail(item)} title="详情">
                                <Eye className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="编辑">
                                <Pencil className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {renderPagination()}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>订单号：{selectedOrder?.orderno}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-3 text-sm max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">产品名称</div>
                  <div className="font-medium mt-1">{selectedOrder.productname}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">订单状态</div>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">用户</div>
                  <div className="font-medium mt-1">{selectedOrder.username || '-'}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">手机号</div>
                  <div className="font-medium mt-1">{selectedOrder.usertel || '-'}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">回收价</div>
                  <div className="font-medium mt-1">¥{Number(selectedOrder.productprice).toFixed(2)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">评估价</div>
                  <div className="font-medium mt-1">¥{Number(selectedOrder.actualprice || 0).toFixed(2)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">交易方式</div>
                  <div className="font-medium mt-1">{selectedOrder.tradetype || '-'}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">快递单号</div>
                  <div className="font-medium mt-1 font-mono text-xs">{selectedOrder.expressno || '-'}</div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground">收货地址</div>
                <div className="font-medium mt-1">{selectedOrder.address || '-'}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground">评估描述</div>
                <div className="font-medium mt-1">{selectedOrder.actualdesc || '-'}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground">备注信息</div>
                <div className="font-medium mt-1">{selectedOrder.remark || '-'}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground">内部信息</div>
                <div className="font-medium mt-1">{selectedOrder.info || '-'}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground">下单时间</div>
                <div className="font-medium mt-1 text-xs">{formatTime(selectedOrder.created_at)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>关闭</Button>
            <Button onClick={() => { setDetailOpen(false); if (selectedOrder) handleEdit(selectedOrder); }}>
              <Pencil className="mr-1 size-4" /> 编辑订单
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑订单</DialogTitle>
            <DialogDescription>订单号：{selectedOrder?.orderno}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>订单状态</Label>
              <Select value={String(editForm.status)} onValueChange={(v) => setEditForm({ ...editForm, status: Number(v) })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>评估价</Label>
              <Input type="number" step="0.01" value={editForm.actualprice} onChange={(e) => setEditForm({ ...editForm, actualprice: e.target.value })} placeholder="0.00" />
            </div>
            <div className="grid gap-2">
              <Label>评估描述</Label>
              <Textarea value={editForm.actualdesc} onChange={(e) => setEditForm({ ...editForm, actualdesc: e.target.value })} placeholder="填写评估描述..." />
            </div>
            <div className="grid gap-2">
              <Label>内部信息</Label>
              <Textarea value={editForm.info} onChange={(e) => setEditForm({ ...editForm, info: e.target.value })} placeholder="内部备注信息..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={handleEditSubmit} disabled={submitting}>{submitting ? '保存中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
