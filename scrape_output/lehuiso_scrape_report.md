# Lehuiso.com (乐回收) — Comprehensive Site Scrape Report

## 1. SITE OVERVIEW

| Field | Value |
|---|---|
| **Site Name** | 乐回收 (LeHuiSo) |
| **URL** | https://www.lehuiso.com |
| **Title** | 乐回收 - 手机回收\|二手手机回收 - 国内权威二手手机回收网 |
| **Company** | 深圳市迈乐收网络科技有限公司 (Shenzhen Maileshou Network Technology Co., Ltd.) |
| **ICP License** | 粤ICP备13057331号-1 |
| **Public Security Record** | 粤公网安备:44030602001261号 |
| **Phone** | 0755-23023950 |
| **Email** | lehuiso@163.com |
| **Business Scope** | Mobile phones, laptops, tablets, cameras, drones, gaming consoles, smart watches, smart home appliances, wireless earbuds, smart devices |
| **Technology Stack** | PHP (server-side rendered), jQuery, HTML4/XHTML transitional, nginx, CDN on static.lehuiso.com |
| **Baidu SEO Verification** | XZs3EAb98o |
| **Weibo** | http://weibo.com/lehuiso |
| **Agent Portal** | http://shang.lehuiso.com |
| **Copyright** | 2013-2020 |

---

## 2. COMPLETE PAGE HIERARCHY & ROUTING

### 2.1 Primary Navigation (Top-Level Pages)

| Page | URL | Description |
|---|---|---|
| **Homepage** | `/` or `index.php` | Main landing page with hero, search, product grid |
| **Product Categories** | `products.php?kind={1-13}` | Product listing by category (kind=1:phones, 2:laptops, etc.) |
| **Product by Brand** | `products.php?kind={K}&brand={B}` | Products filtered by brand within category |
| **Product Detail** | `goods.php?id={ID}` | Individual product detail page |
| **Product SEO URL** | `goods/goods_{ID}.html` | SEO-friendly product URLs |
| **Search** | `product_search.php` | Product search (POST form) |
| **About Us** | `aboutlehuiso.php` | Company information page |
| **Join/Franchise** | `join.php` | Franchise application page |
| **Wholesale/Channel** | `wholesale.php` | B2B channel distribution & cooperation |
| **Eco/Charity** | `huanbao.php` | Environmental protection / recycling process |
| **O2O Stores** | `gushi.php` | Physical store experience locations |
| **User Reviews** | `evaluation_p.php` | Customer evaluation display |
| **Staff Reviews** | `evaluation_s.php` | On-site staff service reviews |
| **News/Info** | `info.php?id={ID}` | Individual news/article page |
| **News Lists** | `infolist.php?id={2,3,4}` | Categorized news listings |
| **Order Center** | `account_information.php?uid=` | User order management |
| **Login** | `/login.php` | User login page |
| **Not Found Model** | `noneproduct.php` | "Model not found" page |
| **Contact Us** | `info.php?id=11` | Contact information |

### 2.2 Category Kind IDs

| Kind ID | Category | Top Brands |
|---|---|---|
| 1 | 手机 (Phones) | Apple(134), Huawei(124), Samsung(114), Honor(878), OPPO(128), vivo(118), iQOO(885), Redmi(879), Xiaomi(126) |
| 2 | 笔记本 (Laptops) | Apple(73), Lenovo(71), ASUS(66), HP(68), Dell(58), MECHREVO(821) |
| 3 | 镜头 (Lenses) | Sony(801), Canon(799) |
| 4 | 平板电脑 (Tablets) | Apple(873), Huawei(820), Honor(895), Samsung(26), Xiaomi(789), vivo(899), OPPO(900), Microsoft(780) |
| 5 | 游戏机 (Gaming) | Sony SONY(138), Nintendo(140) |
| 6 | 智能手表 (Smartwatches) | Apple Watch(872), Huawei Watch(882) |
| 7 | 无人机 (Drones) | DJI(813), Xiaomi(874) |
| 8 | 单反相机 (DSLR Cameras) | Canon(93), Sony(92) |
| 10 | 智能家电 (Smart Home) | XGIMI(889), JMGO(894), DJI Robot(901), Ecovacs(902), Roborock(903), Narwal(904), Dreame(905) |
| 12 | 无线耳机 (Wireless Earbuds) | AirPods(877), Sony(891), Huawei(892) |
| 13 | 智能设备 (Smart Devices) | OSMO(886), Ronin(888), RoboMaster(880), DJI MIC(898), Apple Pencil(883), iPod(141), GoPro(896), Insta360(897) |

