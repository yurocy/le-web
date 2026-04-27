/**
 * Centralized API client for the le-go backend.
 *
 * Response envelope: { code: number, message: string, data: T }
 *   - code 0  → success
 *   - code -1 → generic error
 *   - code -2 → unauthorized / token expired
 *
 * Paginated response envelope: { code, message, data: { list: T[], total: number, page: number, page_size: number } }
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** Standard API response envelope */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** Paginated data wrapper */
export interface PageData<T = unknown> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}

/** Paginated API response */
export type PageResponse<T = unknown> = ApiResponse<PageData<T>>;

/** Query params common to every paginated list endpoint */
export interface PageParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  [key: string]: string | number | boolean | undefined;
}

/** CRUD entity ID (number) */
export type IdParam = number;

// ─── Error classes ───────────────────────────────────────────────────────────

export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "登录已过期，请重新登录") {
    super(-2, message);
    this.name = "UnauthorizedError";
  }
}

// ─── Token helpers (SSR-safe) ───────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

// ─── ApiClient ──────────────────────────────────────────────────────────────

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ── Generic request wrapper ──────────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const json: ApiResponse<T> = await res.json();

    if (json.code === -2) {
      removeToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
      throw new UnauthorizedError(json.message);
    }

    if (json.code !== 0) {
      throw new ApiError(json.code, json.message || "请求失败");
    }

    return json.data;
  }

  // ── Convenience HTTP methods ─────────────────────────────────────────────

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>("GET", path, undefined, params);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  async del<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("DELETE", path, body);
  }

  // ── Upload helper (FormData, no JSON Content-Type) ──────────────────────

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const url = new URL(path, this.baseUrl);
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: formData,
    });

    const json: ApiResponse<T> = await res.json();
    if (json.code === -2) {
      removeToken();
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("auth:logout"));
      throw new UnauthorizedError(json.message);
    }
    if (json.code !== 0) throw new ApiError(json.code, json.message || "上传失败");
    return json.data;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  AUTH MODULE
  // ══════════════════════════════════════════════════════════════════════════

  auth = {
    /** 登录 → 返回 token 字符串 */
    login: (data: { username: string; password: string }) =>
      this.post<string>("/admin/auth/login", data).then((token) => {
        setToken(token);
        return token;
      }),

    /** 退出登录 */
    logout: () => this.post<null>("/admin/auth/logout").then(() => removeToken()),

    /** 获取当前管理员信息 */
    getInfo: () => this.get<Record<string, unknown>>("/admin/auth/info"),

    /** 修改密码 */
    changePassword: (data: { old_password: string; new_password: string; confirm_password: string }) =>
      this.post<null>("/admin/auth/change-password", data),

    /** 清除本地 token */
    clearToken: () => removeToken(),
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  SYSTEM MODULE (管理员/角色/菜单/日志)
  // ══════════════════════════════════════════════════════════════════════════

  system = {
    // ── 管理员管理 ──────────────────────────────────────────────────────
    admin: {
      list: (params?: PageParams) => this.get<PageData>("/admin/system/admin/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/system/admin/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/system/admin/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/system/admin/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/system/admin/delete/${id}`),
    },

    // ── 角色管理 ────────────────────────────────────────────────────────
    role: {
      list: (params?: PageParams) => this.get<PageData>("/admin/system/role/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/system/role/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/system/role/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/system/role/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/system/role/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/system/role/delete/${id}`),
    },

    // ── 菜单管理 ────────────────────────────────────────────────────────
    menu: {
      list: (params?: PageParams) => this.get<PageData>("/admin/system/menu/list", params),
      tree: () => this.get<Record<string, unknown>[]>("/admin/system/menu/tree"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/system/menu/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/system/menu/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/system/menu/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/system/menu/delete/${id}`),
    },

    // ── 操作日志 ────────────────────────────────────────────────────────
    log: {
      list: (params?: PageParams) => this.get<PageData>("/admin/system/log/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/system/log/detail/${id}`),
      clear: () => this.del<null>("/admin/system/log/clear"),
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  PRODUCT MODULE (分类/品牌/产品/订单/描述包/加价券)
  // ══════════════════════════════════════════════════════════════════════════

  product = {
    // ── 产品分类 ────────────────────────────────────────────────────────
    category: {
      list: (params?: PageParams) => this.get<PageData>("/admin/product/category/list", params),
      tree: () => this.get<Record<string, unknown>[]>("/admin/product/category/tree"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/product/category/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/product/category/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/product/category/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/product/category/delete/${id}`),
    },

    // ── 品牌管理 ────────────────────────────────────────────────────────
    brand: {
      list: (params?: PageParams) => this.get<PageData>("/admin/product/brand/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/product/brand/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/product/brand/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/product/brand/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/product/brand/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/product/brand/delete/${id}`),
    },

    // ── 产品列表 ────────────────────────────────────────────────────────
    list: {
      list: (params?: PageParams) => this.get<PageData>("/admin/product/list/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/product/list/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/product/list/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/product/list/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/product/list/delete/${id}`),
      updateStatus: (id: IdParam, status: number) => this.put<null>(`/admin/product/list/status/${id}`, { status }),
    },

    // ── 订单管理 ────────────────────────────────────────────────────────
    order: {
      list: (params?: PageParams) => this.get<PageData>("/admin/product/order/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/product/order/detail/${id}`),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/product/order/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/product/order/delete/${id}`),
      export: (params?: PageParams) => this.get<Blob>("/admin/product/order/export", params),
    },

    // ── 描述包 ──────────────────────────────────────────────────────────
    desc: {
      list: (params?: PageParams) => this.get<PageData>("/admin/product/desc/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/product/desc/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/product/desc/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/product/desc/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/product/desc/delete/${id}`),
    },

    // ── 加价券 ──────────────────────────────────────────────────────────
    coupon: {
      list: (params?: PageParams) => this.get<PageData>("/admin/product/coupon/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/product/coupon/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/product/coupon/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/product/coupon/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/product/coupon/delete/${id}`),
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  STOCK MODULE (收货/统计/管理账号/收货来源)
  // ══════════════════════════════════════════════════════════════════════════

  stock = {
    // ── 收货管理 ────────────────────────────────────────────────────────
    goods: {
      list: (params?: PageParams) => this.get<PageData>("/admin/stock/goods/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/stock/goods/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/stock/goods/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/stock/goods/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/stock/goods/delete/${id}`),
      import: (formData: FormData) => this.upload<null>("/admin/stock/goods/import", formData),
    },

    // ── 库存统计 ────────────────────────────────────────────────────────
    statistics: {
      list: (params?: PageParams) => this.get<PageData>("/admin/stock/statistics/list", params),
      summary: () => this.get<Record<string, unknown>>("/admin/stock/statistics/summary"),
      export: (params?: PageParams) => this.get<Blob>("/admin/stock/statistics/export", params),
    },

    // ── 管理账号 ────────────────────────────────────────────────────────
    admin: {
      list: (params?: PageParams) => this.get<PageData>("/admin/stock/admin/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/stock/admin/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/stock/admin/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/stock/admin/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/stock/admin/delete/${id}`),
    },

    // ── 收货来源 ────────────────────────────────────────────────────────
    source: {
      list: (params?: PageParams) => this.get<PageData>("/admin/stock/source/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/stock/source/all"),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/stock/source/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/stock/source/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/stock/source/delete/${id}`),
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  PARTNER MODULE (代理/商家/门店/授权码/批量回收/加盟/子站)
  // ══════════════════════════════════════════════════════════════════════════

  partner = {
    // ── 代理管理 ────────────────────────────────────────────────────────
    agent: {
      list: (params?: PageParams) => this.get<PageData>("/admin/partner/agent/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/partner/agent/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/partner/agent/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/partner/agent/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/partner/agent/delete/${id}`),
    },

    // ── 商家管理 ────────────────────────────────────────────────────────
    merchant: {
      list: (params?: PageParams) => this.get<PageData>("/admin/partner/merchant/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/partner/merchant/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/partner/merchant/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/partner/merchant/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/partner/merchant/delete/${id}`),
      audit: (id: IdParam, data: Record<string, unknown>) =>
        this.post<null>(`/admin/partner/merchant/audit/${id}`, data),
    },

    // ── 门店管理 ────────────────────────────────────────────────────────
    store: {
      list: (params?: PageParams) => this.get<PageData>("/admin/partner/store/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/partner/store/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/partner/store/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/partner/store/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/partner/store/delete/${id}`),
    },

    // ── 授权码 ──────────────────────────────────────────────────────────
    key: {
      list: (params?: PageParams) => this.get<PageData>("/admin/partner/key/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/partner/key/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/partner/key/create", data),
      batchCreate: (data: Record<string, unknown>) =>
        this.post<null>("/admin/partner/key/batch-create", data),
      delete: (id: IdParam) => this.del<null>(`/admin/partner/key/delete/${id}`),
      disable: (id: IdParam) => this.put<null>(`/admin/partner/key/disable/${id}`),
    },

    // ── 批量回收 ────────────────────────────────────────────────────────
    wholesale: {
      list: (params?: PageParams) => this.get<PageData>("/admin/partner/wholesale/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/partner/wholesale/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/partner/wholesale/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/partner/wholesale/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/partner/wholesale/delete/${id}`),
    },

    // ── 加盟申请 ────────────────────────────────────────────────────────
    joinin: {
      list: (params?: PageParams) => this.get<PageData>("/admin/partner/joinin/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/partner/joinin/detail/${id}`),
      audit: (id: IdParam, data: Record<string, unknown>) =>
        this.post<null>(`/admin/partner/joinin/audit/${id}`, data),
    },

    // ── 子站管理 ────────────────────────────────────────────────────────
    subweb: {
      list: (params?: PageParams) => this.get<PageData>("/admin/partner/subweb/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/partner/subweb/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/partner/subweb/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/partner/subweb/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/partner/subweb/delete/${id}`),
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  SALE MODULE (商品/客户/竞拍订单)
  // ══════════════════════════════════════════════════════════════════════════

  sale = {
    // ── 分销等级 ────────────────────────────────────────────────────────
    level: {
      list: (params?: PageParams) => this.get<PageData>("/admin/sale/level/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/sale/level/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/sale/level/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/sale/level/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/sale/level/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/sale/level/delete/${id}`),
    },

    // ── 商品管理 ────────────────────────────────────────────────────────
    goods: {
      list: (params?: PageParams) => this.get<PageData>("/admin/sale/goods/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/sale/goods/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/sale/goods/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/sale/goods/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/sale/goods/delete/${id}`),
      updateStatus: (id: IdParam, status: number) => this.put<null>(`/admin/sale/goods/status/${id}`, { status }),
    },

    // ── 客户管理 ────────────────────────────────────────────────────────
    user: {
      list: (params?: PageParams) => this.get<PageData>("/admin/sale/user/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/sale/user/detail/${id}`),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/sale/user/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/sale/user/delete/${id}`),
    },

    // ── 竞拍订单 ────────────────────────────────────────────────────────
    order: {
      list: (params?: PageParams) => this.get<PageData>("/admin/sale/order/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/sale/order/detail/${id}`),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/sale/order/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/sale/order/delete/${id}`),
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  PRICING MODULE (分类/品牌/用户/报价)
  // ══════════════════════════════════════════════════════════════════════════

  pricing = {
    // ── 报价分类 ────────────────────────────────────────────────────────
    category: {
      list: (params?: PageParams) => this.get<PageData>("/admin/pricing/category/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/pricing/category/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/pricing/category/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/pricing/category/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/pricing/category/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/pricing/category/delete/${id}`),
    },

    // ── 品牌管理 ────────────────────────────────────────────────────────
    brand: {
      list: (params?: PageParams) => this.get<PageData>("/admin/pricing/brand/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/pricing/brand/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/pricing/brand/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/pricing/brand/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/pricing/brand/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/pricing/brand/delete/${id}`),
    },

    // ── 用户管理 ────────────────────────────────────────────────────────
    user: {
      list: (params?: PageParams) => this.get<PageData>("/admin/pricing/user/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/pricing/user/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/pricing/user/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/pricing/user/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/pricing/user/delete/${id}`),
    },

    // ── 报价列表 ────────────────────────────────────────────────────────
    pricing: {
      list: (params?: PageParams) => this.get<PageData>("/admin/pricing/pricing/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/pricing/pricing/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/pricing/pricing/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/pricing/pricing/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/pricing/pricing/delete/${id}`),
      batchImport: (formData: FormData) => this.upload<null>("/admin/pricing/pricing/batch-import", formData),
      export: (params?: PageParams) => this.get<Blob>("/admin/pricing/pricing/export", params),
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  BIDDING MODULE (分类/品牌/类型/用户/商品/竞拍订单)
  // ══════════════════════════════════════════════════════════════════════════

  bidding = {
    // ── 竞拍分类 ────────────────────────────────────────────────────────
    category: {
      list: (params?: PageParams) => this.get<PageData>("/admin/bidding/category/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/bidding/category/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/bidding/category/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/bidding/category/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/bidding/category/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/bidding/category/delete/${id}`),
    },

    // ── 品牌 ────────────────────────────────────────────────────────────
    brand: {
      list: (params?: PageParams) => this.get<PageData>("/admin/bidding/brand/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/bidding/brand/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/bidding/brand/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/bidding/brand/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/bidding/brand/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/bidding/brand/delete/${id}`),
    },

    // ── 类型 ────────────────────────────────────────────────────────────
    type: {
      list: (params?: PageParams) => this.get<PageData>("/admin/bidding/type/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/bidding/type/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/bidding/type/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/bidding/type/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/bidding/type/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/bidding/type/delete/${id}`),
    },

    // ── 用户 ────────────────────────────────────────────────────────────
    user: {
      list: (params?: PageParams) => this.get<PageData>("/admin/bidding/user/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/bidding/user/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/bidding/user/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/bidding/user/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/bidding/user/delete/${id}`),
    },

    // ── 商品 ────────────────────────────────────────────────────────────
    goods: {
      list: (params?: PageParams) => this.get<PageData>("/admin/bidding/goods/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/bidding/goods/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/bidding/goods/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/bidding/goods/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/bidding/goods/delete/${id}`),
      updateStatus: (id: IdParam, status: number) =>
        this.put<null>(`/admin/bidding/goods/status/${id}`, { status }),
    },

    // ── 竞拍订单 ────────────────────────────────────────────────────────
    order: {
      list: (params?: PageParams) => this.get<PageData>("/admin/bidding/order/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/bidding/order/detail/${id}`),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/bidding/order/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/bidding/order/delete/${id}`),
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  ARTICLE MODULE (分类/文章/评论)
  // ══════════════════════════════════════════════════════════════════════════

  article = {
    // ── 文章分类 ────────────────────────────────────────────────────────
    category: {
      list: (params?: PageParams) => this.get<PageData>("/admin/article/category/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/article/category/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/article/category/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/article/category/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/article/category/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/article/category/delete/${id}`),
    },

    // ── 文章列表 ────────────────────────────────────────────────────────
    article: {
      list: (params?: PageParams) => this.get<PageData>("/admin/article/article/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/article/article/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/article/article/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/article/article/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/article/article/delete/${id}`),
      updateStatus: (id: IdParam, status: number) =>
        this.put<null>(`/admin/article/article/status/${id}`, { status }),
    },

    // ── 评论管理 ────────────────────────────────────────────────────────
    comment: {
      list: (params?: PageParams) => this.get<PageData>("/admin/article/comment/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/article/comment/detail/${id}`),
      delete: (id: IdParam) => this.del<null>(`/admin/article/comment/delete/${id}`),
      batchDelete: (ids: number[]) => this.post<null>("/admin/article/comment/batch-delete", { ids }),
      audit: (id: IdParam, data: Record<string, unknown>) =>
        this.post<null>(`/admin/article/comment/audit/${id}`, data),
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  WEB MODULE (配置/轮播图/银行/省份/城市/区县/会员/快递)
  // ══════════════════════════════════════════════════════════════════════════

  web = {
    // ── 网站配置 ────────────────────────────────────────────────────────
    config: {
      get: () => this.get<Record<string, unknown>>("/admin/web/config/get"),
      update: (data: Record<string, unknown>) => this.post<null>("/admin/web/config/update", data),
    },

    // ── 轮播图 ──────────────────────────────────────────────────────────
    banner: {
      list: (params?: PageParams) => this.get<PageData>("/admin/web/banner/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/web/banner/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/web/banner/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/web/banner/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/web/banner/delete/${id}`),
    },

    // ── 银行列表 ────────────────────────────────────────────────────────
    bank: {
      list: (params?: PageParams) => this.get<PageData>("/admin/web/bank/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/web/bank/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/web/bank/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/web/bank/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/web/bank/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/web/bank/delete/${id}`),
    },

    // ── 省份 ────────────────────────────────────────────────────────────
    province: {
      list: () => this.get<Record<string, unknown>[]>("/admin/web/province/list"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/web/province/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/web/province/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/web/province/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/web/province/delete/${id}`),
    },

    // ── 城市 ────────────────────────────────────────────────────────────
    city: {
      list: (provinceId?: number) =>
        this.get<Record<string, unknown>[]>("/admin/web/city/list", provinceId ? { province_id: provinceId } : undefined),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/web/city/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/web/city/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/web/city/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/web/city/delete/${id}`),
    },

    // ── 区县 ────────────────────────────────────────────────────────────
    county: {
      list: (cityId?: number) =>
        this.get<Record<string, unknown>[]>("/admin/web/county/list", cityId ? { city_id: cityId } : undefined),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/web/county/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/web/county/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/web/county/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/web/county/delete/${id}`),
    },

    // ── 会员管理 ────────────────────────────────────────────────────────
    member: {
      list: (params?: PageParams) => this.get<PageData>("/admin/web/member/list", params),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/web/member/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/web/member/create", data),
      update: (id: IdParam, data: Record<string, unknown>) => this.put<null>(`/admin/web/member/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/web/member/delete/${id}`),
    },

    // ── 快递公司 ────────────────────────────────────────────────────────
    express: {
      list: (params?: PageParams) => this.get<PageData>("/admin/web/express/list", params),
      all: () => this.get<Record<string, unknown>[]>("/admin/web/express/all"),
      detail: (id: IdParam) => this.get<Record<string, unknown>>(`/admin/web/express/detail/${id}`),
      create: (data: Record<string, unknown>) => this.post<null>("/admin/web/express/create", data),
      update: (id: IdParam, data: Record<string, unknown>) =>
        this.put<null>(`/admin/web/express/update/${id}`, data),
      delete: (id: IdParam) => this.del<null>(`/admin/web/express/delete/${id}`),
    },
  };

  // ── Dashboard ─────────────────────────────────────────────────────────

  dashboard = {
    /** 仪表盘汇总数据 */
    summary: () => this.get<Record<string, unknown>>("/admin/dashboard/summary"),
    /** 最近订单 */
    recentOrders: (params?: PageParams) =>
      this.get<PageData>("/admin/dashboard/recent-orders", params),
    /** 统计图表数据 */
    chart: (type: string, params?: Record<string, string | number | undefined>) =>
      this.get<Record<string, unknown>>(`/admin/dashboard/chart/${type}`, params),
  };
}

// ─── Export singleton ───────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = new ApiClient(API_BASE);
export default api;

// ─── Simple fetch wrapper for admin pages ──────────────────────────────────

const _getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "";

export const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${_getToken()}`,
      ...options?.headers,
    },
  });
  return res.json();
};
