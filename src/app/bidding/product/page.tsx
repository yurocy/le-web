'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

interface BiddingCategory { id: number; name: string; }
interface BiddingBrand { id: number; name: string; }

interface BiddingProduct {
  id: number;
  title: string;
  category_id: number;
  ctype_id: number;
  brand_id: number;
  sn: string;
  imei: string;
  grade: number;
  amount: number;
  price: number;
  status: number;
  endtime: string;
  parts: string;
  info: string;
  category_name?: string;
  ctype_name?: string;
  brand_name?: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  img6?: string;
  img7?: string;
  img8?: string;
  created_at?: string;
}

type FormData = {
  title: string;
  category_id: number;
  ctype_id: number;
  brand_id: number;
  sn: string;
  imei: string;
  grade: number;
  amount: number;
  price: number;
  status: number;
  endtime: string;
  parts: string;
  info: string;
};

const GRADE_MAP: Record<number, { label: string; className: string }> = {
  1: { label: 'S', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  2: { label: 'A', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  3: { label: 'B', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
};

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: '待审核', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  1: { label: '进行中', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  2: { label: '已结束', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

const emptyForm: FormData = {
  title: '', category_id: 0, ctype_id: 0, brand_id: 0,
  sn: '', imei: '', grade: 1, amount: 1, price: 0,
  status: 0, endtime: '', parts: '', info: '',
};

export default function BiddingProductPage() {
  const [data, setData] = useState<BiddingProduct[]>([]);
  const [categories, setCategories] = useState<BiddingCategory[]>([]);
  const [brands, setBrands] = useState<BiddingBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<BiddingProduct | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BiddingProduct | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadCategories = useCallback(async () => {
    try { const r = await fetchApi('/api/v1/bidding/category'); setCategories(r.data || r.list || r || []); } catch { setCategories([]); }
  }, []);
  const loadBrands = useCallback(async () => {
    try { const r = await fetchApi('/api/v1/bidding/brand'); setBrands(r.data || r.list || r || []); } catch { setBrands([]); }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.set('category_id', filterCategory);
      if (filterBrand !== 'all') params.set('brand_id', filterBrand);
      if (filterGrade !== 'all') params.set('grade', filterGrade);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const r = await fetchApi(`/api/v1/bidding/product${qs}`);
      setData(r.data || r.list || r || []);
    } catch { setData([]); } finally { setLoading(false); }
  }, [filterCategory, filterBrand, filterGrade, filterStatus]);

  useEffect(() => { loadCategories(); loadBrands(); }, [loadCategories, loadBrands]);
  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => { setEditingItem(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (item: BiddingProduct) => {
    setEditingItem(item);
    setForm({
      title: item.title, category_id: item.category_id, ctype_id: item.ctype_id,
      brand_id: item.brand_id, sn: item.sn || '', imei: item.imei || '',
      grade: item.grade, amount: item.amount, price: item.price,
      status: item.status, endtime: item.endtime || '', parts: item.parts || '', info: item.info || '',
    });
    setDialogOpen(true);
  };
  const openDetail = (item: BiddingProduct) => { setDetailItem(item); setDetailOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingItem) {
        await fetchApi(`/api/v1/bidding/product/${editingItem.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await fetchApi('/api/v1/bidding/product', { method: 'POST', body: JSON.stringify(form) });
      }
      setDialogOpen(false); loadData();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await fetchApi(`/api/v1/bidding/product/${id}`, { method: 'DELETE' }); setDeleteConfirm(null); loadData(); } catch { /* noop */ }
  };

  const inspectionImages = (item: BiddingProduct) => {
    return [item.img1, item.img2, item.img3, item.img4, item.img5, item.img6, item.img7, item.img8].filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">竞拍商品管理</CardTitle>
            <CardDescription className="mt-1">管理所有竞拍商品，包括成色、价格和状态</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-28"><SelectValue placeholder="分类" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger className="w-28"><SelectValue placeholder="品牌" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {brands.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-24"><SelectValue placeholder="成色" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="1">S</SelectItem>
                <SelectItem value="2">A</SelectItem>
                <SelectItem value="3">B</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-28"><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="0">待审核</SelectItem>
                <SelectItem value="1">进行中</SelectItem>
                <SelectItem value="2">已结束</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="size-4" /> 新增</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">ID</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>品牌</TableHead>
                  <TableHead>类别</TableHead>
                  <TableHead>成色</TableHead>
                  <TableHead className="w-16">数量</TableHead>
                  <TableHead className="w-20">起拍价</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-36">结束时间</TableHead>
                  <TableHead className="w-40 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={10} className="h-32 text-center"><Loader2 className="mx-auto size-6 animate-spin" /></TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="h-32 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : data.map((item) => {
                  const grade = GRADE_MAP[item.grade] || GRADE_MAP[3];
                  const status = STATUS_MAP[item.status] || STATUS_MAP[0];
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell className="max-w-36 truncate">{item.title}</TableCell>
                      <TableCell><span className="text-xs">{item.brand_name || `品牌${item.brand_id}`}</span></TableCell>
                      <TableCell><span className="text-xs">{item.category_name || `分类${item.category_id}`}</span></TableCell>
                      <TableCell><span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${grade.className}`}>{grade.label}</span></TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>¥{item.price}</TableCell>
                      <TableCell><span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span></TableCell>
                      <TableCell className="text-xs">{item.endtime ? new Date(item.endtime).toLocaleString('zh-CN') : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(item)}><Eye className="size-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="size-4" /></Button>
                          {deleteConfirm === item.id ? (
                            <div className="flex gap-1">
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>确认</Button>
                              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>取消</Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteConfirm(item.id)}><Trash2 className="size-4" /></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailItem?.title}</DialogTitle>
            <DialogDescription>商品详情</DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-muted-foreground">品牌：</span>{detailItem.brand_name || `品牌${detailItem.brand_id}`}</div>
                <div><span className="font-medium text-muted-foreground">类别：</span>{detailItem.category_name || `分类${detailItem.category_id}`}</div>
                <div><span className="font-medium text-muted-foreground">SN：</span>{detailItem.sn || '-'}</div>
                <div><span className="font-medium text-muted-foreground">IMEI：</span>{detailItem.imei || '-'}</div>
                <div><span className="font-medium text-muted-foreground">成色：</span>
                  <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${GRADE_MAP[detailItem.grade]?.className}`}>{GRADE_MAP[detailItem.grade]?.label}</span>
                </div>
                <div><span className="font-medium text-muted-foreground">数量：</span>{detailItem.amount}</div>
                <div><span className="font-medium text-muted-foreground">起拍价：</span>¥{detailItem.price}</div>
                <div><span className="font-medium text-muted-foreground">状态：</span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_MAP[detailItem.status]?.className}`}>{STATUS_MAP[detailItem.status]?.label}</span>
                </div>
                <div><span className="font-medium text-muted-foreground">结束时间：</span>{detailItem.endtime ? new Date(detailItem.endtime).toLocaleString('zh-CN') : '-'}</div>
              </div>
              {detailItem.parts && (
                <div className="text-sm"><span className="font-medium text-muted-foreground">配件：</span>{detailItem.parts}</div>
              )}
              {detailItem.info && (
                <div className="text-sm"><span className="font-medium text-muted-foreground">说明：</span>{detailItem.info}</div>
              )}
              {inspectionImages(detailItem).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">验机图片</p>
                  <div className="grid grid-cols-4 gap-2">
                    {inspectionImages(detailItem).map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-md border overflow-hidden bg-muted">
                        <img src={img} alt={`验机图${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑商品' : '新增商品'}</DialogTitle>
            <DialogDescription>{editingItem ? '修改竞拍商品信息' : '填写新竞拍商品信息'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">标题</label>
              <Input placeholder="商品标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">分类</label>
                <Select value={form.category_id ? String(form.category_id) : ''} onValueChange={(v) => setForm({ ...form, category_id: parseInt(v) || 0 })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="选择分类" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">类型</label>
                <Select value={form.ctype_id ? String(form.ctype_id) : ''} onValueChange={(v) => setForm({ ...form, ctype_id: parseInt(v) || 0 })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="选择类型" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">品牌</label>
                <Select value={form.brand_id ? String(form.brand_id) : ''} onValueChange={(v) => setForm({ ...form, brand_id: parseInt(v) || 0 })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="选择品牌" /></SelectTrigger>
                  <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">成色</label>
                <Select value={String(form.grade)} onValueChange={(v) => setForm({ ...form, grade: parseInt(v) || 1 })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">S - 极好</SelectItem>
                    <SelectItem value="2">A - 良好</SelectItem>
                    <SelectItem value="3">B - 一般</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">SN</label>
                <Input placeholder="序列号" value={form.sn} onChange={(e) => setForm({ ...form, sn: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">IMEI</label>
                <Input placeholder="IMEI号" value={form.imei} onChange={(e) => setForm({ ...form, imei: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">数量</label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">起拍价</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">状态</label>
                <Select value={String(form.status)} onValueChange={(v) => setForm({ ...form, status: parseInt(v) || 0 })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">待审核</SelectItem>
                    <SelectItem value="1">进行中</SelectItem>
                    <SelectItem value="2">已结束</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">结束时间</label>
                <Input type="datetime-local" value={form.endtime ? form.endtime.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, endtime: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">配件</label>
              <Input placeholder="配件信息" value={form.parts} onChange={(e) => setForm({ ...form, parts: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">说明</label>
              <Textarea placeholder="商品说明" value={form.info} onChange={(e) => setForm({ ...form, info: e.target.value })} rows={3} />
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
