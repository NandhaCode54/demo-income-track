import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'

interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
  iconBg?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  prefix?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  iconBg = 'bg-primary/10',
  trend,
  trendValue,
  prefix,
  className,
}: StatCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-[hsl(var(--success))]'
      : trend === 'down'
      ? 'text-destructive'
      : 'text-muted-foreground'

  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            {/* Icon */}
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                iconBg,
              )}
            >
              {icon}
            </div>

            {/* Trend badge */}
            {trend && trendValue && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-semibold',
                  trendColor,
                )}
              >
                <TrendIcon className="h-3 w-3" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg sm:text-2xl font-bold tracking-tight text-foreground break-all">
              {prefix && (
                <span className="text-lg font-semibold text-muted-foreground mr-0.5">
                  {prefix}
                </span>
              )}
              {value}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
