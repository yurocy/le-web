'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Pencil, RefreshCw, Loader2, Search, Eye } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || '';
const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options?.headers },
  });
  return res.json();
};

interface WebMember {
  id: number;
  username: string;
  tel: string;
  idcard: string;
  pay_method: number;
  city: string;
  openid?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

type FormData = Omit<WebMember, 'id' | 'created_at' | 'updated_at' | 'openid' | 'avatar'>;

const PAY_METHOD_MAP: Record<number, { label: string; className: string }> = {
  0: { label: '未知', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-transparent' },
  1: { label: '微信', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-transparent' },
  2: { label: '支付宝', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-transparent' },
  3: { label: '银行卡', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-transparent' },
};

const emptyForm: FormData = { username: '', tel: '', idcard: '', pay_method: 0, city: '' };

export default function WebMemberPage() {
  const [data, setData] = useState<WebMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<WebMember | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WebMember | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : '';
      const res = await fetchApi(`/api/v1/web/member${params}`);
      setData(res.data || res.list || res || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openEdit = (item: WebMember) => {
    setEditingItem(item);
    setForm({
      username: item.username, tel: item.tel, idcard: item.idcard || '',
      pay_method: item.pay_method, city: item.city || '',
    });
    setDialogOpen(true);
  };

  const openDetail = (item: WebMember) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setSaving(true);
    try {
      await fetchApi(`/api/v1/web/member/${editingItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setDialogOpen(false);
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const maskIdCard = (idcard: string) => {
    if (!idcard || idcard.length < 10) return idcard || '-';
    return idcard.slice(0, 6) + ' **** ' + idcard.slice(-4);
  };

  const maskTel = (tel: string) => {
    if (!tel || tel.length < 7) return tel || '-';
    return tel.slice(0, 3) + ' **** ' + tel.slice(-4);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">会员管理</CardTitle>
            <CardDescription className="mt-1">管理平台注册会员信息</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索手机号/姓名"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                className="pl-9 w-48"
              />
            </div>
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
                  <TableHead>姓名</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>身份证</TableHead>
                  <TableHead className="w-24">收款方式</TableHead>
                  <TableHead>城市</TableHead>
                  <TableHead className="w-36">注册时间</TableHead>
                  <TableHead className="w-28 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="mx-auto size-6 animate-spin" />
                      <p className="mt-2">加载中...</p>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => {
                    const payInfo = PAY_METHOD_MAP[item.pay_method] || PAY_METHOD_MAP[0];
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.avatar && (
                              <img src={item.avatar} alt="" className="size-6 rounded-full object-cover" />
                            )}
                            <span>{item.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.tel}</TableCell>
                        <TableCell className="font-mono text-xs">{maskIdCard(item.idcard)}</TableCell>
                        <TableCell>
                          <Badge className={payInfo.className}>{payInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{item.city || '-'}</TableCell>
                        <TableCell className="text-xs">{formatDate(item.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
                              <Eye className="size-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                              <Pencil className="size-4" />
                              编辑
                            </Button>
                          </div>
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>会员详情</DialogTitle>
            <DialogDescription>会员 #{detailItem?.id}</DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                {detailItem.avatar && (
                  <img src={detailItem.avatar} alt="" className="size-16 rounded-full object-cover border" />
                )}
                <div>
                  <p className="text-lg font-semibold">{detailItem.username}</p>
                  <p className="text-sm text-muted-foreground">{detailItem.tel}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">身份证：</span>
                  <span className="font-mono">{detailItem.idcard || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">手机号：</span>
                  <span>{maskTel(detailItem.tel)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">收款方式：</span>
                  <Badge className={PAY_METHOD_MAP[detailItem.pay_method]?.className}>
                    {PAY_METHOD_MAP[detailItem.pay_method]?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">城市：</span>
                  <span>{detailItem.city || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">注册时间：</span>
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

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑会员信息</DialogTitle>
            <DialogDescription>修改会员 #{editingItem?.id} 的信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">姓名</label>
                <Input
                  placeholder="姓名"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">手机号</label>
                <Input
                  placeholder="手机号"
                  value={form.tel}
                  onChange={(e) => setForm({ ...form, tel: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">身份证</label>
                <Input
                  placeholder="身份证号"
                  value={form.idcard}
                  onChange={(e) => setForm({ ...form, idcard: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">城市</label>
                <Input
                  placeholder="城市"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">收款方式</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                value={form.pay_method}
                onChange={(e) => setForm({ ...form, pay_method: parseInt(e.target.value) || 0 })}
              >
                <option value={0}>未知</option>
                <option value={1}>微信</option>
                <option value={2}>支付宝</option>
                <option value={3}>银行卡</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
