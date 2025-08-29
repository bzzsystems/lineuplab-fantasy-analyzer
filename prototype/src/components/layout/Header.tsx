import React from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function Header({ title, subtitle, className }: HeaderProps) {
  return (
    <header className={cn(
      "h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60",
      "flex items-center px-6 lg:px-8",
      className
    )}>
      {/* Title Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-slate-600">{subtitle}</p>
        )}
      </div>
    </header>
  )
}