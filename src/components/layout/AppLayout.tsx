import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { NAV_ITEMS } from '@/constants'

interface AppLayoutProps {
  children: React.ReactNode
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard'
  const found = NAV_ITEMS.find((item) => {
    if (item.path === '/') return false
    return pathname === item.path || pathname.startsWith(item.path + '/')
  })
  return found?.label ?? 'Family Finance Manager'
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <Header
          onMenuClick={() => setIsMobileOpen(true)}
          title={pageTitle}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
