"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Package,
  Warehouse,
  Handshake,
  ShoppingBag,
  DollarSign,
  Gavel,
  FileText,
  Database,
  ChevronRight,
  LogOut,
  KeyRound,
  UserPlus,
  Users,
  Shield,
  Menu,
  FileClock,
  Tags,
  CreditCard,
  ClipboardList,
  Ticket,
  BarChart3,
  Inbox,
  UserCog,
  MapPin,
  Building2,
  QrCode,
  RotateCcw,
  BadgeCheck,
  Globe,
  Layers,
  Star,
  ShoppingCart,
  Percent,
  ListChecks,
  Newspaper,
  MessageSquare,
  Image,
  Landmark,
  UserCircle,
  Truck,
} from "lucide-react";

import { useAppStore } from "@/lib/store";

type BreadcrumbItemType = { label: string; href?: string };
import { useAuth } from "@/lib/auth";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ─── Menu configuration ─────────────────────────────────────────────────────

interface MenuGroup {
  label: string;
  icon: React.ElementType;
  items: { label: string; href: string; icon?: React.ElementType }[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "系统管理",
    icon: Settings,
    items: [
      { label: "管理员管理", href: "/system/admin", icon: Users },
      { label: "角色管理", href: "/system/role", icon: Shield },
      { label: "菜单管理", href: "/system/menu", icon: Menu },
      { label: "操作日志", href: "/system/log", icon: FileClock },
    ],
  },
  {
    label: "产品管理",
    icon: Package,
    items: [
      { label: "产品分类", href: "/product/category", icon: Tags },
      { label: "品牌管理", href: "/product/brand", icon: Layers },
      { label: "产品列表", href: "/product/list", icon: ClipboardList },
      { label: "订单管理", href: "/product/order", icon: CreditCard },
      { label: "描述包", href: "/product/desc", icon: FileText },
      { label: "加价券", href: "/product/coupon", icon: Ticket },
    ],
  },
  {
    label: "库存管理",
    icon: Warehouse,
    items: [
      { label: "收货管理", href: "/stock/goods", icon: Inbox },
      { label: "库存统计", href: "/stock/statistics", icon: BarChart3 },
      { label: "管理账号", href: "/stock/admin", icon: UserCog },
      { label: "收货来源", href: "/stock/source", icon: MapPin },
    ],
  },
  {
    label: "合作管理",
    icon: Handshake,
    items: [
      { label: "代理管理", href: "/partner/agent", icon: Users },
      { label: "商家管理", href: "/partner/merchant", icon: Building2 },
      { label: "门店管理", href: "/partner/store", icon: Globe },
      { label: "授权码", href: "/partner/key", icon: QrCode },
      { label: "批量回收", href: "/partner/wholesale", icon: RotateCcw },
      { label: "加盟申请", href: "/partner/joinin", icon: BadgeCheck },
      { label: "子站管理", href: "/partner/subweb", icon: Globe },
    ],
  },
  {
    label: "分销管理",
    icon: ShoppingBag,
    items: [
      { label: "商品管理", href: "/sale/goods", icon: ShoppingCart },
      { label: "客户管理", href: "/sale/user", icon: UserCircle },
      { label: "竞拍订单", href: "/sale/order", icon: ListChecks },
    ],
  },
  {
    label: "报价管理",
    icon: DollarSign,
    items: [
      { label: "报价分类", href: "/pricing/category", icon: Tags },
      { label: "品牌管理", href: "/pricing/brand", icon: Layers },
      { label: "用户管理", href: "/pricing/user", icon: Users },
      { label: "报价列表", href: "/pricing/list", icon: Percent },
    ],
  },
  {
    label: "竞拍管理",
    icon: Gavel,
    items: [
      { label: "竞拍分类", href: "/bidding/category", icon: Tags },
      { label: "品牌", href: "/bidding/brand", icon: Layers },
      { label: "类型", href: "/bidding/type", icon: ListChecks },
      { label: "用户", href: "/bidding/user", icon: Users },
      { label: "商品", href: "/bidding/goods", icon: Package },
      { label: "竞拍订单", href: "/bidding/order", icon: Gavel },
    ],
  },
  {
    label: "内容管理",
    icon: FileText,
    items: [
      { label: "文章分类", href: "/article/category", icon: Tags },
      { label: "文章列表", href: "/article/list", icon: Newspaper },
      { label: "评论管理", href: "/article/comment", icon: MessageSquare },
    ],
  },
  {
    label: "基础数据",
    icon: Database,
    items: [
      { label: "网站配置", href: "/web/config", icon: Settings },
      { label: "轮播图", href: "/web/banner", icon: Image },
      { label: "银行列表", href: "/web/bank", icon: Landmark },
      { label: "会员管理", href: "/web/member", icon: Star },
      { label: "快递公司", href: "/web/express", icon: Truck },
    ],
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Build breadcrumb items from pathname */
function deriveBreadcrumbs(pathname: string): BreadcrumbItemType[] {
  const items: BreadcrumbItemType[] = [{ label: "仪表盘", href: "/" }];

  if (pathname === "/") return items;

  const segments = pathname.split("/").filter(Boolean);
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;

    // Try to find the label from menu configuration
    let label = segments[i];
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (item.href === currentPath) {
          label = item.label;
          break;
        }
      }
      if (label !== segments[i]) break;
    }