### 2.3 Mobile Site Routes

| URL | Description |
|---|---|
| `m/` or `/m` | Mobile homepage |
| `m/category.php?k={1-13}` | Mobile category listing |
| `m/evaluation_p.php` | Mobile user reviews |
| `m/mjoin.php` | Mobile franchise page |
| `m/mwholesale.php` | Mobile wholesale page |
| `m/contact_us.html` | Mobile contact page |
| `m/news_info.php?id={ID}` | Mobile news page |
| `m/index_next_door.php` | Mobile nearby stores |
| `m/new_sub.php` | Submit new model (mobile) |
| `m/center.php` | Mobile user center |
| `m/personal.php?uid=` | Mobile personal page |

---

## 3. PAGE-BY-PAGE ANALYSIS

### 3.1 Homepage (`/`)

**Layout Structure (top-to-bottom):**
1. **Top Utility Bar** (`#header > #h_top_share`) — Links: 手机版, PAD版, 官方小程序 (with QR popup), 联系我们, 关于乐回收, 订单中心
2. **Logo + Category Tabs** (`#h_m_logo`) — Logo on left, 4 tab items: 旧机回收, 环保公益, 020体验店 (new tag), 渠销分销|合作
3. **Main Navigation Bar** (`#nav`) — Horizontal nav with 12 product categories + dropdown brand lists per category
4. **Hero Banner** (`#index_top > #index_top_img`) — 5 rotating slideshow banners with auto-search overlay
5. **Search Box** (`#search_box`) — Hot search links + text input form (POST to product_search.php) + autocomplete suggestions + "4-step recycling" visual guide
6. **Brand Navigation Bar** (`#brand`) — Visual brand logos (CSS sprite backgrounds) for top phone brands: iPhone, OPPO, Samsung, Nokia, Xiaomi, Huawei, Motorola, vivo, Sony
7. **Product Grid** (`#product`) — Left sidebar category menu + Right product listing (tabbed by category, showing 8 products per tab with image, name, price, trade count)
8. **User Reviews Ticker** (`#partner`) — Partner evaluation slideshow + "Join Franchise" CTA buttons
9. **News Section** (`#news`) — Left: latest 8 news articles with dates; Right: "How We Test" 5-step inspection slideshow
10. **Trust Badges** (`#bot_icon`) — 4 badges: 全国包邮, 价格保护 (48hr), 数据清除, 专业检测
11. **Footer** (`#footer`) — Phone number, hours, email, social links; 4 FAQ columns; QR codes for WeChat + Mini Program; Government compliance badges
12. **Floating Sidebar** (`#kefu`) — Fixed-position sidebar: 在线客服, 常见问题, 小程序 (popup), 返回顶部

**Form Elements:**
- Search form: `<input type="text" name="productname">` + `<button>搜索机型</button>` (POST to `product_search.php`)
- Hidden input: `<input type="hidden" name="send" value="send">`

---

### 3.2 About Page (`aboutlehuiso.php`)

**Title:** 关于乐回收 - 乐回收网

**Sections:**
- Company description: "乐回收隶属于深圳市迈乐收网络科技有限公司，是一个专注于二手数码产品回收服务的网站"
- Service methods: 上门回收 (door-to-door in Shenzhen), 快递邮寄 (nationwide shipping)
- Recycling process for high/low value items
- Business coverage: 662 cities nationwide
- Images: company photos (building, activities, factory)

---

### 3.3 Join/Franchise Page (`join.php`)

**Title:** 加盟乐回收 - 乐回收网|手机回收加盟|全国最大手机回收加盟网

**Key Elements:**
- Franchise application form/section
- Background image: `images/join_back_img.jpg`
- Submit button image: `images/join/join_submit.png`
- Current status image: `images/present_situation.png`

---

### 3.4 Wholesale/Channel Page (`wholesale.php`)

**Title:** 渠道分销|合作 - 乐回收网|批量手机回收|手机回收合作|手机回收公司

**Content:** B2B channel distribution and cooperation information. Standard shared header/footer/navigation.

---

