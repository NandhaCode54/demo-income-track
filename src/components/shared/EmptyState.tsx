import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: () => void
  actionLabel?: string
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className,
      )}
    >
      {/* Icon wrapper */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-5">
        {icon}
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {description}
      </p>

      {action && actionLabel && (
        <Button onClick={action} className="mt-6" size="sm">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
