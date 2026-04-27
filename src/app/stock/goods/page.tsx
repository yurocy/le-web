'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, Pencil, Trash2, Search, Package, TrendingUp, DollarSign, ShoppingCart, AlertCircle } from 'lucide-react';

// ── Types ──────────────────────────────────────────────
interface GoodsItem {
  id: number;
  code?: string;
  model?: string;
  sn?: string;
  buyprice: number;
  assessprice: number;
  saleprice: number;
  outprice: number;
  profit: number;
  agent_id?: number;
  agent_name?: string;
  status: number; // 0=未出货, 1=已出货, 2=无应付
  pay_price?: number;
  receivedate?: string;
  outdate?: string;
  created_at?: string;
  remark?: string;
}

interface GoodsFormData {
  code: string;
  model: string;
  sn: string;
  buyprice: string;
  assessprice: string;
  saleprice: string;
  outprice: string;
  profit: string;
  agent_id: string;
  status: string;
  pay_price: string;
  receivedate: string;
  remark: string;
}

interface Statistics {
  total: number;
  instock: number;
  outstock: number;
  total_profit: number;
  total_pay: number;
}

interface StockAgent {
  id: number;
  name: string;
}

const STATUS_MAP: Record<number, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  0: { label: '未出货', variant: 'secondary' },
  1: { label: '已出货', variant: 'default' },
  2: { label: '无应付', variant: 'outline' },
};

const emptyForm: GoodsFormData = {
  code: '', model: '', sn: '', buyprice: '', assessprice: '',
  saleprice: '', outprice: '', profit: '', agent_id: '', status: '0',
  pay_price: '', receivedate: '', remark: '',
};

