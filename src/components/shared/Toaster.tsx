import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import type { ToastType } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ElementType; containerClass: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    containerClass: 'bg-success/10 border-success/30 text-foreground',
    iconClass: 'text-success',
  },
  error: {
    icon: XCircle,
    containerClass: 'bg-destructive/10 border-destructive/30 text-foreground',
    iconClass: 'text-destructive',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-warning/10 border-warning/30 text-foreground',
    iconClass: 'text-warning',
  },
  info: {
    icon: Info,
    containerClass: 'bg-primary/10 border-primary/30 text-foreground',
    iconClass: 'text-primary',
  },
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed right-4 top-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type]
          const IconComp = config.icon

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
                config.containerClass,
              )}
            >
              <IconComp
                className={cn('mt-0.5 h-4 w-4 shrink-0', config.iconClass)}
              />
              <p className="flex-1 text-sm leading-snug">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
