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

interface SaleCustomer {
  id: number;
  company: string;
  username: string;
  contact: string;
  usertel: string;
  city: string;
  address: string;
  bank: string;
  bname: string;
  bnum: string;
  deposit: number;
  validity: string;
  status: number;
  created_at: string;
}

interface PageData {
  list: SaleCustomer[];
  total: number;
  page: number;
  page_size: number;
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: '禁用', className: 'bg-red-100 text-red-700 border-red-200' },
  1: { label: '待审核', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  2: { label: '正常', className: 'bg-green-100 text-green-700 border-green-200' },
};

const emptyForm = {
  company: '',
  username: '',
  password: '',
  contact: '',
  usertel: '',
  city: '',
  address: '',
  bank: '',
  bname: '',
  bnum: '',
  deposit: 0,
  validity: '',
};

export default function SaleCustomerPage() {
  const [data, setData] = useState<PageData>({ list: [], total: 0, page: 1, page_size: 20 });
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SaleCustomer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(
        `/api/v1/sale/user?page=${page}&page_size=${pageSize}&keyword=${keyword}`
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

  const handleEdit = (item: SaleCustomer) => {
    setEditing(item);
    setForm({
      company: item.company,
      username: item.username,
      password: '',
      contact: item.contact,
      usertel: item.usertel,
      city: item.city,
      address: item.address,
      bank: item.bank,
      bname: item.bname,
      bnum: item.bnum,
      deposit: item.deposit,
      validity: item.validity,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.username || !form.company) {
      toast.error('请填写必填字段');
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/sale/user/${editing.id}` : '/api/v1/sale/user';
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
    if (!confirm('确定要删除此客户吗？')) return;
    try {
      const res = await fetchApi(`/api/v1/sale/user/${id}`, {
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
          <CardTitle className="text-xl">分销客户管理</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="搜索公司名称/账号/联系人..."
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
              新增客户
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>公司名称</TableHead>
                  <TableHead>账号</TableHead>
                  <TableHead>联系人</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>城市</TableHead>
                  <TableHead>保证金</TableHead>
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
                      <TableCell className="font-medium">{item.company}</TableCell>
                      <TableCell>{item.username}</TableCell>
                      <TableCell>{item.contact}</TableCell>
                      <TableCell>{item.usertel}</TableCell>
                      <TableCell>{item.city || '-'}</TableCell>
                      <TableCell className="font-medium">¥{item.deposit?.toFixed(2)}</TableCell>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑客户' : '新增客户'}</DialogTitle>
            <DialogDescription>
              {editing ? '修改分销客户信息' : '填写信息创建新的分销客户'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>公司名称 *</Label>
              <Input
                placeholder="请输入公司名称"
                value={form.company}
                onChange={(e) => updateForm('company', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>账号 *</Label>
              <Input
                placeholder="请输入账号"
                value={form.username}
                onChange={(e) => updateForm('username', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{editing ? '密码（留空不修改）' : '密码'}</Label>
              <Input
                type="password"
                placeholder="请输入密码"
                value={form.password}
                onChange={(e) => updateForm('password', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>联系人</Label>
              <Input
                placeholder="请输入联系人"
                value={form.contact}
                onChange={(e) => updateForm('contact', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>电话</Label>
              <Input
                placeholder="请输入电话"
                value={form.usertel}
                onChange={(e) => updateForm('usertel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>城市</Label>
              <Input
                placeholder="请输入城市"
                value={form.city}
                onChange={(e) => updateForm('city', e.target.value)}
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
              <Label>开户银行</Label>
              <Input
                placeholder="请输入开户银行"
                value={form.bank}
                onChange={(e) => updateForm('bank', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>户名</Label>
              <Input
                placeholder="请输入户名"
                value={form.bname}
                onChange={(e) => updateForm('bname', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>账号</Label>
              <Input
                placeholder="请输入银行账号"
                value={form.bnum}
                onChange={(e) => updateForm('bnum', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>保证金</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="请输入保证金"
                value={form.deposit || ''}
                onChange={(e) => updateForm('deposit', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>有效期</Label>
              <Input
                type="date"
                value={form.validity}
                onChange={(e) => updateForm('validity', e.target.value)}
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