export default function StockGoodsPage() {
  const [data, setData] = useState<GoodsItem[]>([]);
  const [agents, setAgents] = useState<StockAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics>({ total: 0, instock: 0, outstock: 0, total_profit: 0, total_pay: 0 });

  // Filters
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / pageSize);

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<GoodsItem | null>(null);
  const [deleting, setDeleting] = useState<GoodsItem | null>(null);
  const [form, setForm] = useState<GoodsFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetchApi('/api/v1/stock/admin');
      if (res.code === 0 || res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data?.list || [];
        setAgents(list);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await fetchApi('/api/v1/stock/statistics');
      if (res.code === 0 || res.data) {
        setStatistics(res.data);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pagesize', String(pageSize));
      if (filterAgent && filterAgent !== 'all') params.set('agent_id', filterAgent);
      if (filterStatus && filterStatus !== 'all') params.set('status', filterStatus);
      if (keyword.trim()) params.set('keyword', keyword.trim());
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      const res = await fetchApi(`/api/v1/stock/goods?${params.toString()}`);
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
  }, [page, pageSize, filterAgent, filterStatus, keyword, dateFrom, dateTo]);

  useEffect(() => { fetchAgents(); fetchStatistics(); }, [fetchAgents, fetchStatistics]);
  useEffect(() => { setPage(1); }, [filterAgent, filterStatus, keyword, dateFrom, dateTo]);
  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto calculate profit
  const calculatedProfit = useMemo(() => {
    const out = Number(form.outprice) || 0;
    const sale = Number(form.saleprice) || 0;
    return (out - sale).toFixed(2);
  }, [form.outprice, form.saleprice]);

  const handleCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (item: GoodsItem) => {
    setEditing(item);
    setForm({
      code: item.code || '',
      model: item.model || '',
      sn: item.sn || '',
      buyprice: String(item.buyprice),
      assessprice: String(item.assessprice),
      saleprice: String(item.saleprice),
      outprice: String(item.outprice),
      profit: String(item.profit),
      agent_id: String(item.agent_id || ''),
      status: String(item.status),
      pay_price: String(item.pay_price || ''),
      receivedate: item.receivedate ? item.receivedate.split('T')[0] : '',
      remark: item.remark || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: GoodsItem) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        code: form.code,
        model: form.model,
        sn: form.sn,
        buyprice: Number(form.buyprice) || 0,
        assessprice: Number(form.assessprice) || 0,
        saleprice: Number(form.saleprice) || 0,
        outprice: Number(form.outprice) || 0,
        profit: Number(calculatedProfit) || 0,
        agent_id: Number(form.agent_id) || 0,
        status: Number(form.status),
        pay_price: Number(form.pay_price) || 0,
        receivedate: form.receivedate || '',
        remark: form.remark,
      };
      const url = editing ? `/api/v1/stock/goods/${editing.id}` : '/api/v1/stock/goods';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetchApi(url, { method, body: JSON.stringify(payload) });
      if (res.code === 0 || res.code === 200) {
        toast({ title: editing ? '更新成功' : '创建成功' });
        setDialogOpen(false);
        fetchData();
        fetchStatistics();
      } else {
        toast({ title: '操作失败', description: res.msg || '请重试', variant: 'destructive' });
      }
    } catch {
      toast({ title: '操作失败', description: '请检查网络连接', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      const res = await fetchApi(`/api/v1/stock/goods/${deleting.id}`, { method: 'DELETE' });
      if (res.code === 0 || res.code === 200) {
        toast({ title: '删除成功' });
        setDeleteOpen(false);
        fetchData();
        fetchStatistics();
      } else {
        toast({ title: '删除失败', description: res.msg || '请重试', variant: 'destructive' });
      }
    } catch {
      toast({ title: '删除失败', variant: 'destructive' });
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
          {pages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">{p}</PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const formatDate = (t?: string) => {
    if (!t) return '-';
    try { return new Date(t).toLocaleDateString('zh-CN'); } catch { return t; }
  };

  const statCards = [
    { label: '总库存', value: statistics.total, icon: Package, color: 'text-blue-600' },
    { label: '在库数量', value: statistics.instock, icon: ShoppingCart, color: 'text-green-600' },
    { label: '已出货', value: statistics.outstock, icon: TrendingUp, color: 'text-orange-600' },
    { label: '总利润', value: `¥${Number(statistics.total_profit).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600' },
    { label: '总应付', value: `¥${Number(statistics.total_pay).toFixed(2)}`, icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((s) => (
            <Card key={s.label} className="py-4">
              <CardContent className="flex items-center gap-3 px-4 py-0">
                <div className={`rounded-lg bg-muted p-2 ${s.color}`}>
                  <s.icon className="size-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-lg font-bold">{s.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>库存商品管理</CardTitle>
              <Button onClick={handleCreate} size="sm">
                <Plus className="mr-1 size-4" /> 新增商品
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="搜索编号/型号/串码..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              </div>
              <Select value={filterAgent} onValueChange={setFilterAgent}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="全部来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部来源</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="0">未出货</SelectItem>
                  <SelectItem value="1">已出货</SelectItem>
                  <SelectItem value="2">无应付</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[140px]" />
                <span className="text-muted-foreground">~</span>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[140px]" />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>编号</TableHead>
                        <TableHead>型号</TableHead>
                        <TableHead>串码</TableHead>
                        <TableHead className="text-right">下单价</TableHead>
                        <TableHead className="text-right">评估价</TableHead>
                        <TableHead className="text-right">成交价</TableHead>
                        <TableHead className="text-right">出货价</TableHead>
                        <TableHead className="text-right">利润</TableHead>
                        <TableHead>收货日期</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                        </TableRow>
                      ) : (
                        data.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell className="font-mono text-xs">{item.code || '-'}</TableCell>
                            <TableCell className="text-sm">{item.model || '-'}</TableCell>
                            <TableCell className="font-mono text-xs">{item.sn || '-'}</TableCell>
                            <TableCell className="text-right">¥{Number(item.buyprice).toFixed(2)}</TableCell>
                            <TableCell className="text-right">¥{Number(item.assessprice).toFixed(2)}</TableCell>
                            <TableCell className="text-right">¥{Number(item.saleprice).toFixed(2)}</TableCell>
                            <TableCell className="text-right">¥{Number(item.outprice).toFixed(2)}</TableCell>
                            <TableCell className={`text-right font-medium ${Number(item.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ¥{Number(item.profit).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{formatDate(item.receivedate)}</TableCell>
                            <TableCell>
                              <Badge variant={STATUS_MAP[item.status]?.variant || 'outline'}>
                                {STATUS_MAP[item.status]?.label || `状态${item.status}`}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                <Pencil className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item)}>
                                <Trash2 className="size-4" />
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑商品' : '新增商品'}</DialogTitle>
            <DialogDescription>{editing ? '修改商品信息' : '创建新的库存商品'}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto grid gap-4 py-4 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>编号</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="商品编号" />
              </div>
              <div className="grid gap-2">
                <Label>型号</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="产品型号" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>串码</Label>
              <Input value={form.sn} onChange={(e) => setForm({ ...form, sn: e.target.value })} placeholder="设备串码" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>下单价</Label>
                <Input type="number" step="0.01" value={form.buyprice} onChange={(e) => setForm({ ...form, buyprice: e.target.value })} placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label>评估价</Label>
                <Input type="number" step="0.01" value={form.assessprice} onChange={(e) => setForm({ ...form, assessprice: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>成交价</Label>
                <Input type="number" step="0.01" value={form.saleprice} onChange={(e) => setForm({ ...form, saleprice: e.target.value })} placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label>出货价</Label>
                <Input type="number" step="0.01" value={form.outprice} onChange={(e) => setForm({ ...form, outprice: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>利润 (自动计算)</Label>
                <Input type="text" value={calculatedProfit} readOnly className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label>应付金额</Label>
                <Input type="number" step="0.01" value={form.pay_price} onChange={(e) => setForm({ ...form, pay_price: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>来源</Label>
                <Select value={form.agent_id} onValueChange={(v) => setForm({ ...form, agent_id: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="请选择来源" /></SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>状态</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">未出货</SelectItem>
                    <SelectItem value="1">已出货</SelectItem>
                    <SelectItem value="2">无应付</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>收货日期</Label>
              <Input type="date" value={form.receivedate} onChange={(e) => setForm({ ...form, receivedate: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>备注</Label>
              <Input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} placeholder="备注信息" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? '提交中...' : '确定'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>确定要删除该库存商品吗？此操作不可撤销。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={submitting}>{submitting ? '删除中...' : '确认删除'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
