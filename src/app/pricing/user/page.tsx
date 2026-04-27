'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Plus, RefreshCw, Loader2, UserCheck, UserX } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || '';
const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options?.headers },
  });
  return res.json();
};

interface PricingUser {
  id: number;
  tel: string;
  username: string;
  company: string;
  legal_person: string;
  status: number;
  created_at?: string;
  updated_at?: string;
}

type FormData = {
  tel: string;
  username: string;
  password: string;
  company: string;
  legal_person: string;
};

const STATUS_MAP: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  0: { label: '待审核', variant: 'secondary' },
  1: { label: '已通过', variant: 'default' },
  2: { label: '已禁用', variant: 'destructive' },
};

export default function PricingUserPage() {
  const [data, setData] = useState<PricingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormData>({ tel: '', username: '', password: '', company: '', legal_person: '' });
  const [saving, setSaving] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; item: PricingUser | null; status: number }>({
    open: false,
    item: null,
    status: 1,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/v1/pricing/user');
      setData(res.data || res.list || res || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setForm({ tel: '', username: '', password: '', company: '', legal_person: '' });
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!form.tel.trim() || !form.password.trim()) return;
    setSaving(true);
    try {
      await fetchApi('/api/v1/pricing/user', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setDialogOpen(false);
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const openStatusDialog = (item: PricingUser, status: number) => {
    setStatusDialog({ open: true, item, status });
  };

  const handleStatusUpdate = async () => {
    if (!statusDialog.item) return;
    try {
      await fetchApi(`/api/v1/pricing/user/${statusDialog.item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: statusDialog.status }),
      });
      setStatusDialog({ open: false, item: null, status: 1 });
      loadData();
    } catch {
      /* handle error */
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">报价用户管理</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              刷新
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              新增用户
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>公司</TableHead>
                  <TableHead>法人</TableHead>
                  <TableHead className="w-24">状态</TableHead>
                  <TableHead className="w-40">注册时间</TableHead>
                  <TableHead className="w-56 text-right">操作</TableHead>
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
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => {
                    const statusInfo = STATUS_MAP[item.status] || STATUS_MAP[0];
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.tel}</TableCell>
                        <TableCell>{item.username}</TableCell>
                        <TableCell className="max-w-32 truncate">{item.company || '-'}</TableCell>
                        <TableCell>{item.legal_person || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(item.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {item.status !== 1 && (
                              <Button variant="ghost" size="sm" className="text-green-600" onClick={() => openStatusDialog(item, 1)}>
                                <UserCheck className="size-4" />
                                通过
                              </Button>
                            )}
                            {item.status !== 2 && (
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => openStatusDialog(item, 2)}>
                                <UserX className="size-4" />
                                禁用
                              </Button>
                            )}
                            {item.status === 2 && (
                              <Button variant="ghost" size="sm" onClick={() => openStatusDialog(item, 0)}>
                                <Pencil className="size-4" />
                                重置
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
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增报价用户</DialogTitle>
            <DialogDescription>创建新的报价系统用户</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">手机号</label>
              <Input
                placeholder="请输入手机号"
                value={form.tel}
                onChange={(e) => setForm({ ...form, tel: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">姓名</label>
              <Input
                placeholder="请输入姓名"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">密码</label>
              <Input
                type="password"
                placeholder="请输入密码"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">公司</label>
              <Input
                placeholder="请输入公司名称"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">法人</label>
              <Input
                placeholder="请输入法人姓名"
                value={form.legal_person}
                onChange={(e) => setForm({ ...form, legal_person: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={saving || !form.tel.trim() || !form.password.trim()}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              创建用户
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog.open} onOpenChange={(open) => setStatusDialog({ ...statusDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更新用户状态</DialogTitle>
            <DialogDescription>
              确认将用户 <strong>{statusDialog.item?.username}</strong> 的状态更改为：
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Badge variant={STATUS_MAP[statusDialog.status]?.variant || 'secondary'} className="text-base px-4 py-1">
              {STATUS_MAP[statusDialog.status]?.label || '未知'}
            </Badge>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog({ ...statusDialog, open: false })}>
              取消
            </Button>
            <Button onClick={handleStatusUpdate}>
              确认更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
