import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  className?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex items-center justify-center min-h-[400px] p-8", 
      className
    )}>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-slate-900 mb-3">
          {title}
        </h3>
        
        <p className="text-slate-600 mb-6 leading-relaxed">
          {description}
        </p>
        
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm",
              action.variant === 'secondary' 
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200" 
                : "bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 hover:shadow-lg hover:scale-[1.02]"
            )}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}