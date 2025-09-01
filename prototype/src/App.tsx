import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard'
import { WeeklyAnalysis } from '@/components/dashboard/WeeklyAnalysis'
import { WelcomeFlow } from '@/components/onboarding/WelcomeFlow'
import { ScoringExplanation } from '@/components/dashboard/ScoringExplanation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

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
  const [isScoringDropdownOpen, setIsScoringDropdownOpen] = React.useState(false)
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
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h2>
                {getPageSubtitle() && (
                  <p className="text-sm text-slate-600">{getPageSubtitle()}</p>
                )}
              </div>

              {/* Scoring Explanation Dropdown - Only show on Dashboard Overview */}
              {activeTab === 'overview' && (
                <div className="relative">
                  <button
                    onClick={() => setIsScoringDropdownOpen(!isScoringDropdownOpen)}
                    className={cn(
                      "flex items-center space-x-1 px-2 py-1 text-sm font-medium transition-colors",
                      "text-slate-700 hover:text-slate-900"
                    )}
                  >
                    <span>How Process Scores Are Calculated</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200 text-slate-500",
                      isScoringDropdownOpen && "rotate-180"
                    )} />
                  </button>
                </div>
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

        {/* Scoring Explanation Modal Popup */}
        {isScoringDropdownOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark overlay - click to close */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
              onClick={() => setIsScoringDropdownOpen(false)}
            />
            
            {/* Modal content */}
            <div 
              className="relative bg-white rounded-2xl shadow-2xl w-full h-full max-w-[75vw] max-h-[75vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">How Process Scores Are Calculated</h2>
                <button
                  onClick={() => setIsScoringDropdownOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                
                {/* Algorithm Overview */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Algorithm Overview</span>
                  </h3>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    Your process score measures <strong>decision quality</strong>, not just results. 
                    It uses position-specific performance thresholds (kickers need 12+ for elite, QBs need 25+), then adjusts for projection accuracy and bench management. 
                    This rewards good process even when luck doesn't go your way.
                  </p>
                </div>

                {/* Step-by-Step Breakdown */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 text-base">Step-by-Step Calculation</h3>
                  
                  {/* Step 1: Base Score */}
                  <div className="border border-green-200 bg-green-50 rounded-lg">
                    <div className="p-4 border-b border-green-200">
                      <h4 className="text-sm font-semibold text-green-800 flex items-center space-x-2">
                        <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span>Performance-Based Starting Score</span>
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-green-700 text-sm">
                        Your base score depends on position-specific performance thresholds:
                      </p>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="p-2 bg-white/60 rounded border border-green-200">
                          <div className="font-semibold text-green-800 mb-1">Elite Performance (8.0/10)</div>
                          <div className="text-green-700">QB: 25+ pts | RB/WR: 20+ pts | TE: 15+ pts | K: 12+ pts | D/ST: 15+ pts</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-green-200">
                          <div className="font-semibold text-blue-800 mb-1">Strong Performance (7.0/10)</div>
                          <div className="text-blue-700">QB: 20+ pts | RB/WR: 15+ pts | TE: 12+ pts | K: 9+ pts | D/ST: 10+ pts</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-green-200">
                          <div className="font-semibold text-slate-800 mb-1">Good Performance (6.0/10)</div>
                          <div className="text-slate-700">QB: 15+ pts | RB/WR: 10+ pts | TE: 8+ pts | K: 6+ pts | D/ST: 6+ pts</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-green-200">
                          <div className="font-semibold text-amber-800 mb-1">Average Performance (5.0/10)</div>
                          <div className="text-amber-700">QB: 10+ pts | RB/WR: 6+ pts | TE: 5+ pts | K: 3+ pts | D/ST: 2+ pts</div>
                        </div>
                      </div>
                      <div className="p-3 bg-green-100 rounded border border-green-300">
                        <div className="font-semibold text-green-800 text-sm mb-1">Example:</div>
                        <div className="text-green-700 text-sm">
                          Jayden Daniels scores 28.16 points → Gets 8.0 base score (Elite performance)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Projection Adjustment */}
                  <div className="border border-purple-200 bg-purple-50 rounded-lg">
                    <div className="p-4 border-b border-purple-200">
                      <h4 className="text-sm font-semibold text-purple-800 flex items-center space-x-2">
                        <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span>Projection Accuracy Bonus/Penalty</span>
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-purple-700 text-sm">
                        Rewards beating projections, penalizes major misses:
                      </p>
                      <div className="grid grid-cols-1 gap-3 text-xs">
                        <div className="p-2 bg-white/60 rounded border border-purple-200">
                          <div className="font-semibold text-green-800">Beat projection by 40%+</div>
                          <div className="text-green-700">+1.0 bonus (great process/luck)</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-purple-200">
                          <div className="font-semibold text-slate-800">Within 30% of projection</div>
                          <div className="text-slate-700">No adjustment (expected)</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-purple-200">
                          <div className="font-semibold text-red-800">Miss projection by 30%+</div>
                          <div className="text-red-700">-0.5 penalty (poor process/luck)</div>
                        </div>
                      </div>
                      <div className="p-3 bg-purple-100 rounded border border-purple-300">
                        <div className="font-semibold text-purple-800 text-sm mb-1">Example:</div>
                        <div className="text-purple-700 text-sm">
                          Daniels projected 18.1, scored 28.16 (+55%) → Gets +1.0 bonus = 9.0 total
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Bench Comparison */}
                  <div className="border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="p-4 border-b border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 flex items-center space-x-2">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span>Bench Management Assessment</span>
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-blue-700 text-sm">
                        Only applies when you had alternative players available:
                      </p>
                      <div className="grid grid-cols-1 gap-3 text-xs">
                        <div className="p-2 bg-white/60 rounded border border-blue-200 border-l-4 border-l-green-500">
                          <div className="font-semibold text-green-800">Started higher scorer</div>
                          <div className="text-green-700">+1.5 bonus (correct choice)</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-blue-200 border-l-4 border-l-red-500">
                          <div className="font-semibold text-red-800">Missed opportunity</div>
                          <div className="text-red-700">-1.0 to -2.5 penalty (scaled by points missed)</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-blue-200 border-l-4 border-l-slate-500">
                          <div className="font-semibold text-slate-800">No alternatives (TE, K, D/ST)</div>
                          <div className="text-slate-700">No adjustment (can't control what you don't have)</div>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-100 rounded border border-blue-300">
                        <div className="font-semibold text-blue-800 text-sm mb-1">Example:</div>
                        <div className="text-blue-700 text-sm">
                          Started Daniels (28.16) over Tua (19.6) → Gets +1.5 bonus = 10.5 total (capped at 10.0)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Bonus Adjustments */}
                  <div className="border border-amber-200 bg-amber-50 rounded-lg">
                    <div className="p-4 border-b border-amber-200">
                      <h4 className="text-sm font-semibold text-amber-800 flex items-center space-x-2">
                        <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <span>Situational Bonuses</span>
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-amber-700 text-sm">
                        Additional context-based adjustments:
                      </p>
                      <div className="grid grid-cols-1 gap-3 text-xs">
                        <div className="p-2 bg-white/60 rounded border border-amber-200">
                          <div className="font-semibold text-green-800">Strong performance + team won</div>
                          <div className="text-green-700">+0.5 bonus (capitalized on good game script)</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-amber-200">
                          <div className="font-semibold text-blue-800">Excellent matchup exploitation</div>
                          <div className="text-blue-700">+0.5 bonus (smart streaming/matchups)</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-amber-200">
                          <div className="font-semibold text-red-800">Started obviously injured player</div>
                          <div className="text-red-700">-2.5 penalty (avoidable mistake)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real Examples */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 text-base flex items-center space-x-2">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span>Real Examples from Week 1</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Perfect Score Example */}
                    <div className="border border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <div className="p-4 border-b border-green-200">
                        <h4 className="text-sm text-green-800 flex items-center justify-between">
                          <span>🔥 Perfect Score (10.0/10)</span>
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">10/10</span>
                        </h4>
                      </div>
                      <div className="p-4 space-y-2 text-xs">
                        <div className="font-semibold text-green-900">Jayden Daniels (QB)</div>
                        <div className="space-y-1 text-green-800">
                          <div>• Base: 8.0 (Elite 28.16 points)</div>
                          <div>• Projection: +1.0 (beat 18.1 by 55%)</div>
                          <div>• Bench: +1.5 (beat Tua's 19.6)</div>
                          <div>• <strong>Total: 10.5 → 10.0 (capped)</strong></div>
                        </div>
                        <div className="p-2 bg-green-200 rounded text-green-800">
                          <strong>Why perfect:</strong> Elite performance + beat projection + beat bench option
                        </div>
                      </div>
                    </div>

                    {/* Average Score Example */}
                    <div className="border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                      <div className="p-4 border-b border-slate-200">
                        <h4 className="text-sm text-slate-800 flex items-center justify-between">
                          <span>📈 Average Score (5.0/10)</span>
                          <span className="bg-slate-600 text-white px-2 py-1 rounded-full text-xs font-bold">5/10</span>
                        </h4>
                      </div>
                      <div className="p-4 space-y-2 text-xs">
                        <div className="font-semibold text-slate-900">James Cook (RB)</div>
                        <div className="space-y-1 text-slate-800">
                          <div>• Base: 6.0 (Good 11.8 points)</div>
                          <div>• Projection: 0 (within range of 15.6)</div>
                          <div>• Bench: -1.0 (Montgomery had 12.1)</div>
                          <div>• <strong>Total: 5.0</strong></div>
                        </div>
                        <div className="p-2 bg-slate-200 rounded text-slate-800">
                          <strong>Why average:</strong> Good performance but missed slight bench opportunity
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Principles */}
                <div className="border border-slate-200 bg-gradient-to-br from-slate-50 to-white rounded-lg">
                  <div className="p-4 border-b border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Key Principles</span>
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="font-semibold text-green-800 flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span>Rewards Good Process</span>
                        </div>
                        <ul className="text-green-700 space-y-1 text-xs ml-6">
                          <li>• Elite performances get high base scores</li>
                          <li>• Beating projections shows good decision-making</li>
                          <li>• Starting better players than bench options</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold text-red-800 flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.734-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span>Penalizes Poor Process</span>
                        </div>
                        <ul className="text-red-700 space-y-1 text-xs ml-6">
                          <li>• Zero points get very low base scores</li>
                          <li>• Major projection misses reduce scores</li>
                          <li>• Missing clear bench upgrades</li>
                        </ul>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="text-blue-900 text-sm font-semibold mb-1">Remember:</div>
                      <div className="text-blue-800 text-sm">
                        Process scores measure your <strong>decision quality</strong>, not just luck. 
                        A 7.0+ average shows strong fantasy management skills that will pay off over a full season.
                      </div>
                    </div>
                  </div>
                </div>
                
                </div>
              </div>
            </div>
          </div>
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