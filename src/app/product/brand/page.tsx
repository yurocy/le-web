'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
  type_id: number;
  logo?: string;
  ishot: number;
  sort: number;
  created_at?: string;
}

interface BrandFormData {
  name: string;
  type_id: string;
  sort: number;
  ishot: boolean;
}

const emptyForm: BrandFormData = { name: '', type_id: '', sort: 0, ishot: false };

export default function BrandPage() {
  const [data, setData] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState<Brand | null>(null);
  const [form, setForm] = useState<BrandFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetchApi('/api/v1/product/category');
      if (res.code === 0 || res.data) {
        setCategories(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory && filterCategory !== 'all') {
        params.set('category_id', filterCategory);
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetchApi(`/api/v1/product/brand${query}`);
      if (res.code === 0 || res.data) {
        setData(Array.isArray(res.data) ? res.data : res.data?.list || []);
      }
    } catch {
      toast({ title: '加载失败', description: '请检查网络连接', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCategoryName = (typeId: number) => {
    const cat = categories.find((c) => c.id === typeId);
    return cat ? cat.name : `#${typeId}`;
  };

  const handleCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (item: Brand) => {
    setEditing(item);
    setForm({ name: item.name, type_id: String(item.type_id), sort: item.sort, ishot: item.ishot === 1 });
    setDialogOpen(true);
  };

  const handleDelete = (item: Brand) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: '请输入品牌名称', variant: 'destructive' });
      return;
    }
    if (!form.type_id) {
      toast({ title: '请选择分类', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, type_id: Number(form.type_id), ishot: form.ishot ? 1 : 0 };
      const url = editing
        ? `/api/v1/product/brand/${editing.id}`
        : '/api/v1/product/brand';
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
      const res = await fetchApi(`/api/v1/product/brand/${deleting.id}`, { method: 'DELETE' });
      if (res.code === 0 || res.code === 200) {
        toast({ title: '删除成功' });
        setDeleteOpen(false);
        fetchData();
      } else {
        toast({ title: '删除失败', description: res.msg || '请重试', variant: 'destructive' });
      }
    } catch {
      toast({ title: '删除失败', description: '请检查网络连接', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>品牌管理</CardTitle>
              <div className="flex items-center gap-3">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="全部分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleCreate} size="sm">
                  <Plus className="mr-1 size-4" /> 新增品牌
                </Button>
              </div>
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
                    <TableHead>品牌名称</TableHead>
                    <TableHead>类别</TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>热门</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getCategoryName(item.type_id)}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.logo ? (
                            <img src={item.logo} alt={item.name} className="size-10 rounded object-cover" />
                          ) : (
                            <span className="text-muted-foreground">无Logo</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.ishot === 1 ? 'default' : 'outline'}>
                            {item.ishot === 1 ? '热门' : '普通'}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.sort}</TableCell>
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
            <DialogTitle>{editing ? '编辑品牌' : '新增品牌'}</DialogTitle>
            <DialogDescription>{editing ? '修改品牌信息' : '创建新的品牌'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bname">品牌名称</Label>
              <Input id="bname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="请输入品牌名称" />
            </div>
            <div className="grid gap-2">
              <Label>所属分类</Label>
              <Select value={form.type_id} onValueChange={(v) => setForm({ ...form, type_id: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bsort">排序</Label>
              <Input id="bsort" type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} placeholder="0" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.ishot} onCheckedChange={(v) => setForm({ ...form, ishot: v })} />
              <Label>设为热门品牌</Label>
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
            <DialogDescription>确定要删除品牌「{deleting?.name}」吗？此操作不可撤销。</DialogDescription>
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
