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
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Brand {
  id: number;
  name: string;
}

interface Product {
  id: number;
  productname: string;
  model: string;
  brand_id: number;
  desc_id?: number;
  productprice: number;
  lowestprice: number;
  newprice?: number;
  display: number;
  ishot: number;
  sort: number;
  searchtext?: string;
  brand?: Brand;
  created_at?: string;
}

interface ProductFormData {
  productname: string;
  model: string;
  brand_id: string;
  desc_id: number;
  productprice: string;
  lowestprice: string;
  newprice: string;
  display: boolean;
  ishot: boolean;
  sort: number;
  searchtext: string;
}

const emptyForm: ProductFormData = {
  productname: '', model: '', brand_id: '', desc_id: 0,
  productprice: '', lowestprice: '', newprice: '',
  display: true, ishot: false, sort: 0, searchtext: '',
};

export default function ProductListPage() {
  const [data, setData] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterDisplay, setFilterDisplay] = useState<string>('all');
  const [keyword, setKeyword] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / pageSize);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetchApi('/api/v1/product/brand');
      if (res.code === 0 || res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data?.list || [];
        setBrands(list);
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
      if (filterBrand && filterBrand !== 'all') params.set('brand_id', filterBrand);
      if (filterDisplay && filterDisplay !== 'all') params.set('display', filterDisplay);
      if (keyword.trim()) params.set('keyword', keyword.trim());
      const res = await fetchApi(`/api/v1/product/list?${params.toString()}`);
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
  }, [page, pageSize, filterBrand, filterDisplay, keyword]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);
  useEffect(() => {
    setPage(1);
  }, [filterBrand, filterDisplay, keyword]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const getBrandName = (brandId: number) => {
    const b = brands.find((br) => br.id === brandId);
    return b ? b.name : `#${brandId}`;
  };

  const handleCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (item: Product) => {
    setEditing(item);
    setForm({
      productname: item.productname,
      model: item.model,
      brand_id: String(item.brand_id),
      desc_id: item.desc_id || 0,
      productprice: String(item.productprice),
      lowestprice: String(item.lowestprice),
      newprice: String(item.newprice || ''),
      display: item.display === 1,
      ishot: item.ishot === 1,
      sort: item.sort,
      searchtext: item.searchtext || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: Product) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.productname.trim()) {
      toast({ title: '请输入产品名称', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        productname: form.productname,
        model: form.model,
        brand_id: Number(form.brand_id) || 0,
        desc_id: form.desc_id,
        productprice: Number(form.productprice) || 0,
        lowestprice: Number(form.lowestprice) || 0,
        newprice: Number(form.newprice) || 0,
        display: form.display ? 1 : 0,
        ishot: form.ishot ? 1 : 0,
        sort: form.sort,
        searchtext: form.searchtext,
      };
      const url = editing ? `/api/v1/product/list/${editing.id}` : '/api/v1/product/list';
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
      const res = await fetchApi(`/api/v1/product/list/${deleting.id}`, { method: 'DELETE' });
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>产品列表管理</CardTitle>
              <Button onClick={handleCreate} size="sm">
                <Plus className="mr-1 size-4" /> 新增产品
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="搜索产品名称/型号..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              </div>
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="全部品牌" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部品牌</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDisplay} onValueChange={setFilterDisplay}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="上架状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="1">已上架</SelectItem>
                  <SelectItem value="0">已下架</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>产品名称</TableHead>
                      <TableHead>型号</TableHead>
                      <TableHead>品牌</TableHead>
                      <TableHead className="text-right">回收价</TableHead>
                      <TableHead className="text-right">最低价</TableHead>
                      <TableHead>上架</TableHead>
                      <TableHead>热门</TableHead>
                      <TableHead>排序</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                      </TableRow>
                    ) : (
                      data.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell className="font-medium">{item.productname}</TableCell>
                          <TableCell>{item.model || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getBrandName(item.brand_id)}</Badge>
                          </TableCell>
                          <TableCell className="text-right">¥{Number(item.productprice).toFixed(2)}</TableCell>
                          <TableCell className="text-right">¥{Number(item.lowestprice).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={item.display === 1 ? 'default' : 'outline'}>
                              {item.display === 1 ? '已上架' : '已下架'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.ishot === 1 ? 'default' : 'secondary'}>
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
                {renderPagination()}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑产品' : '新增产品'}</DialogTitle>
            <DialogDescription>{editing ? '修改产品信息' : '创建新的产品'}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto grid gap-4 py-4 pr-1">
            <div className="grid gap-2">
              <Label>产品名称 *</Label>
              <Input value={form.productname} onChange={(e) => setForm({ ...form, productname: e.target.value })} placeholder="请输入产品名称" />
            </div>
            <div className="grid gap-2">
              <Label>型号</Label>
              <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="请输入型号" />
            </div>
            <div className="grid gap-2">
              <Label>品牌</Label>
              <Select value={form.brand_id} onValueChange={(v) => setForm({ ...form, brand_id: v })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="请选择品牌" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>回收价</Label>
                <Input type="number" step="0.01" value={form.productprice} onChange={(e) => setForm({ ...form, productprice: e.target.value })} placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label>最低价</Label>
                <Input type="number" step="0.01" value={form.lowestprice} onChange={(e) => setForm({ ...form, lowestprice: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>新旧价</Label>
              <Input type="number" step="0.01" value={form.newprice} onChange={(e) => setForm({ ...form, newprice: e.target.value })} placeholder="0.00" />
            </div>
            <div className="grid gap-2">
              <Label>排序</Label>
              <Input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} placeholder="0" />
            </div>
            <div className="grid gap-2">
              <Label>搜索关键词</Label>
              <Textarea value={form.searchtext} onChange={(e) => setForm({ ...form, searchtext: e.target.value })} placeholder="用于搜索的关键词" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch checked={form.display} onCheckedChange={(v) => setForm({ ...form, display: v })} />
                <Label>上架</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.ishot} onCheckedChange={(v) => setForm({ ...form, ishot: v })} />
                <Label>热门</Label>
              </div>
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
            <DialogDescription>确定要删除产品「{deleting?.productname}」吗？此操作不可撤销。</DialogDescription>
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
