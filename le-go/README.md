# Le-Go 后端管理系统

> 基于 Go (Gin + GORM) 重构的二手手机回收平台后端，替代原有 Django + xadmin 架构。

## 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| Web框架 | Gin | 1.9+ |
| ORM | GORM | 1.25+ |
| 数据库 | MySQL | 8.0 |
| 缓存 | Redis | 7.0 |
| 认证 | JWT | golang-jwt/v5 |
| 密码加密 | bcrypt | golang.org/x/crypto |
| 配置管理 | Viper | 1.18+ |
| 容器化 | Docker + Compose | - |

## 项目结构

```
le-go/
├── cmd/server/          # 入口文件
│   └── main.go
├── configs/             # 配置文件
│   └── config.yaml
├── internal/
│   ├── config/          # 配置加载
│   ├── middleware/       # 中间件 (JWT/CORS/RBAC)
│   ├── model/           # 数据模型 (GORM)
│   │   ├── common.go    # 公共模型、RBAC、管理员
│   │   ├── database.go  # 数据库/Redis初始化
│   │   ├── product.go   # 产品模块 (分类/品牌/产品/订单/描述包/优惠券)
│   │   ├── stock.go     # 库存模块 (收货/来源)
│   │   ├── sale.go      # 分销模块 (商品/客户/订单)
│   │   ├── partner.go   # 合作伙伴 (代理/商家/门店/授权码/批发/加盟/子站)
│   │   ├── pricing.go   # 报价模块 (分类/品牌/用户/报价)
│   │   ├── bidding.go   # 竞拍模块 (分类/品牌/类型/用户/商品/订单)
│   │   ├── article.go   # 文章模块 (分类/文章/评论)
│   │   └── web.go       # 基础数据 (配置/银行/省市区/会员/快递)
│   ├── handler/         # API处理器
│   │   ├── auth.go      # 管理员认证
│   │   ├── product.go   # 产品API
│   │   ├── stock.go     # 库存API
│   │   ├── sale.go      # 分销API
│   │   ├── partner.go   # 合作伙伴API
│   │   ├── pricing.go   # 报价API
│   │   ├── bidding.go   # 竞拍API
│   │   ├── article.go   # 文章API
│   │   └── web.go       # 基础数据API
│   ├── router/          # 路由注册
│   │   └── router.go
│   └── pkg/             # 公共工具包
│       ├── jwt/         # JWT工具
│       ├── response/    # 统一响应
│       └── pagination/  # 分页工具
├── docker-compose.yml   # Docker编排
├── Dockerfile           # Docker镜像
├── nginx.conf           # Nginx配置
├── Makefile             # 构建脚本
└── go.mod               # Go模块定义
```

## 业务模块对照

| Django App | Go Module | 数据表 | API数 |
|-----------|-----------|--------|-------|
| product | handler/product.go | 10张 | ~25 |
| stock | handler/stock.go | 3张 | ~10 |
| sale | handler/sale.go | 4张 | ~15 |
| partner | handler/partner.go | 8张 | ~30 |
| pricing | handler/pricing.go | 5张 | ~14 |
| bidding | handler/bidding.go | 7张 | ~18 |
| article | handler/article.go | 3张 | ~9 |
| web | handler/web.go | 8张 | ~17 |
| auth | handler/auth.go | 1张 | 4 |
| RBAC | model/common.go | 6张 | ~15 |

**总计**: ~48张表, ~150+ API接口

## 快速开始

### 环境要求
- Go 1.21+
- MySQL 8.0+
- Redis 7.0+

### 配置
编辑 `configs/config.yaml`，修改数据库、Redis、JWT等配置。

### 运行
```bash
# 安装依赖
go mod tidy

# 运行
go run ./cmd/server -config configs/config.yaml

# 或使用 make
make run
```

### Docker 部署
```bash
# 一键启动 (含 MySQL + Redis + Nginx)
docker-compose up -d

# 仅构建后端镜像
docker build -t le-go:latest .
```

## API 概览

所有 API 均以 `/api/v1` 为前缀，返回统一 JSON 格式：

```json
{
    "code": 0,
    "message": "success",
    "data": {}
}
```

### 认证
- `POST /api/v1/auth/login` - 管理员登录
- `POST /api/v1/auth/register` - 注册管理员
- `GET /api/v1/auth/info` - 获取当前用户信息
- `PUT /api/v1/auth/password` - 修改密码

### 后台管理 (需要管理员权限)
- `/api/v1/admin/menus` - 菜单管理
- `/api/v1/admin/roles` - 角色管理
- `/api/v1/admin/users` - 用户管理
- `/api/v1/admin/logs` - 操作日志

### 业务模块
- `/api/v1/product/*` - 产品管理
- `/api/v1/stock/*` - 库存管理
- `/api/v1/sale/*` - 分销管理
- `/api/v1/partner/*` - 合作伙伴管理
- `/api/v1/pricing/*` - 报价管理
- `/api/v1/bidding/*` - 竞拍管理
- `/api/v1/article/*` - 文章管理
- `/api/v1/web/*` - 基础数据管理

## 与原 Django 项目对比

| 特性 | Django (原) | Go (新) |
|------|------------|---------|
| 框架 | Django 2.0 | Gin 1.9 |
| ORM | Django ORM | GORM |
| 后台 | xadmin 0.6.1 | 自建RBAC + REST API |
| 认证 | 自定义Token+Redis | JWT |
| 密码 | pbkdf2_sha256 | bcrypt |
| 性能 | ~500 QPS | ~10000+ QPS |
| 部署 | mod_wsgi/uWSGI | Docker + 二进制 |
| 用户系统 | 6套独立表 | 统一RBAC |
| CSRF | 已禁用 | N/A (REST API) |
| 代码量 | ~6,168行 Python | ~4,000行 Go |
