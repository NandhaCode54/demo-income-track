import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PieChart,
  Target,
  BarChart2,
  Calendar,
  Settings,
  Wallet,
  X,
} from 'lucide-react'
import { NAV_ITEMS } from '@/constants'
import { cn } from '@/utils/cn'

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PieChart,
  Target,
  BarChart2,
  BarChart3: BarChart2,
  Calendar,
  Settings,
}

interface SidebarProps {
  isMobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel — always rendered on desktop, conditionally shown on mobile */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col bg-card border-r border-border transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:z-30',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Gradient accent at top */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-t-lg" />

        {/* Logo / app name */}
        <div className="flex items-center gap-3 px-5 pt-7 pb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-foreground truncate">
              Family Finance
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">
              Manager
            </p>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const IconComp = ICON_MAP[item.icon] ?? LayoutDashboard
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => {
                      // close mobile sidebar on nav
                      if (window.innerWidth < 1024) onClose()
                    }}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <IconComp
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground group-hover:text-accent-foreground',
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <motion.span
                            layoutId="active-pill"
                            className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/70"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom user section */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-500 text-xs font-bold text-white">
              FF
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                Family Finance
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                Personal Account
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
