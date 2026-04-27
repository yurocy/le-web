'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Plus, Trash2, RefreshCw, Loader2, Eye } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || '';
const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options?.headers },
  });
  return res.json();
};

interface NewsCategory { id: number; name: string; }

interface NewsArticle {
  id: number;
  title: string;
  info: string;
  content: string;
  category_id: number;
  ishot: number;
  keyword: string;
  category_name?: string;
  created_at?: string;
  updated_at?: string;
}

type FormData = {
  title: string;
  info: string;
  content: string;
  category_id: number;
  ishot: number;
  keyword: string;
};

const emptyForm: FormData = { title: '', info: '', content: '', category_id: 0, ishot: 0, keyword: '' };

export default function ArticleListPage() {
  const [data, setData] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<NewsArticle | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const loadCategories = useCallback(async () => {
    try { const r = await fetchApi('/api/v1/article/category'); setCategories(r.data || r.list || r || []); } catch { setCategories([]); }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterCategory !== 'all' ? `?category_id=${filterCategory}` : '';
      const r = await fetchApi(`/api/v1/article/article${params}`);
      setData(r.data || r.list || r || []);
    } catch { setData([]); } finally { setLoading(false); }
  }, [filterCategory]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => { setEditingItem(null); setForm({ ...emptyForm }); setDialogOpen(true); };

  const openEdit = (item: NewsArticle) => {
    setEditingItem(item);
    setForm({
      title: item.title, info: item.info || '', content: item.content || '',
      category_id: item.category_id, ishot: item.ishot, keyword: item.keyword || '',
    });
    setDialogOpen(true);
  };

  const openDetail = (item: NewsArticle) => { setDetailItem(item); setDetailOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingItem) {
        await fetchApi(`/api/v1/article/article/${editingItem.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await fetchApi('/api/v1/article/article', { method: 'POST', body: JSON.stringify(form) });
      }
      setDialogOpen(false); loadData();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await fetchApi(`/api/v1/article/article/${id}`, { method: 'DELETE' }); setDeleteConfirm(null); loadData(); } catch { /* noop */ }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getCategoryName = (cid: number) => {
    const cat = categories.find((c) => c.id === cid);
    return cat ? cat.name : `分类${cid}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl">文章管理</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-36"><SelectValue placeholder="筛选分类" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              刷新
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              新增文章
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead className="w-20">热门</TableHead>
                  <TableHead>关键词</TableHead>
                  <TableHead className="w-28">发布日期</TableHead>
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
                      <TableCell className="max-w-48 truncate font-medium">{item.title}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                          {item.category_name || getCategoryName(item.category_id)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.ishot === 1 ? (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-transparent">
                            <span className="mr-1">🔥</span>热门
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">普通</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-32 truncate">
                        {item.keyword ? (
                          <div className="flex flex-wrap gap-1">
                            {item.keyword.split(',').map((kw, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{kw.trim()}</Badge>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(item.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
                            <Eye className="size-4" />
                          </Button>
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailItem?.title}</DialogTitle>
            <DialogDescription>
              {detailItem?.category_name || getCategoryName(detailItem?.category_id || 0)}
              {detailItem?.ishot === 1 && ' · 🔥热门'}
              {' · '}{formatDate(detailItem?.created_at)}
            </DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="grid gap-4">
              {detailItem.info && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm text-muted-foreground mb-1">摘要</p>
                  <p className="text-sm">{detailItem.info}</p>
                </div>
              )}
              {detailItem.content && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">正文内容</p>
                  <div className="rounded-md border p-4 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {detailItem.content}
                  </div>
                </div>
              )}
              {detailItem.keyword && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">关键词：</span>
                  <div className="flex flex-wrap gap-1">
                    {detailItem.keyword.split(',').map((kw, i) => (
                      <Badge key={i} variant="outline">{kw.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑文章' : '新增文章'}</DialogTitle>
            <DialogDescription>{editingItem ? '修改文章信息' : '填写新文章信息'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">标题</label>
              <Input placeholder="文章标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">分类</label>
              <Select value={form.category_id ? String(form.category_id) : ''} onValueChange={(v) => setForm({ ...form, category_id: parseInt(v) || 0 })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="选择分类" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">摘要</label>
              <Input placeholder="文章摘要" value={form.info} onChange={(e) => setForm({ ...form, info: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">关键词</label>
              <Input placeholder="多个关键词用逗号分隔" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">正文内容</label>
              <Textarea placeholder="文章正文内容" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">设为热门</label>
              <Switch checked={form.ishot === 1} onCheckedChange={(checked) => setForm({ ...form, ishot: checked ? 1 : 0 })} />
              <span className="text-sm text-muted-foreground">{form.ishot === 1 ? '热门文章' : '普通文章'}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>取消</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingItem ? '保存修改' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
