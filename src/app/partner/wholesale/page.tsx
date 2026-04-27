'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Eye, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

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

interface Wholesale {
  id: number;
  type: number;
  contact: string;
  telephone: string;
  company: string;
  description: string;
  created_at: string;
  updated_at?: string;
}

interface PageData {
  list: Wholesale[];
  total: number;
  page: number;
  page_size: number;
}

const TYPE_MAP: Record<number, { label: string; className: string }> = {
  1: { label: '分销采购', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  2: { label: '批量回收', className: 'bg-orange-100 text-orange-700 border-orange-200' },
};

export default function WholesalePage() {
  const [data, setData] = useState<PageData>({ list: [], total: 0, page: 1, page_size: 20 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Wholesale | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const typeParam = typeFilter !== 'all' ? `&type=${typeFilter}` : '';
      const res = await fetchApi(
        `/api/v1/partner/wholesale?page=${page}&page_size=${pageSize}${typeParam}`
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
  }, [page, pageSize, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleViewDetail = (item: Wholesale) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const totalPages = Math.ceil(data.total / pageSize);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">批量回收管理</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground whitespace-nowrap">类型筛选:</span>
              <Select value={typeFilter} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="1">分销采购</SelectItem>
                  <SelectItem value="2">批量回收</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => fetchData()}>
              <RefreshCw className="size-4" />
              刷新
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>联系人</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>公司</TableHead>
                  <TableHead>详细说明</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : data.list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  data.list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={TYPE_MAP[item.type]?.className || ''}
                        >
                          {TYPE_MAP[item.type]?.label || '未知'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.contact}</TableCell>
                      <TableCell>{item.telephone}</TableCell>
                      <TableCell className="max-w-[120px] truncate">{item.company}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                        {item.description || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(item)}>
                          <Eye className="size-3.5" />
                          详情
                        </Button>
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>详细信息</DialogTitle>
            <DialogDescription>查看批量回收/分销采购详细信息</DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">ID</span>
                  <p className="font-medium">{detailItem.id}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">类型</span>
                  <p className="font-medium">
                    <Badge
                      variant="outline"
                      className={TYPE_MAP[detailItem.type]?.className || ''}
                    >
                      {TYPE_MAP[detailItem.type]?.label || '未知'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">联系人</span>
                  <p className="font-medium">{detailItem.contact}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">电话</span>
                  <p className="font-medium">{detailItem.telephone}</p>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-sm text-muted-foreground">公司</span>
                <p className="font-medium">{detailItem.company}</p>
              </div>
              <Separator />
              <div>
                <span className="text-sm text-muted-foreground">详细说明</span>
                <p className="font-medium whitespace-pre-wrap text-sm leading-relaxed">
                  {detailItem.description || '无'}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">提交时间</span>
                  <p className="text-sm">
                    {detailItem.created_at
                      ? new Date(detailItem.created_at).toLocaleString('zh-CN')
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">更新时间</span>
                  <p className="text-sm">
                    {detailItem.updated_at
                      ? new Date(detailItem.updated_at).toLocaleString('zh-CN')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
