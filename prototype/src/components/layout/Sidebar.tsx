import React from 'react'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  Trophy, 
  Users, 
  TrendingUp, 
  Target,
  PieChart,
  Zap,
  Lock,
  Wifi,
  WifiOff,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
  onConnectClick?: () => void
  onReconnectClick?: () => void
}

// Core functionality - always visible
const coreMenuItems = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Season summary and key insights',
    disabled: false,
    section: 'analyze'
  },
  {
    id: 'league',
    label: 'League Rankings',
    icon: Users,
    description: 'Compare against all league members',
    disabled: false,
    section: 'analyze'
  }
]

// Tools - available when connected
const toolsMenuItems = [
  {
    id: 'compare',
    label: 'Compare Teams',
    icon: Target,
    description: 'Head-to-head team analysis',
    disabled: true,
    premium: true,
    section: 'tools'
  }
]

// Premium features - collapsed by default
const premiumMenuItems = [
  {
    id: 'players',
    label: 'Player Matrix',
    icon: Users,
    description: 'Performance and efficiency analysis',
    disabled: true,
    premium: true,
    section: 'premium'
  },
  {
    id: 'decisions',
    label: 'Decision Quality',
    icon: Target,
    description: 'Start/sit decision analysis',
    disabled: true,
    premium: true,
    section: 'premium'
  },
  {
    id: 'trends',
    label: 'Trends & Patterns',
    icon: TrendingUp,
    description: 'Performance trends over time',
    disabled: true,
    premium: true,
    section: 'premium'
  },
  {
    id: 'competitive',
    label: 'League Intel',
    icon: Trophy,
    description: 'Competitive positioning',
    disabled: true,
    premium: true,
    section: 'premium'
  },
  {
    id: 'insights',
    label: 'AI Insights',
    icon: Zap,
    description: 'Recommendations and tips',
    disabled: true,
    premium: true,
    section: 'premium'
  },
  {
    id: 'analytics',
    label: 'Advanced Analytics',
    icon: PieChart,
    description: 'Deep statistical analysis',
    disabled: true,
    premium: true,
    section: 'premium'
  }
]

