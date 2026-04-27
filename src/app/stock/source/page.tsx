'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Phone, UserCircle } from 'lucide-react';

interface StockSource {
  id: number;
  name: string;
  contact?: string;
  usertel?: string;
  info?: string;
  created_at?: string;
  updated_at?: string;
}

interface SourceFormData {
  name: string;
  contact: string;
  usertel: string;
  info: string;
}

const emptyForm: SourceFormData = { name: '', contact: '', usertel: '', info: '' };

export default function StockSourcePage() {
  const [data, setData] = useState<StockSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<StockSource | null>(null);
  const [deleting, setDeleting] = useState<StockSource | null>(null);
  const [form, setForm] = useState<SourceFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/v1/stock/user');
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

  const handleCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (item: StockSource) => {
    setEditing(item);
    setForm({
      name: item.name,
      contact: item.contact || '',
      usertel: item.usertel || '',
      info: item.info || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: StockSource) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: '请输入来源名称', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        contact: form.contact,
        usertel: form.usertel,
        info: form.info,
      };
      const url = editing ? `/api/v1/stock/user/${editing.id}` : '/api/v1/stock/user';
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
      const res = await fetchApi(`/api/v1/stock/user/${deleting.id}`, { method: 'DELETE' });
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
              <CardTitle>收货来源管理</CardTitle>
              <Button onClick={handleCreate} size="sm">
                <Plus className="mr-1 size-4" /> 新增来源
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
                    <TableHead>名称</TableHead>
                    <TableHead>联系人</TableHead>
                    <TableHead>电话</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCircle className="size-4 text-muted-foreground" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.contact || '-'}</TableCell>
                        <TableCell>
                          {item.usertel ? (
                            <div className="flex items-center gap-1">
                              <Phone className="size-3 text-muted-foreground" />
                              <span className="font-mono text-sm">{item.usertel}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                          {item.info || '-'}
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
            <DialogTitle>{editing ? '编辑来源' : '新增来源'}</DialogTitle>
            <DialogDescription>{editing ? '修改收货来源信息' : '创建新的收货来源'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>名称 *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="请输入来源名称" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>联系人</Label>
                <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="联系人姓名" />
              </div>
              <div className="grid gap-2">
                <Label>电话</Label>
                <Input value={form.usertel} onChange={(e) => setForm({ ...form, usertel: e.target.value })} placeholder="联系电话" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>备注信息</Label>
              <Textarea value={form.info} onChange={(e) => setForm({ ...form, info: e.target.value })} placeholder="备注信息..." />
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
            <DialogDescription>确定要删除来源「{deleting?.name}」吗？此操作不可撤销。</DialogDescription>
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
