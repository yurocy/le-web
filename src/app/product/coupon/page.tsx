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
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Coupon {
  id: number;
  title: string;
  addprice: number;
  minprice: number;
  expiretime: string;
  status: number;
  created_at?: string;
  updated_at?: string;
}

interface CouponFormData {
  title: string;
  addprice: string;
  minprice: string;
  expiretime: string;
  status: boolean;
}

const emptyForm: CouponFormData = { title: '', addprice: '', minprice: '', expiretime: '', status: true };

export default function CouponPage() {
  const [data, setData] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/v1/product/coupon');
      if (res.code === 0 || res.data) {
        setData(Array.isArray(res.data) ? res.data : res.data?.list || []);
      }
    } catch {
      toast({ title: '加载失败', description: '请检查网络连接', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (t: string) => {
    if (!t) return '-';
    try {
      return new Date(t).toLocaleDateString('zh-CN');
    } catch {
      return t;
    }
  };

  const handleCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (item: Coupon) => {
    setEditing(item);
    setForm({
      title: item.title,
      addprice: String(item.addprice),
      minprice: String(item.minprice),
      expiretime: item.expiretime ? item.expiretime.split('T')[0] : '',
      status: item.status === 1,
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: Coupon) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: '请输入优惠券标题', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        addprice: Number(form.addprice) || 0,
        minprice: Number(form.minprice) || 0,
        expiretime: form.expiretime ? new Date(form.expiretime).toISOString() : '',
        status: form.status ? 1 : 0,
      };
      const url = editing ? `/api/v1/product/coupon/${editing.id}` : '/api/v1/product/coupon';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetchApi(url, { method, body: JSON.stringify(payload) });
      if (res.code === 0 || res.code === 200) {
        toast({ title: editing ? '更新成功' : '创建成功' });
        setDialogOpen(false);
        fetchData();
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
      const res = await fetchApi(`/api/v1/product/coupon/${deleting.id}`, { method: 'DELETE' });
      if (res.code === 0 || res.code === 200) {
        toast({ title: '删除成功' });
        setDeleteOpen(false);
        fetchData();
      } else {
        toast({ title: '删除失败', description: res.msg || '请重试', variant: 'destructive' });
      }
    } catch {
      toast({ title: '删除失败', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>优惠券管理</CardTitle>
              <Button onClick={handleCreate} size="sm">
                <Plus className="mr-1 size-4" /> 新增优惠券
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead className="text-right">加价金额</TableHead>
                    <TableHead className="text-right">最低价格</TableHead>
                    <TableHead>过期时间</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="text-right text-green-600 dark:text-green-400">
                          +¥{Number(item.addprice).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">¥{Number(item.minprice).toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(item.expiretime)}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 1 ? 'default' : 'secondary'}>
                            {item.status === 1 ? '启用' : '禁用'}
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑优惠券' : '新增优惠券'}</DialogTitle>
            <DialogDescription>{editing ? '修改优惠券信息' : '创建新的优惠券'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>标题 *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="请输入优惠券标题" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>加价金额</Label>
                <Input type="number" step="0.01" value={form.addprice} onChange={(e) => setForm({ ...form, addprice: e.target.value })} placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label>最低价格</Label>
                <Input type="number" step="0.01" value={form.minprice} onChange={(e) => setForm({ ...form, minprice: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>过期时间</Label>
              <Input type="date" value={form.expiretime} onChange={(e) => setForm({ ...form, expiretime: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} className="rounded border-gray-300" id="coupon-status" />
              <Label htmlFor="coupon-status">启用</Label>
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
            <DialogDescription>确定要删除优惠券「{deleting?.title}」吗？此操作不可撤销。</DialogDescription>
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
