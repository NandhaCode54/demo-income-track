import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getInitials } from '@/utils/formatters'
import type { FamilyMember } from '@/types'
import { cn } from '@/utils/cn'

type AvatarSize = 'sm' | 'md' | 'lg'

interface MemberAvatarProps {
  member: FamilyMember
  size?: AvatarSize
  showTooltip?: boolean
  className?: string
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

export function MemberAvatar({
  member,
  size = 'md',
  showTooltip = true,
  className,
}: MemberAvatarProps) {
  const initials = getInitials(member.name)

  const avatar = (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none',
        SIZE_CLASSES[size],
        className,
      )}
      style={{ backgroundColor: member.color }}
      aria-label={member.name}
    >
      {initials}
    </div>
  )

  if (!showTooltip) return avatar

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.role}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
