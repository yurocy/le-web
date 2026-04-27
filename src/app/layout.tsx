import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "乐回收 - 手机回收 | 二手手机回收 | 国内权威二手手机回收网",
  description: "乐回收为用户提供精准的二手手机回收价格评估系统，支持全国范围内在线手机回收业务。业务范围：手机回收、笔记本回收、平板回收、相机回收、游戏机回收等数码电子产品的回收。",
  keywords: "手机回收,二手手机回收,回收手机,旧手机回收,手机估价,iPhone回收,华为回收",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
