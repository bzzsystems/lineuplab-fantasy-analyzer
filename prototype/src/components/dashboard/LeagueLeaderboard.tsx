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
  selectedYear?: number
}

export function LeagueLeaderboard({ isLoading: externalLoading, leagueData: externalLeagueData, selectedYear = 2024 }: LeagueLeaderboardProps) {
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
    if (!externalLeagueData) {
      const loadLeagueData = async () => {
        try {
          setLoading(true)
          setLoadingProgress({ message: 'Connecting to ESPN...', progress: 10 })
          
          const data = await apiService.getLeagueAnalysis(selectedYear)
          
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
  }, [externalLeagueData, selectedYear])

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

      {/* Season Overview Chart */}
      <SeasonOverviewChart />

      {/* League Intelligence Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        
        {/* League Competitiveness */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-purple-900 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              League Competitiveness
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const processScores = teamsArray.map(t => t.seasonSummary.avgProcessScore)
              const avgScore = processScores.reduce((sum, score) => sum + score, 0) / processScores.length
              const stdDev = Math.sqrt(processScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / processScores.length)
              const competitiveness = stdDev < 0.8 ? 'Highly Competitive' : stdDev < 1.2 ? 'Competitive' : 'Mixed Skill Levels'
              const color = stdDev < 0.8 ? 'text-red-700' : stdDev < 1.2 ? 'text-orange-700' : 'text-green-700'
              
              return (
                <div className="space-y-2">
                  <div className={`text-xl font-bold ${color}`}>
                    {competitiveness}
                  </div>
                  <div className="text-xs text-purple-800">
                    Score spread: {(Math.max(...processScores) - Math.min(...processScores)).toFixed(1)} pts
                  </div>
                  <div className="text-xs text-purple-700">
                    League average: {avgScore.toFixed(1)}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Elite Performance Distribution */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-green-900 flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              Elite Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const eliteTeamsCount = teamsArray.filter(t => t.seasonSummary.avgProcessScore >= 8.0).length
              const strongTeamsCount = teamsArray.filter(t => t.seasonSummary.avgProcessScore >= 6.5).length
              const totalEliteGames = teamsArray.reduce((sum, t) => sum + t.seasonSummary.eliteGames, 0)
              
              return (
                <div className="space-y-2">
                  <div className="text-xl font-bold text-green-700">
                    {eliteTeamsCount} Elite Teams
                  </div>
                  <div className="text-xs text-green-800">
                    {strongTeamsCount} teams averaging 6.5+ process score
                  </div>
                  <div className="text-xs text-green-700">
                    {totalEliteGames} total elite games league-wide
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Most Improved & Trending */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const improvingTeams = teamsArray.filter(t => t.weeklyTrend === 'improving')
              const decliningTeams = teamsArray.filter(t => t.weeklyTrend === 'declining')
              const mostImproved = improvingTeams.length > 0 ? improvingTeams[0] : null
              
              return (
                <div className="space-y-2">
                  <div className="text-lg font-bold text-blue-700">
                    📈 {improvingTeams.length} Improving
                  </div>
                  <div className="text-lg font-bold text-red-700">
                    📉 {decliningTeams.length} Declining  
                  </div>
                  {mostImproved && (
                    <div className="text-xs text-blue-800">
                      Hot streak: {mostImproved.teamName}
                    </div>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Advanced League Insights */}
      <Card className="mb-6 border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            League Intelligence Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strategic Insights */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Strategic Insights
              </h4>
              
              {(() => {
                const bestProcessTeam = teamsArray.find(t => t.seasonSummary.avgProcessScore === Math.max(...teamsArray.map(team => team.seasonSummary.avgProcessScore)))
                const mostPointsTeam = teamsArray.find(t => t.seasonSummary.avgPoints === Math.max(...teamsArray.map(team => team.seasonSummary.avgPoints)))
                const luckiestTeam = teamsArray.find(t => (t.seasonSummary.avgPoints / t.seasonSummary.avgProcessScore) === Math.max(...teamsArray.map(team => team.seasonSummary.avgPoints / team.seasonSummary.avgProcessScore)))
                const underperformer = teamsArray.find(t => (t.seasonSummary.avgPoints / t.seasonSummary.avgProcessScore) === Math.min(...teamsArray.map(team => team.seasonSummary.avgPoints / team.seasonSummary.avgProcessScore)))
                
                return (
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-semibold text-green-800">📊 Best Decision Maker</div>
                      <div className="text-green-700">{bestProcessTeam?.teamName} leads with {bestProcessTeam?.seasonSummary.avgProcessScore.toFixed(1)} avg process score</div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-semibold text-blue-800">⚡ Highest Scorer</div>
                      <div className="text-blue-700">{mostPointsTeam?.teamName} averaging {mostPointsTeam?.seasonSummary.avgPoints.toFixed(1)} PPG</div>
                    </div>
                    
                    {luckiestTeam && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="font-semibold text-yellow-800">🍀 Lucky Break Leader</div>
                        <div className="text-yellow-700">{luckiestTeam.teamName} getting great results vs process quality</div>
                      </div>
                    )}
                    
                    {underperformer && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="font-semibold text-red-800">😤 Unlucky but Skilled</div>
                        <div className="text-red-700">{underperformer.teamName} deserves better results</div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Power Rankings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 flex items-center">
                <Medal className="w-4 h-4 mr-2" />
                Power Rankings Insights
              </h4>
              
              {(() => {
                const sortedByPower = [...teamsArray].sort((a, b) => 
                  (b.seasonSummary.avgProcessScore * 0.6 + (b.seasonSummary.avgPoints / 140) * 0.4) - 
                  (a.seasonSummary.avgProcessScore * 0.6 + (a.seasonSummary.avgPoints / 140) * 0.4)
                )
                
                return (
                  <div className="space-y-2 text-sm">
                    <div className="font-semibold text-slate-700 mb-3">Top 4 Power Rankings (Process + Results):</div>
                    {sortedByPower.slice(0, 4).map((team, index) => {
                      const powerScore = (team.seasonSummary.avgProcessScore * 0.6 + (team.seasonSummary.avgPoints / 140) * 0.4).toFixed(1)
                      const trendEmoji = team.weeklyTrend === 'improving' ? '📈' : team.weeklyTrend === 'declining' ? '📉' : '➡️'
                      
                      return (
                        <div key={team.teamId} className={`flex items-center justify-between p-2 rounded ${
                          index === 0 ? 'bg-yellow-100 border border-yellow-300' :
                          index === 1 ? 'bg-gray-100 border border-gray-300' :
                          index === 2 ? 'bg-amber-100 border border-amber-300' : 
                          'bg-slate-100 border border-slate-300'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg">
                              {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '4️⃣'}
                            </span>
                            <span className={`font-medium ${team.isCurrentUser ? 'text-blue-700' : 'text-slate-700'}`}>
                              {team.teamName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-600">{powerScore}</span>
                            <span>{trendEmoji}</span>
                          </div>
                        </div>
                      )
                    })}
                    
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-600">
                        <strong>Power Score Formula:</strong> 60% Process Quality + 40% Point Production
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <div 
                        className={cn(
                          "font-semibold text-sm cursor-pointer hover:underline transition-colors",
                          team.isCurrentUser ? "text-blue-900 hover:text-blue-700" : "text-slate-900 hover:text-slate-700"
                        )}
                        onClick={() => setSelectedTeamData(team)}
                      >
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

        </CardContent>
      </Card>

      {/* Team Analysis Modal Popup */}
      {selectedTeamData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark overlay - click to close */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            onClick={() => setSelectedTeamData(null)}
          />
          
          {/* Modal content */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl w-full h-full max-w-[85vw] max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedTeamData.teamName}</h2>
                <p className="text-sm text-slate-600">{selectedTeamData.ownerName}</p>
              </div>
              <button
                onClick={() => setSelectedTeamData(null)}
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
              
              {/* Performance Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-white/80 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-700">{selectedTeamData.seasonSummary.avgProcessScore.toFixed(1)}</div>
                  <div className="text-xs text-slate-600">Process Score</div>
                </div>
                <div className="text-center p-3 bg-white/80 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-slate-700">{selectedTeamData.seasonSummary.avgPoints.toFixed(1)}</div>
                  <div className="text-xs text-slate-600">Avg PPG</div>
                </div>
                <div className="text-center p-3 bg-white/80 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-green-700">{selectedTeamData.seasonSummary.eliteGames}</div>
                  <div className="text-xs text-slate-600">Elite Games</div>
                </div>
                <div className="text-center p-3 bg-white/80 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-slate-700">{selectedTeamData.seasonSummary.totalWeeks}</div>
                  <div className="text-xs text-slate-600">Weeks Played</div>
                </div>
              </div>

              {/* Weekly Performance Tiles */}
              <div className="mb-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Weekly Performance
                </h4>
                
                {/* Desktop/Tablet: Horizontal scroll */}
                <div className="hidden sm:block">
                  <div className="overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex space-x-3 min-w-max px-1 py-2">
                      {(selectedTeamData.weeklyPerformance || []).map((weekData: any, index: number) => {
                        const week = weekData.week
                        
                        const isElite = weekData.processScore >= 8.0
                        const isStrong = weekData.processScore >= 6.5
                        const isPoor = weekData.processScore < 5.0
                        
                        let borderColor = "border-slate-300"
                        let bgColor = "bg-white/80"
                        if (isElite) {
                          borderColor = "border-green-500"
                          bgColor = "bg-green-50/80"
                        } else if (isStrong) {
                          borderColor = "border-blue-500" 
                          bgColor = "bg-blue-50/80"
                        } else if (isPoor) {
                          borderColor = "border-red-500"
                          bgColor = "bg-red-50/80"
                        }

                        return (
                          <div
                            key={week}
                            className={`w-32 flex-shrink-0 ${bgColor} rounded-xl border-2 ${borderColor} p-3 cursor-pointer hover:shadow-md transition-all duration-200`}
                          >
                            {/* Week Header */}
                            <div className="text-center mb-2">
                              <span className="text-xs font-semibold text-slate-600">Week {week}</span>
                              {/* Matchup Score */}
                              {(weekData.teamScore !== undefined && weekData.opponentScore !== undefined) && (
                                <div className="mt-1">
                                  <span className={`text-xs font-bold ${
                                    weekData.outcome === 'W' ? 'text-green-800' : 'text-red-800'
                                  }`}>
                                    {weekData.teamScore.toFixed(1)} - {weekData.opponentScore.toFixed(1)}
                                  </span>
                                </div>
                              )}
                              {weekData.outcome && (
                                <div className="mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    weekData.outcome === 'W' 
                                      ? 'bg-green-200 text-green-800' 
                                      : 'bg-red-200 text-red-800'
                                  }`}>
                                    {weekData.outcome}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Process Score */}
                            <div className="text-center mb-2">
                              <div className={`text-xl font-bold ${
                                isElite ? 'text-green-700' : 
                                isStrong ? 'text-blue-700' : 
                                isPoor ? 'text-red-700' : 'text-slate-700'
                              }`}>
                                {weekData.processScore.toFixed(1)}
                              </div>
                              <div className="text-xs text-slate-600">Process Score</div>
                            </div>

                            {/* Points */}
                            <div className="text-center mb-2">
                              <div className="text-sm font-semibold text-slate-700">
                                {weekData.actualPoints?.toFixed(1) || 'N/A'}
                              </div>
                              <div className="text-xs text-slate-600">Points</div>
                            </div>

                            {/* Performance Badge */}
                            <div className="text-center">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                isElite ? 'bg-green-200 text-green-800' : 
                                isStrong ? 'bg-blue-200 text-blue-800' : 
                                isPoor ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-800'
                              }`}>
                                {isElite ? 'Elite' : isStrong ? 'Strong' : isPoor ? 'Poor' : 'Average'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Mobile: Grid layout with larger touch targets */}
                <div className="block sm:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    {(selectedTeamData.weeklyPerformance || []).map((weekData: any, index: number) => {
                      const week = weekData.week
                      
                      const isElite = weekData.processScore >= 8.0
                      const isStrong = weekData.processScore >= 6.5
                      const isPoor = weekData.processScore < 5.0
                      
                      let borderColor = "border-slate-300"
                      let bgColor = "bg-white/80"
                      if (isElite) {
                        borderColor = "border-green-500"
                        bgColor = "bg-green-50/80"
                      } else if (isStrong) {
                        borderColor = "border-blue-500"
                        bgColor = "bg-blue-50/80" 
                      } else if (isPoor) {
                        borderColor = "border-red-500"
                        bgColor = "bg-red-50/80"
                      }

                      return (
                        <div
                          key={week}
                          className={`${bgColor} rounded-xl border-2 ${borderColor} p-4 cursor-pointer hover:shadow-md transition-all duration-200`}
                        >
                          {/* Week Header */}
                          <div className="text-center mb-3">
                            <span className="text-sm font-semibold text-slate-600">Week {week}</span>
                            {/* Matchup Score */}
                            {(weekData.teamScore !== undefined && weekData.opponentScore !== undefined) && (
                              <div className="mt-1">
                                <span className={`text-sm font-bold ${
                                  weekData.outcome === 'W' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                  {weekData.teamScore.toFixed(1)} - {weekData.opponentScore.toFixed(1)}
                                </span>
                              </div>
                            )}
                            {weekData.outcome && (
                              <div className="mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  weekData.outcome === 'W' 
                                    ? 'bg-green-200 text-green-800' 
                                    : 'bg-red-200 text-red-800'
                                }`}>
                                  {weekData.outcome}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Process Score & Points */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="text-center">
                              <div className={`text-lg font-bold ${
                                isElite ? 'text-green-700' : 
                                isStrong ? 'text-blue-700' : 
                                isPoor ? 'text-red-700' : 'text-slate-700'
                              }`}>
                                {weekData.processScore.toFixed(1)}
                              </div>
                              <div className="text-xs text-slate-600">Process Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-slate-700">
                                {weekData.actualPoints?.toFixed(1) || 'N/A'}
                              </div>
                              <div className="text-xs text-slate-600">Points</div>
                            </div>
                          </div>

                          {/* Performance Badge */}
                          <div className="text-center">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              isElite ? 'bg-green-200 text-green-800' : 
                              isStrong ? 'bg-blue-200 text-blue-800' : 
                              isPoor ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-800'
                            }`}>
                              {isElite ? 'Elite' : isStrong ? 'Strong' : isPoor ? 'Poor' : 'Average'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Key Insights Section */}
              <div className="space-y-4">
                {/* Key Lineup Decisions */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Trophy className="w-4 h-4 mr-2" />
                    Key Lineup Decisions
                  </h4>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const eliteWeeks = (selectedTeamData.weeklyPerformance || [])
                        .filter((week: any) => week.processScore >= 8.0)
                        .slice(0, 3)
                      return eliteWeeks.length > 0 ? eliteWeeks.map((week: any, index: number) => (
                        <div key={index} className="text-green-700">
                          • Week {week.week}: Elite process score ({week.processScore.toFixed(1)}) with {week.topPlayer} leading ({week.topPoints.toFixed(1)} pts)
                        </div>
                      )) : [<div key="none" className="text-green-600">Focus on improving weekly decision consistency for more elite performances</div>]
                    })()}
                  </div>
                </div>

                {/* Missed Opportunities */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Missed Opportunities  
                  </h4>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const poorWeeks = (selectedTeamData.weeklyPerformance || [])
                        .filter((week: any) => week.processScore < 5.0)
                        .slice(0, 3)
                      return poorWeeks.length > 0 ? poorWeeks.map((week: any, index: number) => (
                        <div key={index} className="text-amber-700">
                          • Week {week.week}: Low process score ({week.processScore.toFixed(1)}) - potential lineup optimization missed
                        </div>
                      )) : [<div key="none" className="text-amber-600">Strong consistent decision-making - minimal missed opportunities!</div>]
                    })()}
                  </div>
                </div>

                {/* Areas for Improvement */}
                {selectedTeamData.improvementAreas.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Areas for Improvement
                    </h4>
                    <div className="space-y-2">
                      {selectedTeamData.improvementAreas.slice(0, 3).map((area: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-white/60 p-2 rounded">
                          <span className="text-blue-700 font-medium">{area.area}</span>
                          <div className="text-right">
                            <span className="font-bold text-blue-800">{area.impact}</span>
                            <div className="text-xs text-blue-600">{area.priority} priority</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Season Context */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Season Performance Context</h4>
                  <div className="text-sm text-slate-700 space-y-1">
                    <div>• <strong>{selectedTeamData.seasonSummary.eliteGames}</strong> elite weeks ({((selectedTeamData.seasonSummary.eliteGames / selectedTeamData.seasonSummary.totalWeeks) * 100).toFixed(0)}% of games)</div>
                    <div>• <strong>{selectedTeamData.seasonSummary.strongGames}</strong> strong weeks showing solid decision-making</div>
                    <div>• Process score trend: {selectedTeamData.seasonSummary.avgProcessScore >= 7 ? '📈 Excellent' : selectedTeamData.seasonSummary.avgProcessScore >= 6 ? '✅ Good' : selectedTeamData.seasonSummary.avgProcessScore >= 5 ? '⚠️ Average' : '❌ Needs Work'} decision quality</div>
                  </div>
                </div>
              </div>
              
              </div>
            </div>
          </div>
        </div>
      )}

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