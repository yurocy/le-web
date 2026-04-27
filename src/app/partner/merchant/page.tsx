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

interface Merchant {
  id: number;
  username: string;
  contact: string;
  usertel: string;
  password?: string;
  company: string;
  city_id: number;
  city_name?: string;
  role: number;
  address: string;
  ratio: number;
  discount: number;
  info: string;
  status: number;
  created_at: string;
}

interface PageData {
  list: Merchant[];
  total: number;
  page: number;
  page_size: number;
}

const ROLE_MAP: Record<number, string> = {
  2: '商家',
  3: '门店',
};

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: '禁用', className: 'bg-red-100 text-red-700 border-red-200' },
  1: { label: '待审核', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  2: { label: '审核通过', className: 'bg-green-100 text-green-700 border-green-200' },
};

const emptyForm = {
  username: '',
  contact: '',
  usertel: '',
  password: '',
  company: '',
  city_id: 0,
  role: 2,
  address: '',
  ratio: 0,
  discount: 0,
  info: '',
};

export default function MerchantPage() {
  const [data, setData] = useState<PageData>({ list: [], total: 0, page: 1, page_size: 20 });
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Merchant | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(
        `/api/v1/partner/list?page=${page}&page_size=${pageSize}&keyword=${keyword}`
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

  const handleEdit = (item: Merchant) => {
    setEditing(item);
    setForm({
      username: item.username,
      contact: item.contact,
      usertel: item.usertel,
      password: '',
      company: item.company,
      city_id: item.city_id,
      role: item.role,
      address: item.address,
      ratio: item.ratio,
      discount: item.discount,
      info: item.info,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.username || !form.contact || !form.usertel) {
      toast.error('请填写必填字段');
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/partner/list/${editing.id}` : '/api/v1/partner/list';
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
      const res = await fetchApi(`/api/v1/partner/list/${id}/status`, {
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
          <CardTitle className="text-xl">商家/门店管理</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="搜索商家名称/联系人/手机号..."
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
              新增商家
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>商家名称</TableHead>
                  <TableHead>联系人</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>城市</TableHead>
                  <TableHead>类别</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>注册时间</TableHead>
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
                      <TableCell className="font-medium">{item.username}</TableCell>
                      <TableCell>{item.contact}</TableCell>
                      <TableCell>{item.usertel}</TableCell>
                      <TableCell>{item.city_name || item.city_id}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ROLE_MAP[item.role] || '未知'}
                        </Badge>
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
            <DialogTitle>{editing ? '编辑商家' : '新增商家'}</DialogTitle>
            <DialogDescription>
              {editing ? '修改商家/门店信息' : '填写信息创建新的商家或门店'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>名称 *</Label>
              <Input
                placeholder="请输入商家/门店名称"
                value={form.username}
                onChange={(e) => updateForm('username', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>联系人 *</Label>
              <Input
                placeholder="请输入联系人"
                value={form.contact}
                onChange={(e) => updateForm('contact', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>手机号 *</Label>
              <Input
                placeholder="请输入手机号"
                value={form.usertel}
                onChange={(e) => updateForm('usertel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{editing ? '密码（留空不修改）' : '密码 *'}</Label>
              <Input
                type="password"
                placeholder="请输入密码"
                value={form.password}
                onChange={(e) => updateForm('password', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>公司</Label>
              <Input
                placeholder="请输入公司名称"
                value={form.company}
                onChange={(e) => updateForm('company', e.target.value)}
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
            <div className="space-y-2">
              <Label>类别 *</Label>
              <Select
                value={String(form.role)}
                onValueChange={(val) => updateForm('role', Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">商家</SelectItem>
                  <SelectItem value="3">门店</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>地址</Label>
              <Input
                placeholder="请输入地址"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>分成比例</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="请输入分成比例"
                value={form.ratio || ''}
                onChange={(e) => updateForm('ratio', Number(e.target.value))}
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
            <div className="space-y-2 sm:col-span-2">
              <Label>简介</Label>
              <Textarea
                placeholder="请输入商家简介"
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
