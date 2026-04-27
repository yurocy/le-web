'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Search, Pencil, ChevronLeft, ChevronRight, RefreshCw, Trash2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || '';
const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });
  return res.json();
};

interface SaleGoods {
  id: number;
  brand_id: number;
  brand_name?: string;
  productname: string;
  amount: number;
  level_id: number;
  level_name?: string;
  desc: string;
  status: number;
  created_at: string;
}

interface PageData {
  list: SaleGoods[];
  total: number;
  page: number;
  page_size: number;
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: '下架', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  1: { label: '竞价中', className: 'bg-green-100 text-green-700 border-green-200' },
};

const emptyForm = {
  brand_id: 0,
  productname: '',
  amount: 0,
  level_id: 0,
  desc: '',
  status: 1,
};

export default function SaleGoodsPage() {
  const [data, setData] = useState<PageData>({ list: [], total: 0, page: 1, page_size: 20 });
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SaleGoods | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(
        `/api/v1/sale/goods?page=${page}&page_size=${pageSize}&keyword=${keyword}`
      );
      if (res.code === 0) {
        setData(res.data);
      } else {
        toast.error(res.msg || '获取数据失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (item: SaleGoods) => {
    setEditing(item);
    setForm({
      brand_id: item.brand_id,
      productname: item.productname,
      amount: item.amount,
      level_id: item.level_id,
      desc: item.desc,
      status: item.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.productname) {
      toast.error('请填写产品名称');
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/sale/goods/${editing.id}` : '/api/v1/sale/goods';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetchApi(url, {
        method,
        body: JSON.stringify(form),
      });
      if (res.code === 0) {
        toast.success(editing ? '更新成功' : '创建成功');
        setDialogOpen(false);
        fetchData();
      } else {
        toast.error(res.msg || '操作失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此商品吗？')) return;
    try {
      const res = await fetchApi(`/api/v1/sale/goods/${id}`, {
        method: 'DELETE',
      });
      if (res.code === 0) {
        toast.success('删除成功');
        fetchData();
      } else {
        toast.error(res.msg || '删除失败');
      }
    } catch {
      toast.error('网络错误');
    }
  };

  const totalPages = Math.ceil(data.total / pageSize);

  const updateForm = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">分销商品管理</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="搜索产品名称/品牌..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="size-4" />
                搜索
              </Button>
              <Button variant="outline" onClick={() => { setKeyword(''); setPage(1); }}>
                <RefreshCw className="size-4" />
              </Button>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="size-4" />
              新增商品
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>产品名称</TableHead>
                  <TableHead>品牌</TableHead>
                  <TableHead>等级</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>添加时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : data.list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  data.list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell className="font-medium">{item.productname}</TableCell>
                      <TableCell>{item.brand_name || item.brand_id || '-'}</TableCell>
                      <TableCell>{item.level_name || item.level_id || '-'}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                        {item.desc || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_MAP[item.status]?.className || ''}
                        >
                          {STATUS_MAP[item.status]?.label || '未知'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                共 {data.total} 条，第 {page}/{totalPages} 页
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑商品' : '新增商品'}</DialogTitle>
            <DialogDescription>
              {editing ? '修改分销商品信息' : '填写信息创建新的分销商品'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>产品名称 *</Label>
              <Input
                placeholder="请输入产品名称"
                value={form.productname}
                onChange={(e) => updateForm('productname', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>品牌ID</Label>
                <Input
                  type="number"
                  placeholder="请输入品牌ID"
                  value={form.brand_id || ''}
                  onChange={(e) => updateForm('brand_id', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>等级ID</Label>
                <Input
                  type="number"
                  placeholder="请输入等级ID"
                  value={form.level_id || ''}
                  onChange={(e) => updateForm('level_id', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>数量</Label>
                <Input
                  type="number"
                  placeholder="请输入数量"
                  value={form.amount || ''}
                  onChange={(e) => updateForm('amount', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={String(form.status)}
                  onValueChange={(val) => updateForm('status', Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">下架</SelectItem>
                    <SelectItem value="1">竞价中</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                placeholder="请输入商品描述"
                value={form.desc}
                onChange={(e) => updateForm('desc', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '提交中...' : '确定'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
