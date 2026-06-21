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
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            {/* Icon */}
            <div
              className={cn(
                'flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl',
                iconBg,
              )}
            >
              {/* Scale icon down on mobile via wrapper */}
              <span className="[&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
                {icon}
              </span>
            </div>

            {/* Trend badge */}
            {trend && trendValue && (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold',
                  trendColor,
                )}
              >
                <TrendIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>

          <div className="mt-2 sm:mt-4">
            <p className="text-[11px] sm:text-sm text-muted-foreground leading-tight">{label}</p>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {prefix && (
                <span className="text-xs sm:text-lg font-semibold text-muted-foreground mr-0.5">
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