### 3.5 Environmental Protection Page (`huanbao.php`)

**Title:** 环保公益 - 乐回收网|手机回收后怎么处理？

**Key Images:**
- `images/huanbao/huanbao3_1_0.png`
- `images/huanbao/huanbao_3_1_1.png`
- `images/huanbao/huanbao_4_1.png` through `huanbao_4_4.png`

---

### 3.6 O2O Store Page (`gushi.php`)

**Title:** 020体验店|乐回收实体店 - 乐回收网|手机回收实体店

**Store Locations (with multiple photos each):**
- Beijing (beijing1-4.jpg)
- Guangzhou (guangzhou1-6.jpg)
- Shanghai (shanghai_1,3,4,5.jpg)
- Suzhou (suzhou1-4.jpg)
- Nanning (nanning1-5.jpg)

**Key Images:**
- Store logo: `images/store_lehuiso.png`
- Brand logo: `images/gushi/boou.png`
- Various store images and activity graphics

---

### 3.7 User Reviews Page (`evaluation_p.php`)

**Title:** 用户评价 - 乐回收网|乐回收网怎么样？

**Stats Displayed:**
- Cumulative users served: **4,936,899**
- Positive reviews: **41,140**
- Service areas: Shenzhen (上门回收)
- Content: Product review cards with images, user info, ratings, timestamps

---

### 3.8 Mobile Homepage (`/m`)

**Layout Structure:**
1. **Top Bar** — Logo + "订单中心" (Order Center) link
2. **Banner Slideshow** — 5 rotating banners (auto-scroll with touch support)
3. **Announcement Bar** — Scrolling news ticker with laba icon
4. **4-Step Process** — Visual recycling process guide
5. **Category Grid** — 10+ category icons in grid layout (phones, laptops, tablets, drones, gaming, cameras, lenses, smartwatches, smart devices, smart home, wireless earbuds, +)
6. **Service Guarantee Carousel** — Trust/service badges
7. **Live Recycling Ticker** — Real-time recycling feed showing device, price, phone number (partially masked), timestamp
8. **Bottom Navigation** — 3 rows × 3 columns:
   - Row 1: 代理商入口, 人才招聘, 联系我们
   - Row 2: 大客户入口, 我要加盟, 实体门店
   - Row 3: 商家系统, 提交新型号, 电脑版
9. **Copyright Footer**
10. **Floating Customer Service** — Expandable chat button with WeChat QR

**Category Icons (mobile):**
| Category | Icon |
|---|---|
| 手机 | `https://static.lehuiso.com/images/six-3.png` |
| 笔记本 | `https://static.lehuiso.com/images/six-1.png` |
| 平板电脑 | `https://static.lehuiso.com/images/six-5.png` |
| 无人机 | `https://static.lehuiso.com/images/six-7.png` |
| 游戏机 | `https://static.lehuiso.com/images/six-4.png` |
| 单反相机 | `https://static.lehuiso.com/images/six-6.png` |
| 镜头 | `https://static.lehuiso.com/images/six-2.png` |
| 智能手表 | `https://static.lehuiso.com/images/six-8.png` |
| 智能家电 | `https://static.lehuiso.com/images/six-9.png` |
| 无线耳机 | `https://static.lehuiso.com/images/six-10.png` |

---

## 4. COMPLETE IMAGE URL INVENTORY

### 4.1 Homepage Images

#### Banners / Hero Slides
| Image URL | Alt/Title |
|---|---|
| `https://static.lehuiso.com/indexpic/20260224154404700.jpg` | 我们开工啦-乐回收 |
| `https://static.lehuiso.com/indexpic/20251230105016508.jpg` | 大疆无人机，高价回收就来乐回收 |
| `https://static.lehuiso.com/indexpic/20251230111603361.jfif` | 运动相机、游戏高价回收 |
| `https://static.lehuiso.com/indexpic/20251230111739961.jfif` | 投影仪回收 |
| `https://static.lehuiso.com/indexpic/20220111145210597.jpg` | 乐回收联手迪信通 致力打造手机回收与销售一体化平台 |

