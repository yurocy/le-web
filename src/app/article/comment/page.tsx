'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Loader2, Star } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || '';
const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options?.headers },
  });
  return res.json();
};

interface Comment {
  id: number;
  type: number;
  score: number;
  content: string;
  tel: string;
  ip: string;
  order_id?: number;
  agent_id?: number;
  created_at?: string;
}

const TYPE_MAP: Record<number, { label: string; className: string }> = {
  0: { label: '订单', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-transparent' },
  1: { label: '代理', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-transparent' },
};

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${star <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">({score})</span>
    </div>
  );
}

export default function ArticleCommentPage() {
  const [data, setData] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [detailItem, setDetailItem] = useState<Comment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = typeFilter !== 'all' ? `?type=${typeFilter}` : '';
      const r = await fetchApi(`/api/v1/article/comment${params}`);
      setData(r.data || r.list || r || []);
    } catch { setData([]); } finally { setLoading(false); }
  }, [typeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    try { await fetchApi(`/api/v1/article/comment/${id}`, { method: 'DELETE' }); setDeleteConfirm(null); loadData(); } catch { /* noop */ }
  };

  const openDetail = (item: Comment) => { setDetailItem(item); setDetailOpen(true); };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">评论管理</CardTitle>
          <div className="flex gap-2">
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">全部类型</option>
              <option value="0">订单评论</option>
              <option value="1">代理评论</option>
            </select>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead className="w-20">类型</TableHead>
                  <TableHead className="w-32">评分</TableHead>
                  <TableHead>内容</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead className="w-32">IP</TableHead>
                  <TableHead className="w-36">时间</TableHead>
                  <TableHead className="w-28 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="mx-auto size-6 animate-spin" />
                      <p className="mt-2">加载中...</p>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => {
                    const typeInfo = TYPE_MAP[item.type] || TYPE_MAP[0];
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <Badge className={typeInfo.className}>{typeInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <StarRating score={item.score} />
                        </TableCell>
                        <TableCell
                          className="max-w-48 truncate cursor-pointer hover:text-primary"
                          onClick={() => openDetail(item)}
                          title={item.content}
                        >
                          {item.content}
                        </TableCell>
                        <TableCell className="text-xs">{item.tel || '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{item.ip || '-'}</TableCell>
                        <TableCell className="text-xs">{formatDate(item.created_at)}</TableCell>
                        <TableCell className="text-right">
                          {deleteConfirm === item.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>确认</Button>
                              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>取消</Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteConfirm(item.id)}>
                              <Trash2 className="size-4" />
                              删除
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>评论详情</DialogTitle>
            <DialogDescription>评论 #{detailItem?.id}</DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">类型：</span>
                  <Badge className={TYPE_MAP[detailItem.type]?.className}>{TYPE_MAP[detailItem.type]?.label}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">评分：</span>
                  <StarRating score={detailItem.score} />
                </div>
                <div>
                  <span className="text-muted-foreground">手机号：</span>
                  <span>{detailItem.tel || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">IP地址：</span>
                  <span className="font-mono">{detailItem.ip || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">时间：</span>
                  <span>{formatDate(detailItem.created_at)}</span>
                </div>
                {detailItem.order_id && (
                  <div>
                    <span className="text-muted-foreground">关联订单：</span>
                    <span>#{detailItem.order_id}</span>
                  </div>
                )}
                {detailItem.agent_id && (
                  <div>
                    <span className="text-muted-foreground">关联代理：</span>
                    <span>#{detailItem.agent_id}</span>
                  </div>
                )}
              </div>
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm text-muted-foreground mb-1">评论内容</p>
                <p className="text-sm whitespace-pre-wrap">{detailItem.content}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
