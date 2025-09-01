import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { ScoringExplanation } from '@/components/dashboard/ScoringExplanation'

interface HeaderProps {
  title: string
  subtitle?: string
  className?: string
  showScoringDropdown?: boolean
}

export function Header({ title, subtitle, className, showScoringDropdown = false }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

  return (
    <header className={cn(
      "h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60",
      "flex items-center justify-between px-6 lg:px-8",
      className
    )}>
      {/* Title Section */}
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-600">{subtitle}</p>
          )}
        </div>

        {/* Scoring Explanation Dropdown */}
        {showScoringDropdown && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                "flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
                isDropdownOpen && "bg-blue-100"
              )}
            >
              <span>How Process Scores Are Calculated</span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                isDropdownOpen && "rotate-180"
              )} />
            </button>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-96 z-50">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200/60 overflow-hidden">
                  <ScoringExplanation className="m-0 border-0 rounded-none" />
                </div>
              </div>
            )}

            {/* Click outside to close */}
            {isDropdownOpen && (
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}
          </div>
        )}
      </div>
    </header>
  )
}