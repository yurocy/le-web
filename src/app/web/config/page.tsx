'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, RefreshCw } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || '';
const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options?.headers },
  });
  return res.json();
};

interface WebConfig {
  id?: number;
  webname: string;
  url: string;
  address: string;
  webtitle: string;
  webdesc: string;
  webkey: string;
  copyright: string;
  record: string;
  covered_city: string;
  award: string;
}

const emptyConfig: WebConfig = {
  webname: '', url: '', address: '', webtitle: '',
  webdesc: '', webkey: '', copyright: '', record: '',
  covered_city: '', award: '',
};

export default function WebConfigPage() {
  const [config, setConfig] = useState<WebConfig>({ ...emptyConfig });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/v1/web/config');
      const data = res.data || res;
      if (data && typeof data === 'object') {
        setConfig({ ...emptyConfig, ...data });
      }
    } catch {
      setConfig({ ...emptyConfig });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetchApi('/api/v1/web/config', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
      if (res.code === 0 || res.success || res.ok) {
        setMessage({ type: 'success', text: '配置保存成功' });
      } else {
        setMessage({ type: 'error', text: res.msg || res.message || '保存失败' });
      }
    } catch {
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateField = (field: keyof WebConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">网站配置</CardTitle>
              <CardDescription className="mt-1">管理系统基本信息和全局配置</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadConfig} disabled={saving}>
                <RefreshCw className="size-4" />
                重置
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                保存配置
              </Button>
            </div>
          </div>
          {message && (
            <div className={`mt-3 rounded-md px-4 py-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
              {message.text}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 pb-2 border-b">基本信息</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">网站名称</label>
                  <Input
                    placeholder="网站名称"
                    value={config.webname}
                    onChange={(e) => updateField('webname', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">网站URL</label>
                  <Input
                    placeholder="https://example.com"
                    value={config.url}
                    onChange={(e) => updateField('url', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">网站地址</label>
                  <Input
                    placeholder="公司地址"
                    value={config.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">备案号</label>
                  <Input
                    placeholder="ICP备案号"
                    value={config.record}
                    onChange={(e) => updateField('record', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 pb-2 border-b">SEO设置</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">网站标题</label>
                  <Input
                    placeholder="网站标题（SEO）"
                    value={config.webtitle}
                    onChange={(e) => updateField('webtitle', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">网站描述</label>
                  <Textarea
                    placeholder="网站描述（meta description）"
                    value={config.webdesc}
                    onChange={(e) => updateField('webdesc', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">关键词</label>
                  <Input
                    placeholder="关键词，多个用逗号分隔"
                    value={config.webkey}
                    onChange={(e) => updateField('webkey', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Business Info Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 pb-2 border-b">业务信息</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">版权信息</label>
                  <Input
                    placeholder="© 2024 Company"
                    value={config.copyright}
                    onChange={(e) => updateField('copyright', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">覆盖城市</label>
                  <Input
                    placeholder="覆盖城市"
                    value={config.covered_city}
                    onChange={(e) => updateField('covered_city', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2 mt-4">
                <label className="text-sm font-medium">荣誉资质</label>
                <Textarea
                  placeholder="荣誉资质信息"
                  value={config.award}
                  onChange={(e) => updateField('award', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
