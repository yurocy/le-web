'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Search, Pencil, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

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

interface Store {
  id: number;
  username: string;
  usertel: string;
  storename: string;
  address: string;
  srvtime: string;
  discount: number;
  city_id: number;
  city_name?: string;
  info: string;
  status: number;
  created_at: string;
}

interface PageData {
  list: Store[];
  total: number;
  page: number;
  page_size: number;
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: '禁用', className: 'bg-red-100 text-red-700 border-red-200' },
  1: { label: '待审核', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  2: { label: '营业中', className: 'bg-green-100 text-green-700 border-green-200' },
};

const emptyForm = {
  username: '',
  usertel: '',
  storename: '',
  address: '',
  srvtime: '',
  discount: 0,
  city_id: 0,
  info: '',
  status: 1,
};

export default function StorePage() {
  const [data, setData] = useState<PageData>({ list: [], total: 0, page: 1, page_size: 20 });
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(
        `/api/v1/partner/store?page=${page}&page_size=${pageSize}&keyword=${keyword}`
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

  const handleEdit = (item: Store) => {
    setEditing(item);
    setForm({
      username: item.username,
      usertel: item.usertel,
      storename: item.storename,
      address: item.address,
      srvtime: item.srvtime,
      discount: item.discount,
      city_id: item.city_id,
      info: item.info,
      status: item.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.storename || !form.usertel) {
      toast.error('请填写必填字段');
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/partner/store/${editing.id}` : '/api/v1/partner/store';
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

  const handleStatusUpdate = async (id: number, status: number) => {
    try {
      const res = await fetchApi(`/api/v1/partner/store/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.code === 0) {
        toast.success('状态更新成功');
        fetchData();
      } else {
        toast.error(res.msg || '状态更新失败');
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
          <CardTitle className="text-xl">门店管理</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="搜索门店名/联系人/电话..."
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
              新增门店
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>门店名</TableHead>
                  <TableHead>联系人</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>城市</TableHead>
                  <TableHead>营业时间</TableHead>
                  <TableHead>折扣</TableHead>
                  <TableHead>状态</TableHead>
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
                      <TableCell className="font-medium">{item.storename}</TableCell>
                      <TableCell>{item.username}</TableCell>
                      <TableCell>{item.usertel}</TableCell>
                      <TableCell>{item.city_name || item.city_id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                        {item.srvtime || '-'}
                      </TableCell>
                      <TableCell>{item.discount || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_MAP[item.status]?.className || ''}
                        >
                          {STATUS_MAP[item.status]?.label || '未知'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          {item.status === 1 && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleStatusUpdate(item.id, 2)}
                              >
                                <CheckCircle className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleStatusUpdate(item.id, 0)}
                              >
                                <XCircle className="size-3.5" />
                              </Button>
                            </>
                          )}
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑门店' : '新增门店'}</DialogTitle>
            <DialogDescription>
              {editing ? '修改门店信息' : '填写信息创建新的门店'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>联系人</Label>
              <Input
                placeholder="请输入联系人"
                value={form.username}
                onChange={(e) => updateForm('username', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>电话 *</Label>
              <Input
                placeholder="请输入电话"
                value={form.usertel}
                onChange={(e) => updateForm('usertel', e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>门店名 *</Label>
              <Input
                placeholder="请输入门店名称"
                value={form.storename}
                onChange={(e) => updateForm('storename', e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>地址</Label>
              <Input
                placeholder="请输入地址"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>营业时间</Label>
              <Input
                placeholder="如: 09:00-18:00"
                value={form.srvtime}
                onChange={(e) => updateForm('srvtime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>折扣</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="请输入折扣"
                value={form.discount || ''}
                onChange={(e) => updateForm('discount', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>城市ID</Label>
              <Input
                type="number"
                placeholder="请输入城市ID"
                value={form.city_id || ''}
                onChange={(e) => updateForm('city_id', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>简介</Label>
              <Textarea
                placeholder="请输入门店简介"
                value={form.info}
                onChange={(e) => updateForm('info', e.target.value)}
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
