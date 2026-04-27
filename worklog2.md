---
Task ID: 1
Agent: Main Agent
Task: 补充 le-go 后端公共 API + 开发 Next.js PC 端网站（乐回收网）

Work Log:
- 分析 le-go 现有 API（~150+ 端点），发现所有业务 API 都需要 JWT 认证
- 创建 le-go 公共路由组 /api/v1/public/*，使用 OptionalJWTAuth 中间件
- 新增 30 个公共 API 端点（产品/定价/竞价/文章/网站CMS/会员认证/订单）
- 新增 WebMemberAuth 模型用于存储会员密码
- 使用 Next.js 16 + Tailwind CSS 4 + shadcn/ui 搭建前端 PC 网站
- 实现客户端路由（Zustand），支持 11 个页面视图切换
- 开发完整响应式设计（PC + 手机端自适应）
- API 客户端层完整封装，对接 le-go 后端公开 API
- 页面编译成功（HTTP 200），零 lint 错误

Stage Summary:
- 后端新增/修改：public.go, router.go, model/web.go, model/database.go
- 前端新建 20+ 文件，修改 3 个核心文件