#### Site UI/Branding
| Image URL | Purpose |
|---|---|
| `images/logo.png` | Main logo |
| `images/brand.png` | "品牌导航" label icon |
| `images/erweima.jpg` | WeChat Mini Program QR code |
| `images/weichat_m.png` | Mobile version QR code |
| `images/pad.png` | PAD version QR code |
| `images/weixin.png` | WeChat public account QR |
| `images/400-kefu.png` | Customer service phone icon |
| `images/tubiao.png` | Public security badge icon |
| `images/new.gif` | "NEW" badge |
| `images/favicon.ico` | Favicon |
| `images/news.png` | "乐回收资讯" section icon |
| `images/index_news_a_img.gif` | News list item bullet icon |
| `images/partner.png?v=20151006` | "合作伙伴" section header |
| `images/join.png` | "加盟" button (CSS background) |
| `images/comment.png` | Comment section icon |
| `images/u893.png` | Evaluation section icon |
| `images/u893_2.png` | Active evaluation icon |

#### Trust/Compliance Badges
| Image URL | Purpose |
|---|---|
| `images/360.png` | 360 verification |
| `images/360scans.png` | 360 security scan |
| `images/index_footer_bottom_1.png` | ICP filing badge |
| `images/index_footer_bottom_2.png` | Business registration badge |
| `images/index_footer_bottom_3.png` | Security assessment badge |

#### Inspection Guide Images
| Image URL | Purpose |
|---|---|
| `images/check_5_1.png` | Step 1: Screen check |
| `images/check_5_2.png` | Step 2: Camera check |
| `images/check_5_3.png` | Step 3: Disassembly check |
| `images/check_5_4.png` | Step 4: Water damage check |
| `images/check_5_5.png` | Step 5: Call function check |

#### Product Images (Sample - from homepage, 100+ total)
All product images follow the pattern: `https://static.lehuiso.com/productimg/{timestamp}.{png/jpg}`
Notable ones include:
- `https://static.lehuiso.com/productimg/20260318154704296.png` — OPPO Find X8 Ultra
- `https://static.lehuiso.com/productimg/20260318161152522.png` — iPhone 16 Pro Max
- `https://static.lehuiso.com/productimg/20260318161143467.png` — iPhone 16 Pro
- `https://static.lehuiso.com/productimg/20260318150141799.png` — Xiaomi 15 Ultra
- `https://static.lehuiso.com/productimg/20260318110749381.png` — Samsung Galaxy S25 Ultra
- `https://static.lehuiso.com/productimg/default.png` — Default placeholder

#### Evaluation/Partner
| Image URL | Purpose |
|---|---|
| `https://static.lehuiso.com/partner/20230805144950688.jpg` | Partner evaluation image |

### 4.2 About Page Images
| Image URL | Purpose |
|---|---|
| `images/about1/whatislehuiso.png` | "What is Lehuiso" graphic |
| `images/about1/come_on.png` | Join/recruitment graphic |
| `images/about1/gongchang.jpg` | Factory photo |
| `images/about1/huodong1.jpg` | Activity photo 1 |
| `images/about1/huodong2.jpg` | Activity photo 2 |
| `images/about1/jianzhu.jpg` | Building photo |
| `images/about1/jiaotong.jpg` | Transportation photo |

### 4.3 Join/Franchise Page Images
| Image URL | Purpose |
|---|---|
| `images/join_back_img.jpg` | Join page background |
| `images/join/join_submit.png` | Submit button image |
| `images/present_situation.png` | Current status graphic |

### 4.4 Environmental Protection Page Images
| Image URL | Purpose |
|---|---|
| `images/huanbao/huanbao3_1_0.png` | Eco info graphic |
| `images/huanbao/huanbao_3_1_1.png` | Eco process graphic |
| `images/huanbao/huanbao_4_1.png` | Eco step 1 |
| `images/huanbao/huanbao_4_2.png` | Eco step 2 |
| `images/huanbao/huanbao_4_3.png` | Eco step 3 |
| `images/huanbao/huanbao_4_4.png` | Eco step 4 |

### 4.5 O2O Store Page Images
| Image URL | Purpose |
|---|---|
| `images/store_lehuiso.png` | Store brand image |
| `images/gushi/boou.png` | Partner brand logo |
| `images/gushi/gushi_4.png` — `gushi_10.png` | Various store/feature graphics |
| `images/gushi/huodong.png` | Activity promotion image |
| `images/zhuanyuan_img.jpg` | Staff photo |
| `images/beijing1.jpg` — `beijing4.jpg` | Beijing store photos |
| `images/guangzhou1.jpg` — `guangzhou6.jpg` | Guangzhou store photos |
| `images/shanghai_1.jpg`, `shanghai_3.jpg` — `shanghai_5.jpg` | Shanghai store photos |
| `images/suzhou1.jpg` — `suzhou4.jpg` | Suzhou store photos |
| `images/nanning1.jpg` — `nanning5.jpg` | Nanning store photos |

