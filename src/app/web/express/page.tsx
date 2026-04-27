'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Pencil, Plus, Trash2, RefreshCw, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || '';
const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options?.headers },
  });
  return res.json();
};

interface WebExpress {
  id: number;
  name: string;
  code: string;
  phone: string;
  logo: string;
  sort: number;
  status: number;
  created_at?: string;
}

type FormData = Omit<WebExpress, 'id' | 'created_at'>;

const emptyForm: FormData = { name: '', code: '', phone: '', logo: '', sort: 0, status: 1 };

export default function WebExpressPage() {
  const [data, setData] = useState<WebExpress[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WebExpress | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/v1/web/express');
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
    setEditingItem(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (item: WebExpress) => {
    setEditingItem(item);
    setForm({
      name: item.name, code: item.code || '', phone: item.phone || '',
      logo: item.logo || '', sort: item.sort, status: item.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingItem) {
        await fetchApi(`/api/v1/web/express/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await fetchApi('/api/v1/web/express', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      setDialogOpen(false);
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetchApi(`/api/v1/web/express/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      loadData();
    } catch {
      /* handle error */
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">快递公司管理</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              刷新
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              新增快递公司
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>公司名称</TableHead>
                  <TableHead>编码</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead className="w-20">排序</TableHead>
                  <TableHead className="w-20">状态</TableHead>
                  <TableHead className="w-48 text-right">操作</TableHead>
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
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.logo && (
                            <img src={item.logo} alt={item.name} className="size-6 rounded object-contain" />
                          )}
                          <span>{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                          {item.code || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{item.phone || '-'}</TableCell>
                      <TableCell>{item.sort}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          item.status === 1
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {item.status === 1 ? '启用' : '禁用'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                            <Pencil className="size-4" />
                            编辑
                          </Button>
                          {deleteConfirm === item.id ? (
                            <div className="flex items-center gap-1">
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>确认</Button>
                              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>取消</Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteConfirm(item.id)}>
                              <Trash2 className="size-4" />
                              删除
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑快递公司' : '新增快递公司'}</DialogTitle>
            <DialogDescription>{editingItem ? '修改快递公司信息' : '填写新快递公司信息'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">公司名称</label>
                <Input placeholder="快递公司名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">编码</label>
                <Input placeholder="快递编码（如SF、ZTO）" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">电话</label>
                <Input placeholder="客服电话" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Logo URL</label>
                <Input placeholder="Logo图片链接" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">排序</label>
                <Input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">状态</label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: parseInt(e.target.value) || 0 })}
                >
                  <option value={1}>启用</option>
                  <option value={0}>禁用</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>取消</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingItem ? '保存修改' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
