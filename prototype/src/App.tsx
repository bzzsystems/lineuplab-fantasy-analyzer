import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard'
import { WeeklyAnalysis } from '@/components/dashboard/WeeklyAnalysis'
import { WelcomeFlow } from '@/components/onboarding/WelcomeFlow'
import { cn } from '@/lib/utils'

// Placeholder components for other tabs
const PlayerMatrix = () => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center border border-blue-200/50">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Player Performance Matrix</h3>
        <p className="text-slate-600">Detailed player efficiency analysis coming soon...</p>
      </div>
    </div>
  </div>
)

const DecisionQuality = () => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="h-96 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center border border-green-200/50">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Decision Quality Analysis</h3>
        <p className="text-slate-600">Start/sit decision patterns and recommendations...</p>
      </div>
    </div>
  </div>
)

const TrendsPatterns = () => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="h-96 bg-gradient-to-br from-purple-50 to-purple-50 rounded-xl flex items-center justify-center border border-purple-200/50">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Trends & Patterns</h3>
        <p className="text-slate-600">Performance trends and predictive analytics...</p>
      </div>
    </div>
  </div>
)

const CompetitiveIntel = () => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="h-96 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center border border-amber-200/50">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">League Intelligence</h3>
        <p className="text-slate-600">Competitive positioning and opponent analysis...</p>
      </div>
    </div>
  </div>
)

const AIInsights = () => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="h-96 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl flex items-center justify-center border border-cyan-200/50">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">AI-Powered Insights</h3>
        <p className="text-slate-600">Personalized recommendations and strategy tips...</p>
      </div>
    </div>
  </div>
)

const AdvancedAnalytics = () => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="h-96 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl flex items-center justify-center border border-rose-200/50">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Advanced Analytics</h3>
        <p className="text-slate-600">Deep statistical analysis and modeling...</p>
      </div>
    </div>
  </div>
)

function App() {
  const [activeTab, setActiveTab] = React.useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [welcomeInitialStep, setWelcomeInitialStep] = React.useState(0)
  const [selectedSeason, setSelectedSeason] = React.useState(() => {
    // Default to current year, but allow override from localStorage
    const savedSeason = localStorage.getItem('selected-season')
    return savedSeason ? parseInt(savedSeason) : 2024
  })
  const [isConnected, setIsConnected] = React.useState(false)
  
  // Check if user has completed onboarding and has session
  const [showWelcome, setShowWelcome] = React.useState(() => {
    const hasCompletedOnboarding = localStorage.getItem('ff-analyzer-onboarding-complete')
    const hasSession = localStorage.getItem('fantasy-session-token')
    setIsConnected(!!hasSession)
    // Show welcome if they haven't completed onboarding OR don't have a session
    return !hasCompletedOnboarding || !hasSession
  })

  // Check connection status periodically
  React.useEffect(() => {
    const checkConnection = () => {
      const hasSession = localStorage.getItem('fantasy-session-token')
      setIsConnected(!!hasSession)
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  const handleWelcomeComplete = () => {
    localStorage.setItem('ff-analyzer-onboarding-complete', 'true')
    setShowWelcome(false)
    setWelcomeInitialStep(0) // Reset to first step for future uses
    setActiveTab('login') // Direct them to connection flow
  }

  const handleReconnectClick = () => {
    // Show welcome flow starting at the final step (index 3)
    setWelcomeInitialStep(3)
    setShowWelcome(true)
  }

  const handleSeasonChange = (year: number) => {
    setSelectedSeason(year)
    localStorage.setItem('selected-season', year.toString())
    // Clear data cache when season changes to force refresh
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ff-analyzer-cache') || key.startsWith('dataCache')) {
        localStorage.removeItem(key)
      }
    })
    // Refresh the page to reload data for new season
    window.location.reload()
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
      case 'league':
      case 'compare':
      case 'login':
        return <OverviewDashboard activeView={activeTab} selectedYear={selectedSeason} />
      case 'players':
        return <PlayerMatrix />
      case 'decisions':
        return <DecisionQuality />
      case 'trends':
        return <TrendsPatterns />
      case 'competitive':
        return <CompetitiveIntel />
      case 'insights':
        return <AIInsights />
      case 'analytics':
        return <AdvancedAnalytics />
      default:
        return <OverviewDashboard activeView="overview" />
    }
  }

  const getPageTitle = () => {
    const titles = {
      overview: 'Dashboard Overview',
      weekly: 'Weekly Analysis',
      players: 'Player Matrix',
      decisions: 'Decision Quality',
      trends: 'Trends & Patterns',
      competitive: 'League Intelligence',
      insights: 'AI Insights',
      analytics: 'Advanced Analytics'
    }
    return titles[activeTab as keyof typeof titles] || 'Dashboard'
  }

  const getPageSubtitle = () => {
    const subtitles = {
      overview: 'Season Performance Summary',
      weekly: 'Detailed Week-by-Week Analysis',
      players: 'Player Performance & Efficiency Matrix',
      decisions: 'Start/Sit Decision Analysis',
      trends: 'Performance Trends Over Time',
      competitive: 'League Positioning & Strategy',
      insights: 'AI-Powered Recommendations',
      analytics: 'Deep Statistical Analysis'
    }
    return subtitles[activeTab as keyof typeof subtitles]
  }

  // Show welcome flow for first-time users
  if (showWelcome) {
    return <WelcomeFlow onGetStarted={handleWelcomeComplete} initialStep={welcomeInitialStep} />
  }

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setIsMobileMenuOpen(false)
        }}
        onConnectClick={() => {
          setActiveTab('login')
          setIsMobileMenuOpen(false)
        }}
        onReconnectClick={handleReconnectClick}
        className={cn(
          "fixed lg:relative z-50 lg:z-auto",
          "transform lg:transform-none transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Season Selector */}
        {!showWelcome && (
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h2>
              {getPageSubtitle() && (
                <p className="text-sm text-slate-600">{getPageSubtitle()}</p>
              )}
            </div>
            
            {/* Season Selector - Only show when connected */}
            {!showWelcome && isConnected && (
              <div className="flex items-center space-x-2">
                <label htmlFor="season-select" className="text-sm font-medium text-slate-700">
                  Season:
                </label>
                <select
                  id="season-select"
                  value={selectedSeason}
                  onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  {Array.from({ length: 10 }, (_, i) => 2024 - i).map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </header>
        )}
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:pl-8 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={cn(
          "fixed top-4 left-4 z-50 lg:hidden",
          "w-10 h-10 rounded-lg bg-white shadow-lg border border-slate-200",
          "flex items-center justify-center",
          "hover:bg-slate-50 transition-colors"
        )}
      >
        <div className="w-5 h-4 flex flex-col justify-between">
          <div className={cn(
            "h-0.5 bg-slate-700 rounded transition-transform",
            isMobileMenuOpen && "rotate-45 translate-y-1.5"
          )} />
          <div className={cn(
            "h-0.5 bg-slate-700 rounded transition-opacity",
            isMobileMenuOpen && "opacity-0"
          )} />
          <div className={cn(
            "h-0.5 bg-slate-700 rounded transition-transform",
            isMobileMenuOpen && "-rotate-45 -translate-y-1.5"
          )} />
        </div>
      </button>
    </div>
  )
}

export default App