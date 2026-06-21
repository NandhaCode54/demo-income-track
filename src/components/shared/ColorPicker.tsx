import React from 'react'
import { Check } from 'lucide-react'
import { COLORS } from '@/constants'
import { cn } from '@/utils/cn'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
  colors?: string[]
}

export function ColorPicker({
  value,
  onChange,
  className,
  colors = COLORS,
}: ColorPickerProps) {
  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="radiogroup"
      aria-label="Select color"
    >
      {colors.map((color) => {
        const isSelected = value === color
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Color ${color}`}
            onClick={() => onChange(color)}
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isSelected ? 'border-foreground scale-110' : 'border-transparent',
            )}
            style={{ backgroundColor: color }}
          >
            {isSelected && (
              <Check
                className="h-4 w-4 drop-shadow"
                style={{ color: '#ffffff', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