### 4.6 Mobile Page Images
| Image URL | Purpose |
|---|---|
| `images/top_logo.png` | Mobile logo |
| `images/laba.png` | Announcement speaker icon |
| `images/1.png` — `images/6.png` | Step process icons |
| `images/kefu.png` | Customer service floating button |
| `images/kefu_img.png` | WeChat customer service QR |
| `images/plus.png` | Category "more" icon |
| `https://static.lehuiso.com/images/six-1.png` — `six-10.png` | Category icons |
| `https://static.lehuiso.com/images/75AA0BD0-9CEB-4CEF-B6E9-840CB369DA32.png` | Mobile banner image |
| Mobile Banners: `http://static.lehuiso.com/indexpic/20210813165056694.jpg`, `20251230111456321.jfif`, `20251230112441577.jfif`, `20260224154427812.jpg`, `20260320093448998.jfif`

### 4.7 User Reviews Page Images
| Image URL | Purpose |
|---|---|
| `images/xinxin.png` | Star/rating icon |
| `images/new.gif` | "NEW" badge |
| Multiple `http://static.lehuiso.com/productimg/...` | User review product images |

---

## 5. NAVIGATION STRUCTURE

### 5.1 Top Utility Bar
```
[手机版 ▼] [PAD版 ▼] [官方小程序 ▼] | Welcome... | ... | [联系我们] [关于乐回收] [订单中心]
```

### 5.2 Category Tab Bar (under logo)
```
[旧机回收] [环保公益] [020体验店 new] [渠道分销 | 合作]
```

### 5.3 Main Product Navigation Bar
```
[首页] | [手机] | [笔记本] | [平板电脑] | [无人机] | [游戏机] | [单反相机] | [镜头] | [智能手表] | [智能家电] | [无线耳机] | [智能设备]
```
Each nav item has a dropdown with brand sub-categories (shown on hover).

### 5.4 Footer Navigation
```
常见问题:          关于我们:          帮助中心:          合作/友链:
  如何包装？         人才招聘           没有我的型号       查询订单物流
  如何发货？         关于乐回收         保障交易安全       EMS快递查询
  快递费用           联系我们           提交订单以后       手机回收
  付款时间           服务条款           隐私保护           乐回收·中国
```

### 5.5 Floating Sidebar (right edge)
```
[在线客服] ← opens chat
[常见问题] ← opens FAQ panel
[小程序] ← shows QR
[置顶] ← scrolls to top
```

### 5.6 Mobile Bottom Navigation (3×3 grid)
```
[代理商入口]  [人才招聘]  [联系我们]
[大客户入口]  [我要加盟]  [实体门店]
[商家系统]    [提交新型号] [电脑版]
```

---

## 6. COLOR SCHEME & DESIGN PATTERNS

### 6.1 Primary Colors
| Color | Hex | Usage |
|---|---|---|
| **Primary Red** | `#c82027` | Links, CTAs, accent text, category highlights |
| **Dark Red** | `#a50001` | Hover states, emphasis |
| **Orange** | `#f90` / `#f60` / `#f1925e` | Price highlights, warm accents |
| **Blue** | `#004a7e` / `#5dacec` / `#659CD8` | Links, trust indicators |
| **Teal** | `#4e9182` | Secondary accent |
| **Dark Gray** | `#333` / `#333333` | Body text |
| **Medium Gray** | `#666` / `#777` | Secondary text |
| **Light Gray** | `#999` / `#ccc` / `#ddd` | Placeholder text, borders |
| **Very Light Gray** | `#eee` / `#f2f2f2` / `#f5f5f5` | Backgrounds, dividers |
| **White** | `#fff` | Main backgrounds |
| **Black** | `#000` | Text on dark backgrounds |

