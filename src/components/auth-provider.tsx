'use client';

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth'

/** Paths that don't require authentication */
const PUBLIC_PATHS = ['/login']

/** Inner component that handles route protection */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    const isPublicPath = PUBLIC_PATHS.includes(pathname)

    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login')
    } else if (isAuthenticated && isPublicPath) {
      router.replace('/')
    }
  }, [isAuthenticated, pathname, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/** Enhanced AuthProvider with route protection */
export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  )
}

// Re-export useAuth from the core module
export { useAuth } from '@/lib/auth'