    items.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  }

  return items;
}

function AppSidebar() {
  const pathname = usePathname();

  // Determine which groups are currently open (based on active route)
  const openGroups = useMemo(() => {
    const open = new Set<string>();
    for (const group of menuGroups) {
      if (group.items.some((item) => pathname.startsWith(item.href))) {
        open.add(group.label);
      }
    }
    return open;
  }, [pathname]);

  // Track which groups are manually toggled open
  const [manuallyOpened, setManuallyOpened] = React.useState<Set<string>>(
    new Set(),
  );

  const isGroupOpen = (label: string) =>
    openGroups.has(label) || manuallyOpened.has(label);

  const toggleGroup = (label: string) => {
    setManuallyOpened((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">LeGo Admin</span>
                  <span className="text-xs text-muted-foreground">
                    管理后台
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Menu */}
      <SidebarContent>
        {/* Dashboard entry */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/"}
                  tooltip="仪表盘"
                >
                  <Link href="/">
                    <LayoutDashboard />
                    <span>仪表盘</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business module groups */}
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <Collapsible open={isGroupOpen(group.label)}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <group.icon className="size-4" />
                    <span>{group.label}</span>
                  </span>
                  <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const Icon = item.icon || group.icon;
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname === item.href}
                            tooltip={item.label}
                          >
                            <Link href={item.href}>
                              <Icon />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="size-8">
                <AvatarImage
                  src={undefined}
                  alt="avatar"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  A
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm font-medium">Admin</span>
                <span className="text-xs text-muted-foreground">超级管理员</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function Header({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
  const { user, logout } = useAuth();

  const displayName = user?.nickname || user?.username || "Admin";
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      {/* Sidebar trigger */}
      <SidebarTrigger className="-ml-1" />

      {/* Separator */}
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Breadcrumbs */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`${item.label}-${idx}`}>
                {idx > 0 && <BreadcrumbSeparator />}
                <li>
                  {isLast || !item.href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href!}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors outline-none">
            <Avatar className="size-7">
              <AvatarImage src={user?.avatar} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline-block max-w-[120px] truncate">
              {displayName}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-pointer">
            <KeyRound className="mr-2 size-4" />
            修改密码
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={logout}
          >
            <LogOut className="mr-2 size-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);

  // Derive and store breadcrumbs
  const breadcrumbs = useMemo(() => deriveBreadcrumbs(pathname), [pathname]);

  useEffect(() => {
    setBreadcrumbs(breadcrumbs);
  }, [breadcrumbs, setBreadcrumbs]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminLayout;