### 6.2 Design Patterns
- **Fixed-width centered layout** (not responsive on PC) with max-width container
- **Tabbed product listing** — Left sidebar categories switch right-side product grid via display:block/none toggling
- **CSS sprite-based brand logos** in brand navigation bar (class names: `phone_logo1` through `phone_logo10`)
- **Slideshow components** using jQuery (slideshow.js, marquee.js)
- **Hover dropdown menus** on main navigation (brand sub-lists per category)
- **Floating sticky elements** — customer service sidebar + QR code popups on hover
- **Server-side rendering** — All pages are PHP-generated static HTML (no SPA framework)
- **CDN for static assets** — `static.lehuiso.com` for product images and banners
- **SEO-friendly URLs** — Product pages have dual URL pattern (`goods.php?id=X` and `goods/goods_X.html`)
- **XHTML transitional** doctype
- **Google Analytics** via cnzz.com (`z_stat.php?id=1000020700`)
- **Live chat** via Clink (`clink.cn` webchat integration)

### 6.3 Typography
- Chinese primary fonts (system defaults, no custom web fonts)
- Size classes: `f16` (16px), `f20` (20px) — utility classes
- Price display in `<span class="price">` with bold red styling
- News dates in `<span class="date">`

### 6.4 UI Components
- **Search bar** with autocomplete dropdown (via AJAX lookup)
- **Product cards** — `<dl class="goods_list">` containing: title, product image, price, trade count
- **News list items** — `<dd>` with title link + GIF icon + date span
- **Slideshow** — `<ul>` based with jQuery SlideShow(5000) for 5s auto-rotation
- **Tab panels** — `<div class="p_right_list">` toggled via JS
- **FAQ accordion** — Click-to-expand question/answer pairs
- **QR code popups** — Hover-triggered `<span class="span1">` popups

---

## 7. CALL-TO-ACTION BUTTONS

| CTA | Location | Target |
|---|---|---|
| "搜索机型" (Search Model) | Homepage search bar | `product_search.php` (POST) |
| "没有我的型号？" (Model not found?) | Below search bar | `noneproduct.php` |
| "常见问题" (FAQ) | Hot search area | `info.php?id=209` |
| "更多>>" (More products) | Product grid per tab | `evaluation_p.php` (appears to be wrong link) |
| "更多>>" (More news) | News section header | `info.php?id=393` |
| "加盟乐回收 >>" (Join franchise) | Footer + Partner section | `join.php` |
| "代理商管理入口 >>" (Agent portal) | Footer | `http://shang.lehuiso.com` |
| "我要加盟" (I want to join) | Mobile footer | `mjoin.php` |
| "大客户入口" (Enterprise entry) | Mobile footer | `mwholesale.php` |
| "提交新型号" (Submit new model) | Mobile footer | `new_sub.php` |
| "电脑版" (PC version) | Mobile footer | `?mobile=no` |
| "在线客服" (Online service) | Floating sidebar | Opens Clink chat widget |

---

## 8. KEY FINDINGS & OBSERVATIONS

1. **NOT a modern SPA** — The site uses traditional PHP server-side rendering with no client-side routing. URLs like `/about`, `/news`, `/join`, `/bidding` return 404; actual URLs are `aboutlehuiso.php`, `info.php?id=X`, `join.php`.

2. **Large product catalog** — 100+ product listings on homepage alone, with trade counts in the hundreds to thousands (e.g., iPhone 16 Pro Max: 2,517 trades).

3. **Strong SEO presence** — Baidu, 360, Shenma verification; canonical URLs; SEO-friendly product URLs; meta keywords/descriptions on every page.

4. **Multi-platform** — Separate PC, mobile (`/m`), and PAD (`/pad`) versions, plus WeChat Mini Program and official WeChat account.

5. **Business model**: Online price assessment → user submits order → door-to-door pickup (Shenzhen) or mail-in (nationwide) → professional inspection → payment.

6. **Franchise network** — Active franchise recruitment with agent management portal at `shang.lehuiso.com`.

7. **Physical stores** — O2O experience stores in Beijing, Guangzhou, Shanghai, Suzhou, and Nanning.

8. **Trust building** — 4.9M+ cumulative users, 41K+ reviews, live recycling ticker, inspection process guide, government compliance badges.

9. **Technology is dated** — jQuery-based, HTML4/XHTML doctype, no responsive design on PC, inline styles heavily used, but functional and content-rich.

10. **The site does NOT have a bidding/auction feature** — There is no bidding page. The `products.php` system is a straightforward price-lookup catalog, not an auction system.