export function Sidebar({ activeTab, onTabChange, className, onConnectClick, onReconnectClick }: SidebarProps) {
  // Check connection status
  const [isConnected, setIsConnected] = React.useState(false)
  const [teamName, setTeamName] = React.useState<string | null>(null)
  
  // Collapsible sections state
  const [isPremiumExpanded, setIsPremiumExpanded] = React.useState(false)

  React.useEffect(() => {
    const checkConnection = () => {
      const sessionToken = localStorage.getItem('fantasy-session-token')
      const selectedTeamId = localStorage.getItem('selected-team-id')
      const hasConnection = sessionToken && selectedTeamId
      
      setIsConnected(!!hasConnection)
      
      // Try to get team name from localStorage if available
      const savedTeamName = localStorage.getItem('selected-team-name')
      setTeamName(savedTeamName)
    }

    checkConnection()
    
    // Check periodically in case session expires
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const handleStatusClick = () => {
    if (!isConnected && onConnectClick) {
      onConnectClick()
    }
  }

  const handleDisconnect = () => {
    // Clear all stored session data
    localStorage.removeItem('fantasy-session-token')
    localStorage.removeItem('selected-team-id')
    localStorage.removeItem('selected-team-name')
    localStorage.removeItem('league-id')
    localStorage.removeItem('espn_s2')
    localStorage.removeItem('SWID')
    
    // Clear data cache
    if (typeof window !== 'undefined') {
      try {
        // Clear any cached data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('ff-analyzer-cache') || key.startsWith('dataCache')) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.error('Error clearing cache:', error)
      }
    }
    
    // Refresh the page to reset application state
    window.location.reload()
  }
  return (
    <aside className={cn(
      "w-72 h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 border-r border-slate-200/60 backdrop-blur-sm",
      "flex flex-col overflow-hidden",
      className
    )}>
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">LineupLab</h1>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          
          {/* ANALYZE Section */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-3 px-2 uppercase tracking-wider">
              📊 Analyze
            </div>
            <div className="space-y-1">
              {coreMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "w-full flex items-start space-x-3 p-3 rounded-xl transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30",
                      "group relative",
                      "hover:bg-white/60 hover:shadow-md hover:scale-[1.02]",
                      isActive && [
                        "bg-white shadow-lg border border-primary/20",
                        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                        "before:w-1 before:h-8 before:bg-gradient-to-b before:from-green-500 before:to-blue-600",
                        "before:rounded-r-full"
                      ]
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-br from-green-500 to-blue-600 text-white shadow-md" 
                        : "bg-slate-200/50 text-slate-600 group-hover:bg-slate-300/50"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={cn(
                        "font-medium text-sm",
                        isActive ? "text-slate-900" : "text-slate-700"
                      )}>
                        {item.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* TOOLS Section - only show if connected */}
          {isConnected && (
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-3 px-2 uppercase tracking-wider">
                🛠️ Tools
              </div>
              <div className="space-y-1">
                {toolsMenuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  const isDisabled = item.disabled
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => !isDisabled && onTabChange(item.id)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full flex items-start space-x-3 p-3 rounded-xl transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-primary/30",
                        "group relative",
                        !isDisabled && "hover:bg-white/60 hover:shadow-md hover:scale-[1.02]",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/50 text-slate-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm flex items-center space-x-2 text-slate-700">
                          <span>{item.label}</span>
                          {item.premium && (
                            <Lock className="w-3 h-3 text-amber-500" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* PRO FEATURES Section - Collapsible */}
          <div>
            <button
              onClick={() => setIsPremiumExpanded(!isPremiumExpanded)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 mb-3 px-2 uppercase tracking-wider hover:text-slate-700 transition-colors"
            >
              <span>⚡ Pro Features</span>
              {isPremiumExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
            
            {isPremiumExpanded && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                {premiumMenuItems.map((item) => {
                  const Icon = item.icon
                  
                  return (
                    <div
                      key={item.id}
                      className="w-full flex items-start space-x-3 p-3 rounded-xl opacity-50 cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/50 text-slate-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm flex items-center space-x-2 text-slate-700">
                          <span>{item.label}</span>
                          <Lock className="w-3 h-3 text-amber-500" />
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Coming Soon Notice */}
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200/50 rounded-lg">
                  <div className="text-xs font-medium text-amber-800 mb-1">
                    🚧 Coming Soon
                  </div>
                  <div className="text-xs text-amber-700">
                    Pro features will be available in the next release with advanced analytics and AI insights.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Section - Dynamic Status */}
      <div className="p-4 border-t border-slate-200/60">
        <div 
          className={cn(
            "p-3 rounded-xl border text-center transition-all duration-200",
            isConnected 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/70 hover:from-green-100 hover:to-emerald-100" 
              : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200/70 hover:from-red-100 hover:to-rose-100 cursor-pointer",
            !isConnected && "hover:scale-[1.02] hover:shadow-sm"
          )}
          onClick={handleStatusClick}
          title={!isConnected ? "Click to connect to your ESPN league" : undefined}
        >
          <div className="flex items-center justify-center space-x-2 mb-1">
            <p className="text-xs text-slate-600 font-medium">
              LineupLab v1.0
            </p>
            {isConnected ? (
              <Wifi className="w-3 h-3 text-green-600" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-600" />
            )}
          </div>
          
          {isConnected ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-green-700 font-medium">
                  Connected to ESPN
                </p>
                <button
                  onClick={onReconnectClick}
                  className="p-1 rounded-full hover:bg-green-200 transition-colors"
                  title="Reconnect with different league/season"
                >
                  <Settings className="w-3 h-3 text-green-600" />
                </button>
              </div>
              {teamName && (
                <p className="text-xs text-green-600 truncate">
                  {teamName}
                </p>
              )}
              <p className="text-xs text-green-500 mt-1">
                Click ⚙️ to change league/season
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-red-700 font-medium flex items-center justify-center space-x-1 mb-2">
                <AlertCircle className="w-3 h-3" />
                <span>Not Connected</span>
              </p>
              <button
                onClick={handleStatusClick}
                className="w-full px-2 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 rounded-md text-xs font-medium text-red-700 transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <span>🔗</span>
                <span>Connect to League</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}