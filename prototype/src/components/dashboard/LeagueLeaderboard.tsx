import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { apiService } from '@/services/api'
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  Medal,
  Crown,
  Target,
  Zap,
  Users,
  Eye,
  Award,
  Loader2,
  BarChart3
} from 'lucide-react'

interface LeagueLeaderboardProps {
  isLoading?: boolean
  leagueData?: any
}

export function LeagueLeaderboard({ isLoading: externalLoading, leagueData: externalLeagueData }: LeagueLeaderboardProps) {
  const [leagueData, setLeagueData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  
  // Update loading state and data when external data changes
  React.useEffect(() => {
    if (externalLoading !== undefined) {
      setLoading(externalLoading)
    }
  }, [externalLoading])

  React.useEffect(() => {
    if (externalLeagueData) {
      setLeagueData(externalLeagueData)
      setLoading(false)
    }
  }, [externalLeagueData])
  const [error, setError] = React.useState<string | null>(null)
  const [selectedTeamData, setSelectedTeamData] = React.useState<any>(null)
  const [loadingProgress, setLoadingProgress] = React.useState({
    message: 'Initializing...',
    progress: 0
  })

  // Only load data if not provided by parent (for backward compatibility)
  React.useEffect(() => {
    if (!externalLeagueData && !leagueData) {
      const loadLeagueData = async () => {
        try {
          setLoading(true)
          setLoadingProgress({ message: 'Connecting to ESPN...', progress: 10 })
          
          const data = await apiService.getLeagueAnalysis()
          
          if (data) {
            setLeagueData(data)
            setLoadingProgress({ message: 'Complete!', progress: 100 })
          } else {
            setError('Failed to load league data')
          }
        } catch (err) {
          console.error('Error loading league data:', err)
          setError('Failed to load league analysis')
        } finally {
          setLoading(false)
        }
      }

      loadLeagueData()
    }
  }, [externalLeagueData, leagueData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Loading League Analysis</h3>
            <p className="text-slate-600 mb-4">{loadingProgress.message}</p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${loadingProgress.progress}%` }}
            />
          </div>
          
          <div className="text-sm text-slate-500">
            {loadingProgress.progress}% Complete
          </div>
          
          {/* Loading tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200/50 text-left">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 What we're doing:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Analyzing decision-making for all 10 teams</li>
              <li>• Processing 17 weeks × 10 players per team</li>
              <li>• Calculating process scores and improvement areas</li>
              <li>• First load takes time, but results are cached!</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (error || !leagueData) {
    // Check if this is a connection/authentication issue
    const hasSession = localStorage.getItem('fantasy-session-token') !== null
    
    if (!hasSession || (error && (error.includes('authenticate') || error.includes('token') || error.includes('401')))) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-slate-600 mb-2">No team data available</p>
            <p className="text-sm text-slate-500">Please connect to your league first</p>
          </div>
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-slate-600 mb-2">Failed to load league data</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // Process and sort teams by process score
  const teamsArray = Object.values(leagueData).map((team: any, index) => ({
    ...team,
    rank: index + 1
  })).sort((a: any, b: any) => b.seasonSummary.avgProcessScore - a.seasonSummary.avgProcessScore)

  // Add ranks after sorting
  teamsArray.forEach((team: any, index) => {
    team.rank = index + 1
  })
  

  // Find league leaders
  const bestProcessScore = Math.max(...teamsArray.map((t: any) => t.seasonSummary.avgProcessScore))
  const mostPoints = Math.max(...teamsArray.map((t: any) => t.seasonSummary.avgPoints))
  const bestProcessTeam = teamsArray.find((t: any) => t.seasonSummary.avgProcessScore === bestProcessScore)
  const mostPointsTeam = teamsArray.find((t: any) => t.seasonSummary.avgPoints === mostPoints)

  // Get current user's team  
  const currentUser = localStorage.getItem('selected-team-id')
  
  // Add avatars and identify current user
  teamsArray.forEach((team: any) => {
    team.isCurrentUser = team.teamId === currentUser
    team.avatar = team.rank === 1 ? '👑' : 
                 team.rank === 2 ? '🥈' :
                 team.rank === 3 ? '🥉' :
                 team.isCurrentUser ? '🏈' :
                 ['🔥', '⚡', '💀', '🎯', '⭐', '💪'][team.rank % 6]
    
    // Calculate weekly trend from recent performance
    const recentWeeks = team.weeklyPerformance?.slice(-4) || [] // Last 4 weeks
    if (recentWeeks.length >= 2) {
      const firstHalf = recentWeeks.slice(0, Math.floor(recentWeeks.length / 2))
      const secondHalf = recentWeeks.slice(Math.floor(recentWeeks.length / 2))
      const firstAvg = firstHalf.reduce((sum: number, w: any) => sum + w.processScore, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum: number, w: any) => sum + w.processScore, 0) / secondHalf.length
      const trend = secondAvg - firstAvg
      team.weeklyTrend = trend > 0.3 ? 'improving' : trend < -0.3 ? 'declining' : 'stable'
    } else {
      team.weeklyTrend = 'stable'
    }
    
    // Remove efficiency since we're not displaying it
    // team.efficiency is not used in the UI anymore
  })

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-500">#{rank}</span>
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Target className="w-4 h-4 text-slate-400" />
  }

  // Season Overview Chart Component
  const SeasonOverviewChart = () => {
    if (!leagueData) return null

    const [hoveredTeam, setHoveredTeam] = React.useState<string | null>(null)
    const [selectedTeams, setSelectedTeams] = React.useState<string[]>([])
    const [hoveredPoint, setHoveredPoint] = React.useState<{teamId: string, week: number, score: number, x: number, y: number} | null>(null)

    const allTeams = Object.values(leagueData)
    const maxWeek = Math.max(...allTeams.flatMap((team: any) => 
      team.weeklyPerformance.map((w: any) => w.week)
    ))
    
    // Generate color palette for teams
    const colors = [
      '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B',
      '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
    ]

    // Create chart data structure
    const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1)
    
    // Calculate chart dimensions and scaling - FULL WIDTH
    const chartWidth = 1000  // Increased width
    const chartHeight = 400
    const padding = { top: 20, right: 60, bottom: 40, left: 60 }
    const innerWidth = chartWidth - padding.left - padding.right
    const innerHeight = chartHeight - padding.top - padding.bottom

    // Find min/max values for scaling Process Scores (0-10 range)
    const allProcessScores = allTeams.flatMap((team: any) => 
      team.weeklyPerformance.map((w: any) => w.processScore)
    ).filter(score => score !== null && score !== undefined && !isNaN(score) && score > 0)
    
    
    // Set Y-axis range from 2 to 10 for focused scaling on relevant score range
    const minScore = 2
    const maxScore = 10

    // Scaling functions
    const xScale = (week: number) => ((week - 1) / (maxWeek - 1)) * innerWidth
    const yScale = (score: number) => innerHeight - ((score - minScore) / (maxScore - minScore)) * innerHeight

    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Season Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="flex justify-center">
              <svg width={chartWidth} height={chartHeight} className="border border-slate-200 rounded">
              {/* Grid lines */}
              <g opacity="0.3">
                {/* Horizontal grid lines - every 0.5 points from 2 to 10 */}
                {[0, 0.0625, 0.125, 0.1875, 0.25, 0.3125, 0.375, 0.4375, 0.5, 0.5625, 0.625, 0.6875, 0.75, 0.8125, 0.875, 0.9375, 1].map(ratio => (
                  <line
                    key={`hgrid-${ratio}`}
                    x1={padding.left}
                    y1={padding.top + ratio * innerHeight}
                    x2={padding.left + innerWidth}
                    y2={padding.top + ratio * innerHeight}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}
                {/* Vertical grid lines - every week */}
                {weeks.map(week => (
                  <line
                    key={`vgrid-${week}`}
                    x1={padding.left + xScale(week)}
                    y1={padding.top}
                    x2={padding.left + xScale(week)}
                    y2={padding.top + innerHeight}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}
              </g>

              {/* Axis labels */}
              <g>
                {/* Y-axis labels - only whole numbers (2, 3, 4, 5, 6, 7, 8, 9, 10) */}
                {[0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1].map(ratio => {
                  const value = Math.round(2 + ratio * 8) // Whole numbers from 2 to 10
                  return (
                    <text
                      key={`ylabel-${ratio}`}
                      x={padding.left - 10}
                      y={padding.top + ratio * innerHeight + 5}
                      textAnchor="end"
                      fontSize="12"
                      fill="#64748b"
                    >
                      {10 - (value - 2)}
                    </text>
                  )
                })}
                {/* X-axis labels - every week */}
                {weeks.map(week => (
                  <text
                    key={`xlabel-${week}`}
                    x={padding.left + xScale(week)}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#64748b"
                  >
                    {week}
                  </text>
                ))}
              </g>

              {/* Team performance lines - Show ALL teams */}
              {allTeams.map((team: any, teamIndex) => {
                const color = colors[teamIndex % colors.length]
                // Ensure we have valid weekly performance data
                const teamScores = (team.weeklyPerformance || [])
                  .filter(w => w && w.week && w.processScore !== null && w.processScore !== undefined && !isNaN(w.processScore))
                  .map((w: any) => ({ week: w.week, processScore: w.processScore }))
                
                // Determine opacity based on selection/hover state
                const isSelected = selectedTeams.includes(team.teamId)
                const isHovered = hoveredTeam === team.teamId
                const isHighlighted = isSelected || isHovered
                const hasSelections = selectedTeams.length > 0 || hoveredTeam !== null
                const opacity = hasSelections && !isHighlighted ? 0.2 : isHighlighted ? 1.0 : 0.8
                const strokeWidth = isHighlighted ? 3 : 2
                
                // Create path data
                const pathData = teamScores
                  .filter(point => point.processScore !== null && point.processScore !== undefined && !isNaN(point.processScore))
                  .sort((a, b) => a.week - b.week)
                  .map((point, index) => {
                    const x = padding.left + xScale(point.week)
                    const y = padding.top + yScale(point.processScore)
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                  })
                  .join(' ')

                return (
                  <g key={team.teamId}>
                    {/* Team line */}
                    <path
                      d={pathData}
                      stroke={color}
                      strokeWidth={strokeWidth}
                      fill="none"
                      opacity={opacity}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onMouseEnter={() => setHoveredTeam(team.teamId)}
                      onMouseLeave={() => setHoveredTeam(null)}
                      onClick={() => {
                        if (selectedTeams.includes(team.teamId)) {
                          setSelectedTeams(selectedTeams.filter(id => id !== team.teamId))
                        } else {
                          setSelectedTeams([...selectedTeams, team.teamId])
                        }
                      }}
                    />
                    {/* Data points */}
                    {teamScores
                      .filter(point => point.processScore !== null && point.processScore !== undefined && !isNaN(point.processScore))
                      .map(point => {
                        const pointX = padding.left + xScale(point.week)
                        const pointY = padding.top + yScale(point.processScore)
                        return (
                          <circle
                            key={`${team.teamId}-${point.week}`}
                            cx={pointX}
                            cy={pointY}
                            r={isHighlighted ? 4 : 3}
                            fill={color}
                            opacity={opacity}
                            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                            onMouseEnter={() => {
                              setHoveredTeam(team.teamId)
                              // Only show tooltip for selected teams
                              if (selectedTeams.includes(team.teamId)) {
                                setHoveredPoint({
                                  teamId: team.teamId,
                                  week: point.week,
                                  score: point.processScore,
                                  x: pointX,
                                  y: pointY
                                })
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredTeam(null)
                              setHoveredPoint(null)
                            }}
                            onClick={() => {
                              if (selectedTeams.includes(team.teamId)) {
                                setSelectedTeams(selectedTeams.filter(id => id !== team.teamId))
                              } else {
                                setSelectedTeams([...selectedTeams, team.teamId])
                              }
                            }}
                          />
                        )
                      })}
                  </g>
                )
              })}

              {/* Chart title */}
              <text
                x={chartWidth / 2}
                y={20}
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill="#1e293b"
              >
                Weekly Process Scores (Decision Quality)
              </text>

              {/* Tooltip for selected team points */}
              {hoveredPoint && (
                <g>
                  {/* Tooltip background */}
                  <rect
                    x={hoveredPoint.x - 25}
                    y={hoveredPoint.y - 35}
                    width="50"
                    height="25"
                    rx="4"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke="rgba(148, 163, 184, 0.3)"
                    strokeWidth="1"
                  />
                  {/* Tooltip text */}
                  <text
                    x={hoveredPoint.x}
                    y={hoveredPoint.y - 18}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="white"
                  >
                    {hoveredPoint.score.toFixed(1)}
                  </text>
                  <text
                    x={hoveredPoint.x}
                    y={hoveredPoint.y - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="rgba(203, 213, 225, 0.8)"
                  >
                    Week {hoveredPoint.week}
                  </text>
                </g>
              )}
              </svg>
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {allTeams.map((team: any, index) => {
              const isSelected = selectedTeams.includes(team.teamId)
              const isHovered = hoveredTeam === team.teamId
              const isHighlighted = isSelected || isHovered
              const hasSelections = selectedTeams.length > 0 || hoveredTeam !== null
              
              return (
                <div 
                  key={team.teamId} 
                  className={`flex items-center space-x-2 cursor-pointer p-2 rounded transition-all ${isHighlighted ? 'bg-blue-50 ring-2 ring-blue-200' : hasSelections && !isHighlighted ? 'opacity-30' : 'hover:bg-slate-50'}`}
                  onMouseEnter={() => setHoveredTeam(team.teamId)}
                  onMouseLeave={() => setHoveredTeam(null)}
                  onClick={() => {
                    if (selectedTeams.includes(team.teamId)) {
                      setSelectedTeams(selectedTeams.filter(id => id !== team.teamId))
                    } else {
                      setSelectedTeams([...selectedTeams, team.teamId])
                    }
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-xs text-slate-600 truncate font-medium">
                    {team.teamName}
                  </span>
                </div>
              )
            })}
          </div>
          
          {/* Selection hint */}
          {selectedTeams.length === 0 && !hoveredTeam && (
            <div className="mt-2 text-center">
              <span className="text-xs text-slate-400">💡 Click on team lines/names to select multiple teams for comparison</span>
            </div>
          )}
          
          {selectedTeams.length > 0 && (
            <div className="mt-2 text-center">
              <span className="text-xs text-slate-500">
                🔍 Selected: <strong>{selectedTeams.length} team{selectedTeams.length > 1 ? 's' : ''}</strong> 
                <button 
                  onClick={() => setSelectedTeams([])}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Clear All
                </button>
              </span>
            </div>
          )}

          {/* Chart insights */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200/50">
            <div className="text-sm text-blue-800">
              <strong>Decision-Making Trends:</strong> {(() => {
                const avgTrend = allTeams.reduce((sum: number, team: any) => {
                  const weeks = team.weeklyPerformance
                    .filter((w: any) => w.processScore !== null && w.processScore !== undefined)
                    .sort((a: any, b: any) => a.week - b.week)
                  if (weeks.length < 4) return sum
                  
                  const firstHalf = weeks.slice(0, Math.floor(weeks.length / 2))
                  const secondHalf = weeks.slice(Math.floor(weeks.length / 2))
                  const firstAvg = firstHalf.reduce((s: number, w: any) => s + w.processScore, 0) / firstHalf.length
                  const secondAvg = secondHalf.reduce((s: number, w: any) => s + w.processScore, 0) / secondHalf.length
                  return sum + (secondAvg - firstAvg)
                }, 0) / allTeams.length

                return avgTrend > 0.3 ? 
                  'League decision-making is improving as managers gain experience 📈' :
                  avgTrend < -0.3 ?
                  'Decision quality has declined from early season form 📉' :
                  'League maintains consistent decision-making throughout the season ➡️'
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>League Decision Making Rankings</span>
            </div>
            <div className="text-sm text-slate-600 font-normal">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Season
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{bestProcessScore.toFixed(1)}</div>
              <div className="text-sm text-slate-600">Best Process Score</div>
              <div className="text-xs text-blue-600 mt-1">{bestProcessTeam?.ownerName}</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{bestProcessTeam?.seasonSummary.eliteGames}</div>
              <div className="text-sm text-slate-600">Most Elite Games</div>
              <div className="text-xs text-green-600 mt-1">{bestProcessTeam?.ownerName}</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{mostPoints.toFixed(0)}</div>
              <div className="text-sm text-slate-600">Most Points/Game</div>
              <div className="text-xs text-purple-600 mt-1">{mostPointsTeam?.ownerName}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Season Overview Chart */}
      <SeasonOverviewChart />

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span>Process Score Rankings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamsArray.map((team: any) => (
              <div
                key={team.id}
                className={cn(
                  "grid grid-cols-12 items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                  "hover:shadow-md cursor-pointer",
                  team.isCurrentUser 
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-50/50 ring-2 ring-blue-200/50" 
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                {/* Rank Icon - Col 1 */}
                <div className="col-span-1 flex justify-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                    {getRankIcon(team.rank)}
                  </div>
                </div>

                {/* Team Info - Col 2-6 */}
                <div className="col-span-5">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{team.avatar}</span>
                    <div>
                      <div className={cn(
                        "font-semibold text-sm",
                        team.isCurrentUser ? "text-blue-900" : "text-slate-900"
                      )}>
                        {team.teamName}
                      </div>
                      <div className="text-xs text-slate-600">
                        Process Points: {(team.seasonSummary.avgProcessScore * team.seasonSummary.totalWeeks).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Score - Col 7-8 */}
                <div className="col-span-2 text-center">
                  <div className={cn(
                    "text-xl font-bold tabular-nums",
                    team.seasonSummary.avgProcessScore >= 8 ? "text-green-600" :
                    team.seasonSummary.avgProcessScore >= 7 ? "text-blue-600" :
                    team.seasonSummary.avgProcessScore >= 6 ? "text-amber-600" : "text-red-600"
                  )}>
                    {team.seasonSummary.avgProcessScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500">Process</div>
                </div>

                {/* Elite Games - Col 9 */}
                <div className="col-span-1 text-center">
                  <div className="text-lg font-bold text-slate-700">
                    {team.seasonSummary.eliteGames}
                  </div>
                  <div className="text-xs text-slate-500">Elite</div>
                </div>

                {/* Trend - Col 10 */}
                <div className="col-span-1 text-center">
                  <div className="flex flex-col items-center">
                    {getTrendIcon(team.weeklyTrend)}
                    <div className="text-xs text-slate-500 mt-1 capitalize">
                      {team.weeklyTrend}
                    </div>
                  </div>
                </div>

                {/* View Button - Col 11-12 */}
                <div className="col-span-2 text-right">
                  <button 
                    onClick={() => setSelectedTeamData(team)}
                    className={cn(
                      "flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      team.isCurrentUser
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Team Analysis Modal */}
          {selectedTeamData && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-900">
                  {selectedTeamData.teamName} ({selectedTeamData.ownerName})
                </h3>
                <button 
                  onClick={() => setSelectedTeamData(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-bold text-lg">{selectedTeamData.seasonSummary.avgProcessScore.toFixed(1)}</div>
                  <div className="text-xs text-slate-600">Process Score</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-bold text-lg">{selectedTeamData.seasonSummary.avgPoints.toFixed(1)}</div>
                  <div className="text-xs text-slate-600">Avg PPG</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-bold text-lg">{selectedTeamData.seasonSummary.eliteGames}</div>
                  <div className="text-xs text-slate-600">Elite Games</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-bold text-lg">{selectedTeamData.seasonSummary.totalWeeks}</div>
                  <div className="text-xs text-slate-600">Weeks</div>
                </div>
              </div>

              {selectedTeamData.improvementAreas.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Top Improvement Areas:</h4>
                  <div className="space-y-2">
                    {selectedTeamData.improvementAreas.slice(0, 3).map((area: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{area.area}</span>
                        <span className="font-medium text-blue-700">{area.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Season Analysis Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Manager */}
        <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Crown className="w-5 h-5" />
              <span>🏆 Best Decision Maker</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{bestProcessTeam?.avatar}</div>
                <div>
                  <div className="font-semibold text-green-900">{bestProcessTeam?.teamName}</div>
                  <div className="text-sm text-green-700">{bestProcessTeam?.ownerName}</div>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="text-sm text-green-800">
                  <strong>{bestProcessTeam?.seasonSummary.avgProcessScore.toFixed(1)}/10 Process Score</strong> • 
                  {bestProcessTeam?.seasonSummary.eliteGames} elite games • 
                  {bestProcessTeam?.seasonSummary.avgPoints.toFixed(1)} PPG
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Consistently excellent lineup decisions 🔥
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Room for Improvement */}
        <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-700">
              <Target className="w-5 h-5" />
              <span>📈 Most Upside Potential</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const mostImprovementTeam = teamsArray
                  .filter((t: any) => t.improvementAreas.length > 0)
                  .sort((a: any, b: any) => {
                    const aTotal = a.improvementAreas.reduce((sum: number, area: any) => 
                      sum + parseFloat(area.impact.replace('+', '').replace(' pts', '')), 0)
                    const bTotal = b.improvementAreas.reduce((sum: number, area: any) => 
                      sum + parseFloat(area.impact.replace('+', '').replace(' pts', '')), 0)
                    return bTotal - aTotal
                  })[0]

                const totalUpside = mostImprovementTeam?.improvementAreas
                  .reduce((sum: number, area: any) => 
                    sum + parseFloat(area.impact.replace('+', '').replace(' pts', '')), 0) || 0

                return (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{mostImprovementTeam?.avatar}</div>
                      <div>
                        <div className="font-semibold text-amber-900">{mostImprovementTeam?.teamName}</div>
                        <div className="text-sm text-amber-700">{mostImprovementTeam?.ownerName}</div>
                      </div>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <div className="text-sm text-amber-800">
                        <strong>+{totalUpside.toFixed(1)} potential points</strong> from better lineup decisions
                      </div>
                      <div className="text-xs text-amber-600 mt-1">
                        Top area: {mostImprovementTeam?.improvementAreas[0]?.area} 📊
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}