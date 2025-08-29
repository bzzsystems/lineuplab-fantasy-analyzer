import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeekDetailModal } from './WeekDetailModal'
import { ScoringExplanation } from './ScoringExplanation'
import { LeagueLeaderboard } from './LeagueLeaderboard'
import { TeamComparison } from './TeamComparison'
import { LeagueLoginFlow } from './LeagueLoginFlow'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConnectionGuide } from '@/components/ui/ConnectionGuide'
import { ProcessScoreTooltip, ProcessScoreExplanation } from '@/components/ui/ProcessScoreTooltip'
import { useTeamData } from '@/hooks/useTeamData'
import { apiService } from '@/services/api'
import { dataCache } from '@/utils/dataCache'
import { cn } from '@/lib/utils'
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Zap,
  ArrowUp,
  ArrowDown,
  Calendar,
  Award,
  Users,
  BarChart3,
  Loader2,
  Lock,
  AlertCircle
} from 'lucide-react'

interface OverviewDashboardProps {
  activeView?: string
  selectedYear?: number
}

export function OverviewDashboard({ activeView: externalActiveView, selectedYear = 2024 }: OverviewDashboardProps = {}) {
  const [selectedWeek, setSelectedWeek] = React.useState<number | null>(null)
  const [selectedWeekData, setSelectedWeekData] = React.useState<any>(null)
  const [leagueData, setLeagueData] = React.useState<any>(null)
  const [isLoadingWeekData, setIsLoadingWeekData] = React.useState(false)
  const [isLoadingLeague, setIsLoadingLeague] = React.useState(false)
  const [hasInitialLoad, setHasInitialLoad] = React.useState(false)
  const { seasonData, isLoading, error, fetchWeekData, fetchSeasonData, teamId, loadingProgress } = useTeamData(selectedYear)
  
  // Check if user has session token, if not default to login/setup
  const hasSession = React.useMemo(() => {
    return localStorage.getItem('fantasy-session-token') !== null
  }, [])
  
  // Map external activeView to internal view names
  const getActiveView = () => {
    if (externalActiveView) {
      switch (externalActiveView) {
        case 'overview': return 'personal'
        case 'league': return 'league'
        case 'compare': return 'compare'  
        case 'login': return 'login'
        default: return hasSession ? 'personal' : 'login'
      }
    }
    return hasSession ? 'personal' : 'login'
  }
  
  const activeView = getActiveView()
  const setActiveView = React.useCallback(() => {
    // This is now read-only since it's controlled by parent
  }, [])

  // Lazy load league data - only fetch when needed and cache it
  const fetchLeagueData = React.useCallback(async (force = false) => {
    if (!hasSession || !teamId) return null

    // Check cache first
    if (!force) {
      const cachedData = dataCache.get('leagueData')
      if (cachedData) {
        setLeagueData(cachedData)
        return cachedData
      }
    }

    setIsLoadingLeague(true)
    try {
      console.log('🏆 Fetching league data for year:', selectedYear)
      const data = await apiService.getLeagueAnalysis(selectedYear)
      if (data) {
        dataCache.set('leagueData', data)
        setLeagueData(data)
      }
      return data
    } catch (error) {
      console.error('Failed to fetch league data:', error)
      return null
    } finally {
      setIsLoadingLeague(false)
    }
  }, [hasSession, teamId])

  // Load season data only when viewing personal dashboard
  const ensureSeasonData = React.useCallback(async () => {
    if (!hasSession || !teamId || hasInitialLoad) return

    console.log('📊 Loading season data...')
    await fetchSeasonData()
    setHasInitialLoad(true)
  }, [hasSession, teamId, hasInitialLoad, fetchSeasonData])

  // Handle week navigation in modal
  const handleWeekChange = async (newWeek: number) => {
    if (!teamId) return
    
    setIsLoadingWeekData(true)
    setSelectedWeek(newWeek)
    
    try {
      const weeklyData = await fetchWeekData(newWeek)
      setSelectedWeekData(weeklyData)
    } catch (error) {
      console.error('Failed to fetch week data:', error)
    } finally {
      setIsLoadingWeekData(false)
    }
  }

  // Lazy load league data when league tab is clicked
  React.useEffect(() => {
    if (activeView === 'league' && !leagueData && !isLoadingLeague) {
      fetchLeagueData()
    }
  }, [activeView, leagueData, isLoadingLeague, fetchLeagueData])

  // Load season data when personal dashboard is viewed
  React.useEffect(() => {
    if (activeView === 'personal' && !hasInitialLoad) {
      ensureSeasonData()
    }
  }, [activeView, hasInitialLoad, ensureSeasonData])

  const renderContent = () => {
    switch (activeView) {
      case 'league':
        return <LeagueLeaderboard isLoading={isLoadingLeague} leagueData={leagueData} />
      case 'compare': 
        return <TeamComparison />
      case 'login':
        return <LeagueLoginFlow onSetupComplete={() => window.location.reload()} />
      default:
        return renderPersonalDashboard()
    }
  }

  const renderPersonalDashboard = () => {
    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Loading your fantasy analysis...</p>
            {loadingProgress ? (
              <div className="mt-3">
                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-slate-500 text-sm">
                  Loaded {loadingProgress.loaded} of {loadingProgress.total} weeks
                  {loadingProgress.weeks.length > 0 && (
                    <span className="block mt-1 text-xs">
                      Latest: {loadingProgress.weeks.slice(-3).join(', ')}
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm mt-2">Fast loading optimized - should complete in 15-30 seconds</p>
            )}
          </div>
        </div>
      )
    }

    // Show error state - if authentication error, redirect to login
    if (error) {
      if (error.includes('authenticate') || error.includes('token') || error.includes('401')) {
        // Clear invalid session and redirect to login
        localStorage.removeItem('fantasy-session-token')
        return <LeagueLoginFlow onSetupComplete={() => window.location.reload()} />
      }
      return (
        <EmptyState
          icon={AlertCircle}
          title="Unable to Load Your Data"
          description={`We encountered an issue loading your fantasy data: ${error}. Please try refreshing the page or reconnecting your league.`}
          action={{
            label: "Refresh Page",
            onClick: () => window.location.reload(),
            variant: "secondary"
          }}
        />
      )
    }

    // Show message if no data available
    if (!seasonData) {
      return <LeagueLoginFlow onSetupComplete={() => window.location.reload()} />
    }

    return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. How Process Scores are Calculated - First */}
      <ScoringExplanation />

      {/* 2. Process Score Education - Help users understand the core concept */}
      <ProcessScoreExplanation />

      {/* 3. Weekly Performance Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Weekly Performance</span>
            </div>
            <div className="text-sm text-slate-600 font-normal">
              Click any week for details
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop/Tablet: Horizontal scroll */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex space-x-3 min-w-max px-1 py-2">
              {(seasonData.weeklyPerformance || []).map((weekData, index) => {
                const week = weekData.week
                
                const isElite = weekData.processScore >= 8.0
                const isStrong = weekData.processScore >= 6.5
                const isPoor = weekData.processScore < 5.0
                
                let borderColor = "border-slate-300"
                if (isElite) borderColor = "border-green-500"
                else if (isStrong) borderColor = "border-blue-500"
                else if (isPoor) borderColor = "border-red-500"
                else borderColor = "border-yellow-400"
                
                return (
                  <div
                    key={week}
                    className={cn(
                      "w-32 flex-shrink-0 bg-white rounded-xl border-2 transition-all duration-200",
                      "hover:shadow-lg hover:scale-[1.02] cursor-pointer p-3",
                      borderColor
                    )}
                    onClick={() => handleWeekChange(week)}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-slate-600">Week {week}</div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isElite ? "bg-green-500" : 
                        isStrong ? "bg-blue-500" : 
                        isPoor ? "bg-red-500" : "bg-yellow-400"
                      )}></div>
                    </div>
                    
                    {/* Points */}
                    <div className="text-lg font-bold text-slate-900 mb-1">
                      {weekData.points.toFixed(0)}
                    </div>
                    
                    {/* Top Player */}
                    <div className="text-xs text-slate-600 mb-1 truncate">
                      🏆 {weekData.topPlayer}
                    </div>
                    <div className="text-xs font-medium text-slate-800 mb-2">
                      {weekData.topPoints.toFixed(1)} pts
                    </div>
                    
                    {/* Process Score */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-500">Process:</span>
                        <ProcessScoreTooltip size="sm" />
                      </div>
                      <span className={cn(
                        "font-medium",
                        weekData.processScore >= 7 ? "text-green-600" :
                        weekData.processScore >= 5 ? "text-amber-600" : "text-red-600"
                      )}>
                        {weekData.processScore}/10
                      </span>
                    </div>
                    
                    {/* Big Miss Indicator */}
                    {weekData.bigMiss && (
                      <div className="mt-2 text-xs text-red-600 truncate">
                        ⚠ {weekData.bigMiss}
                      </div>
                    )}
                  </div>
                )
              })}
              </div>
            </div>
          </div>

          {/* Mobile: Grid layout with larger touch targets */}
          <div className="block sm:hidden">
            <div className="grid grid-cols-2 gap-3">
              {(seasonData.weeklyPerformance || []).map((weekData, index) => {
                const week = weekData.week
                
                const isElite = weekData.processScore >= 8.0
                const isStrong = weekData.processScore >= 6.5
                const isPoor = weekData.processScore < 5.0
                
                let borderColor = "border-slate-300"
                if (isElite) borderColor = "border-green-500"
                else if (isStrong) borderColor = "border-blue-500"
                else if (isPoor) borderColor = "border-red-500"
                else borderColor = "border-yellow-400"
                
                return (
                  <div
                    key={week}
                    className={cn(
                      "bg-white rounded-xl border-2 transition-all duration-200",
                      "hover:shadow-lg active:scale-95 cursor-pointer p-4",
                      "min-h-[120px] flex flex-col justify-between",
                      borderColor
                    )}
                    onClick={() => handleWeekChange(week)}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-slate-700">Week {week}</div>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        isElite ? "bg-green-500" : 
                        isStrong ? "bg-blue-500" : 
                        isPoor ? "bg-red-500" : "bg-yellow-400"
                      )}></div>
                    </div>
                    
                    {/* Points */}
                    <div className="text-2xl font-bold text-slate-900 mb-2">
                      {weekData.points.toFixed(0)}
                    </div>
                    
                    {/* Top Player */}
                    <div className="text-xs text-slate-600 mb-1 truncate">
                      🏆 {weekData.topPlayer}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 mb-2">
                      {weekData.topPoints.toFixed(1)} pts
                    </div>
                    
                    {/* Bottom row */}
                    <div className="flex items-center justify-between text-xs mt-auto">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-500">Process:</span>
                        <ProcessScoreTooltip size="sm" />
                      </div>
                      <span className={cn(
                        "font-semibold",
                        weekData.processScore >= 7 ? "text-green-600" :
                        weekData.processScore >= 5 ? "text-amber-600" : "text-red-600"
                      )}>
                        {weekData.processScore}/10
                      </span>
                    </div>
                    
                    {/* Big Miss Indicator */}
                    {weekData.bigMiss && (
                      <div className="mt-2 text-xs text-red-600 font-medium truncate">
                        ⚠ {weekData.bigMiss}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs flex-wrap gap-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded border-2 border-green-500 bg-white"></div>
              <span>Elite (8.0+)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded border-2 border-blue-500 bg-white"></div>
              <span>Strong (6.5+)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded border-2 border-yellow-400 bg-white"></div>
              <span>Average (5.0-6.5)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded border-2 border-red-500 bg-white"></div>
              <span>Poor (&lt;5.0)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Performance Breakdown - Colored Game Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700">{seasonData.seasonSummary.eliteGames}</div>
                <div className="text-sm text-green-600">Elite Weeks</div>
                <div className="text-xs text-slate-600 mt-1">8.0+ Process Score</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-700">{seasonData.seasonSummary.strongGames}</div>
                <div className="text-sm text-blue-600">Strong Weeks</div>
                <div className="text-xs text-slate-600 mt-1">6.5+ Process Score</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200/50 bg-gradient-to-br from-yellow-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-700">{seasonData.seasonSummary.averageGames}</div>
                <div className="text-sm text-yellow-600">Average Weeks</div>
                <div className="text-xs text-slate-600 mt-1">5.0-6.5 Process Score</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200/50 bg-gradient-to-br from-red-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-700">{seasonData.seasonSummary.poorGames}</div>
                <div className="text-sm text-red-600">Poor Weeks</div>
                <div className="text-xs text-slate-600 mt-1">&lt;5.0 Process Score</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                <ArrowDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Season Performance */}
      <div className="grid grid-cols-1 gap-6">
        {/* Main Score Card */}
        <Card className="gradient-card border-white/30">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Season Performance
                </CardTitle>
                <p className="text-slate-600 mt-1">Fantasy Football Analysis</p>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                <Trophy className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Solid Manager</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{seasonData.seasonSummary.avgProcessScore.toFixed(1)}</div>
                <div className="text-sm text-slate-600 flex items-center justify-center space-x-1">
                  <span>Process Score</span>
                  <ProcessScoreTooltip variant="detailed" />
                </div>
                <div className="text-xs text-green-600 mt-1 flex items-center justify-center">
                  <Zap className="w-3 h-3 mr-1" />
                  Decision quality
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{seasonData.seasonSummary.avgPoints.toFixed(1)}</div>
                <div className="text-sm text-slate-600">Avg PPG</div>
                <div className="text-xs text-green-600 mt-1 flex items-center justify-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  Season average
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{seasonData.seasonSummary.benchPoints.toFixed(0)}</div>
                <div className="text-sm text-slate-600">Bench Points</div>
                <div className="text-xs text-amber-600 mt-1 flex items-center justify-center">
                  <Target className="w-3 h-3 mr-1" />
                  Left unused
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{seasonData.seasonSummary.eliteGames}</div>
                <div className="text-sm text-slate-600">Elite Weeks</div>
                <div className="text-xs text-green-600 mt-1 flex items-center justify-center">
                  <Zap className="w-3 h-3 mr-1" />
                  8.0+ Process Score
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>


      {/* League Position Analysis */}
      {leagueData && teamId && (() => {
        const teams = Object.values(leagueData) as any[]
        const currentTeam = teams.find(team => team.teamId === teamId)
        
        if (!currentTeam) return null
        
        // Sort teams by process score for ranking
        const sortedByProcessScore = teams.sort((a, b) => b.seasonSummary.avgProcessScore - a.seasonSummary.avgProcessScore)
        const currentRank = sortedByProcessScore.findIndex(team => team.teamId === teamId) + 1
        
        // Calculate averages
        const avgProcessScore = teams.reduce((sum, team) => sum + team.seasonSummary.avgProcessScore, 0) / teams.length
        const firstPlaceProcessScore = sortedByProcessScore[0]?.seasonSummary.avgProcessScore || 0
        
        const processScoreDiff = currentTeam.seasonSummary.avgProcessScore - avgProcessScore
        const processScoreVsFirst = currentTeam.seasonSummary.avgProcessScore - firstPlaceProcessScore
        
        return (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <Users className="w-5 h-5" />
                  <span>League Position</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-white/60 border border-blue-200/30">
                  <div className="text-2xl font-bold text-blue-700 mb-1">{currentRank}{currentRank === 1 ? 'st' : currentRank === 2 ? 'nd' : currentRank === 3 ? 'rd' : 'th'}</div>
                  <div className="text-sm text-slate-600">of {teams.length} teams</div>
                  <div className="text-xs text-slate-500 mt-1">Process Score Ranking</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Process Score vs 1st:</span>
                    <span className={`font-medium ${processScoreVsFirst >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {processScoreVsFirst >= 0 ? '+' : ''}{processScoreVsFirst.toFixed(1)} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Process Score vs Avg:</span>
                    <span className={`font-medium ${processScoreDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {processScoreDiff >= 0 ? '+' : ''}{processScoreDiff.toFixed(1)} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Your Process Score:</span>
                    <span className="font-medium text-blue-600">{currentTeam.seasonSummary.avgProcessScore.toFixed(1)}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })()}
    </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Content */}
      {renderContent()}

      {/* Week Detail Modal */}
      <WeekDetailModal
        key={`week-${selectedWeek}-${selectedWeekData?.week}`}
        open={selectedWeek !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedWeek(null)
            setSelectedWeekData(null)
          }
        }}
        week={selectedWeek || 1}
        weekData={selectedWeekData}
        onWeekChange={handleWeekChange}
        availableWeeks={seasonData?.weeklyPerformance?.map(w => w.week).sort((a, b) => a - b)}
        isLoadingWeekData={isLoadingWeekData}
      />
    </div>
  )
}