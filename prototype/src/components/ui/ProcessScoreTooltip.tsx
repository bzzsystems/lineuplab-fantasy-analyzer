import React from 'react'
import { cn } from '@/lib/utils'
import { 
  HelpCircle,
  Target,
  CheckCircle2,
  TrendingUp,
  Brain,
  Trophy
} from 'lucide-react'

interface ProcessScoreTooltipProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'simple' | 'detailed'
}

export function ProcessScoreTooltip({ 
  className, 
  size = 'sm',
  variant = 'simple' 
}: ProcessScoreTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'

  const renderSimpleTooltip = () => (
    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl max-w-sm text-sm">
      <div className="font-semibold mb-1">🧠 Process Score Explained</div>
      <p className="mb-2 leading-relaxed">
        Your decision-making quality rating (0-10) based on lineup choices, not results.
      </p>
      <div className="text-xs text-slate-300">
        Good process leads to consistent wins over time.
      </div>
    </div>
  )

  const renderDetailedTooltip = () => (
    <div className="bg-slate-900 text-white p-4 rounded-lg shadow-xl max-w-md text-sm">
      <div className="flex items-center space-x-2 mb-3">
        <Target className="w-4 h-4 text-blue-400" />
        <div className="font-semibold">Process Score: Decision Quality Rating</div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="leading-relaxed text-slate-200">
            Measures the <strong>quality of your lineup decisions</strong> before games start, 
            not the lucky or unlucky results.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
            <span className="text-green-200">Starting your best available players</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
            <span className="text-green-200">Avoiding injured/questionable players</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
            <span className="text-green-200">Making smart matchup decisions</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center space-x-1 text-xs text-blue-300">
            <Brain className="w-3 h-3" />
            <span>Better decisions → More consistent wins</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-colors duration-200",
          "hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          size === 'sm' && "w-5 h-5",
          size === 'md' && "w-6 h-6", 
          size === 'lg' && "w-7 h-7"
        )}
        aria-label="Process Score explanation"
      >
        <HelpCircle className={cn(iconSize, "text-slate-500 hover:text-blue-600")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="relative">
            {variant === 'simple' ? renderSimpleTooltip() : renderDetailedTooltip()}
            
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-2 bg-slate-900 rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Standalone educational component for explaining Process Score
export function ProcessScoreExplanation({ className }: { className?: string }) {
  return (
    <div className={cn(
      "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4",
      className
    )}>
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
            <span>What is a Process Score?</span>
            <Trophy className="w-4 h-4 text-blue-600" />
          </h3>
          
          <p className="text-sm text-blue-800 mb-3 leading-relaxed">
            Your Process Score measures the <strong>quality of your lineup decisions</strong> before games start. 
            Unlike fantasy points (which depend on luck), Process Scores focus on whether you made the best 
            choices with the information available.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 bg-white/60 rounded-lg">
              <div className="font-bold text-green-700">8.0+</div>
              <div className="text-xs text-green-600">Elite Decisions</div>
            </div>
            <div className="text-center p-2 bg-white/60 rounded-lg">
              <div className="font-bold text-blue-700">6.0-7.9</div>
              <div className="text-xs text-blue-600">Good Decisions</div>
            </div>
            <div className="text-center p-2 bg-white/60 rounded-lg">
              <div className="font-bold text-amber-700">&lt;6.0</div>
              <div className="text-xs text-amber-600">Room for Improvement</div>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-blue-700">
            <TrendingUp className="w-3 h-3" />
            <span>Improve your process → Win more consistently</span>
          </div>
        </div>
      </div>
    </div>
  )
}