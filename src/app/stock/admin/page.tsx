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
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Shield, ShieldCheck, User } from 'lucide-react';

interface AdminUser {
  id: number;
  name: string;
  usertel: string;
  role: number;
  created_at?: string;
}

interface AdminFormData {
  name: string;
  usertel: string;
  password: string;
  role: string;
}

const ROLE_MAP: Record<number, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  0: { label: '普通用户', variant: 'secondary' },
  1: { label: '管理员', variant: 'default' },
  2: { label: '超级管理员', variant: 'default' },
};

const ROLE_OPTIONS = [
  { value: '0', label: '普通用户' },
  { value: '1', label: '管理员' },
  { value: '2', label: '超级管理员' },
];

const emptyForm: AdminFormData = { name: '', usertel: '', password: '', role: '0' };

export default function StockAdminPage() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<AdminFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/v1/stock/admin');
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
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleDelete = (item: AdminUser) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: '请输入名称', variant: 'destructive' });
      return;
    }
    if (!form.usertel.trim()) {
      toast({ title: '请输入账号', variant: 'destructive' });
      return;
    }
    if (!form.password.trim()) {
      toast({ title: '请输入密码', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        usertel: form.usertel,
        password: form.password,
        role: Number(form.role),
      };
      const res = await fetchApi('/api/v1/stock/admin', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.code === 0 || res.code === 200) {
        toast({ title: '创建成功' });
        setDialogOpen(false);
        fetchData();
      } else {
        toast({ title: '创建失败', description: res.msg || '请重试', variant: 'destructive' });
      }
    } catch {
      toast({ title: '创建失败', description: '请检查网络连接', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      const res = await fetchApi(`/api/v1/stock/admin/${deleting.id}`, { method: 'DELETE' });
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

  const getRoleIcon = (role: number) => {
    if (role >= 2) return <ShieldCheck className="size-4 text-yellow-600" />;
    if (role === 1) return <Shield className="size-4 text-blue-600" />;
    return <User className="size-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>库存管理员</CardTitle>
              <Button onClick={handleCreate} size="sm">
                <Plus className="mr-1 size-4" /> 新增管理员
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
                    <TableHead>账号</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-mono text-sm">{item.usertel}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(item.role)}
                            <Badge variant={ROLE_MAP[item.role]?.variant || 'outline'}>
                              {ROLE_MAP[item.role]?.label || `角色${item.role}`}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
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

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增管理员</DialogTitle>
            <DialogDescription>创建新的库存管理员账号</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>名称 *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="请输入名称" />
            </div>
            <div className="grid gap-2">
              <Label>账号（手机号）*</Label>
              <Input value={form.usertel} onChange={(e) => setForm({ ...form, usertel: e.target.value })} placeholder="请输入手机号" />
            </div>
            <div className="grid gap-2">
              <Label>密码 *</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="请输入密码" />
            </div>
            <div className="grid gap-2">
              <Label>角色</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? '创建中...' : '创建'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>确定要删除管理员「{deleting?.name}」吗？此操作不可撤销。</DialogDescription>
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
