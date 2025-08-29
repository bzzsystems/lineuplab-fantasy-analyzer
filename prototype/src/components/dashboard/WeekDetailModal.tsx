import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Trophy, 
  Target, 
  AlertTriangle,
  Users,
  TrendingUp,
  Star,
  ChevronDown,
  ChevronRight,
  Calculator,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react'

interface WeekDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  week: number
  weekData?: {
    totalPoints: number
    totalProjected: number
    projectionDiff: number
    processScore: number
    efficiency: number
    pointsLostToBench: number
    lineup: Array<{
      position: string
      name: string
      espnPoints: number
      projected: number
      projectionDiff: number
      projectionIcon: string
      processScore: number
      benchAlternative: string | null
      benchPoints: number
      benchImpact: string
      reasoning: string
      detailedScoring?: {
        baseScore: number
        baseReason: string
        projectionBonus?: number
        projectionPenalty?: number
        projectionReason: string
        benchBonus?: number
        benchPenalty?: number
        benchReason: string
        total: number
        breakdown: Array<{
          component: string
          points: number
          description: string
        }>
      }
    }>
    keyInsights: {
      eliteDecisionMaking: string[]
      benchManagement: string[]
      projectionAccuracy: string[]
    }
  }
  onWeekChange?: (newWeek: number) => void
  availableWeeks?: number[]
  isLoadingWeekData?: boolean
}

export function WeekDetailModal({ open, onOpenChange, week, weekData: providedWeekData, onWeekChange, availableWeeks, isLoadingWeekData }: WeekDetailModalProps) {
  const [expandedPlayerScoring, setExpandedPlayerScoring] = React.useState<Set<number>>(new Set())
  
  // Navigation logic
  const defaultWeeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  const weeks = availableWeeks || defaultWeeks
  const currentWeekIndex = weeks.findIndex(w => w === week)
  const canGoPrevious = currentWeekIndex > 0
  const canGoNext = currentWeekIndex < weeks.length - 1
  
  const handlePreviousWeek = () => {
    if (canGoPrevious && onWeekChange) {
      const previousWeek = weeks[currentWeekIndex - 1]
      onWeekChange(previousWeek)
    }
  }
  
  const handleNextWeek = () => {
    if (canGoNext && onWeekChange) {
      const nextWeek = weeks[currentWeekIndex + 1]
      onWeekChange(nextWeek)
    }
  }
  
  // Function to sort lineup by position order: QB, RB, RB, WR, WR, FLEX, TE, D/ST, K
  const sortLineupByPosition = (lineup: any[]) => {
    // First, separate players by position
    const qb = lineup.filter(p => p.position === 'QB')
    const rb = lineup.filter(p => p.position === 'RB')
    const wr = lineup.filter(p => p.position === 'WR')
    const te = lineup.filter(p => p.position === 'TE')
    const flex = lineup.filter(p => p.position === 'FLEX')
    const dst = lineup.filter(p => p.position === 'D/ST')
    const k = lineup.filter(p => p.position === 'K')

    // Build ordered lineup: QB, RB, RB, WR, WR, FLEX, TE, D/ST, K
    const orderedLineup = [
      ...qb.slice(0, 1),          // 1 QB
      ...rb.slice(0, 2),          // 2 RB slots
      ...wr.slice(0, 2),          // 2 WR slots  
      ...flex.slice(0, 1),        // 1 FLEX slot
      ...te.slice(0, 1),          // 1 TE
      ...dst.slice(0, 1),         // 1 D/ST
      ...k.slice(0, 1)            // 1 K
    ]

    return orderedLineup
  }
  
  // Use provided weekData or fall back to mock data
  const getWeekData = (weekNum: number) => {
    if (providedWeekData) {
      return providedWeekData
    }
    
    // Fallback mock data for demonstration
    const weeklyData = {
      1: {
        totalPoints: 127.0,
        totalProjected: 115.4,
        projectionDiff: 11.6,
        processScore: 6.9,
        efficiency: 98.4,
        pointsLostToBench: 2.0,
        context: "Elite QB & WR1 decisions drive strong week",
        lineup: [
          { 
            position: "QB", 
            name: "Jayden Daniels", 
            espnPoints: 28.16, 
            projected: 18.1, 
            benchAlternative: "Tua Tagovailoa", 
            benchPoints: 19.6,
            benchImpact: "✅ Beat Tua (19.6)",
            projectionIcon: "📈",
            projectionDiff: +10.1,
            processScore: 10.0,
            reasoning: "Elite + Beat Projection + Beat Bench",
            detailedScoring: {
              baseScore: 7.5,
              baseReason: "Elite performance (25+ pts for QB)",
              projectionBonus: 1.5,
              projectionReason: "Beat projection by 10.1 pts (+1.5)",
              benchBonus: 1.0,
              benchReason: "Beat best bench option by 8.6 pts (+1.0)",
              total: 10.0,
              breakdown: [
                { component: "Base Score (Elite)", points: 7.5, description: "28.16 pts ≥ 25 (Elite threshold)" },
                { component: "Projection Bonus", points: 1.5, description: "Beat 18.1 projection by 10.1 pts" },
                { component: "Bench Bonus", points: 1.0, description: "Beat Tua (19.6) by 8.6 pts" }
              ]
            }
          },
          { 
            position: "RB", 
            name: "James Cook", 
            espnPoints: 11.8, 
            projected: 15.6, 
            benchAlternative: "David Montgomery", 
            benchPoints: 12.1,
            benchImpact: "⚠️ Montgomery (+0.3)",
            projectionIcon: "📉",
            projectionDiff: -3.8,
            processScore: 5.0,
            reasoning: "Good base - Minor bench miss",
            detailedScoring: {
              baseScore: 5.5,
              baseReason: "Good performance (10-20 pts for RB)",
              projectionPenalty: -0.2,
              projectionReason: "Missed projection by 3.8 pts (-0.2)",
              benchPenalty: -0.3,
              benchReason: "Montgomery scored 0.3 pts more (-0.3)",
              total: 5.0,
              breakdown: [
                { component: "Base Score (Good)", points: 5.5, description: "11.8 pts in Good range (10-20)" },
                { component: "Projection Miss", points: -0.2, description: "Missed 15.6 projection by 3.8 pts" },
                { component: "Bench Miss", points: -0.3, description: "Montgomery (12.1) outscored by 0.3 pts" }
              ]
            }
          },
          { 
            position: "RB", 
            name: "Josh Jacobs", 
            espnPoints: 11.4, 
            projected: 14.3, 
            benchAlternative: "David Montgomery", 
            benchPoints: 12.1,
            benchImpact: "⚠️ Montgomery (+0.7)",
            projectionIcon: "📉",
            projectionDiff: -2.9,
            processScore: 5.0,
            reasoning: "Good base - Minor bench miss",
            detailedScoring: {
              baseScore: 5.5,
              baseReason: "Good performance (10-20 pts for RB)",
              projectionPenalty: -0.2,
              projectionReason: "Missed projection by 2.9 pts (-0.2)",
              benchPenalty: -0.3,
              benchReason: "Montgomery scored 0.7 pts more (-0.3)",
              total: 5.0,
              breakdown: [
                { component: "Base Score (Good)", points: 5.5, description: "11.4 pts in Good range (10-20)" },
                { component: "Projection Miss", points: -0.2, description: "Missed 14.3 projection by 2.9 pts" },
                { component: "Bench Miss", points: -0.3, description: "Montgomery (12.1) outscored by 0.7 pts" }
              ]
            }
          },
          { 
            position: "WR", 
            name: "CeeDee Lamb", 
            espnPoints: 11.1, 
            projected: 16.5, 
            benchAlternative: "Joshua Palmer", 
            benchPoints: 9.9,
            benchImpact: "✅ Beat Palmer (9.9)",
            projectionIcon: "📉",
            projectionDiff: -5.4,
            processScore: 7.0,
            reasoning: "Projection miss + Bench win",
            detailedScoring: {
              baseScore: 6.0,
              baseReason: "Good performance (10-20 pts for WR)",
              projectionPenalty: -0.5,
              projectionReason: "Missed projection by 5.4 pts (-0.5)",
              benchBonus: 1.5,
              benchReason: "Beat Palmer by 1.2 pts (+1.5)",
              total: 7.0,
              breakdown: [
                { component: "Base Score (Good)", points: 6.0, description: "11.1 pts in Good range (10-20)" },
                { component: "Projection Miss", points: -0.5, description: "Missed 16.5 projection by 5.4 pts" },
                { component: "Bench Bonus", points: 1.5, description: "Beat Palmer (9.9) by 1.2 pts" }
              ]
            }
          },
          { 
            position: "WR", 
            name: "A.J. Brown", 
            espnPoints: 20.4, 
            projected: 14.2, 
            benchAlternative: "Joshua Palmer", 
            benchPoints: 9.9,
            benchImpact: "✅ Beat Palmer (9.9)",
            projectionIcon: "📈",
            projectionDiff: +6.2,
            processScore: 10.0,
            reasoning: "Elite + Beat All + Win Bonus",
            detailedScoring: {
              baseScore: 7.5,
              baseReason: "Elite performance (20+ pts for WR)",
              projectionBonus: 1.5,
              projectionReason: "Beat projection by 6.2 pts (+1.5)",
              benchBonus: 1.0,
              benchReason: "Beat best bench option by 10.5 pts (+1.0)",
              total: 10.0,
              breakdown: [
                { component: "Base Score (Elite)", points: 7.5, description: "20.4 pts ≥ 20 (Elite threshold)" },
                { component: "Projection Bonus", points: 1.5, description: "Beat 14.2 projection by 6.2 pts" },
                { component: "Bench Bonus", points: 1.0, description: "Beat Palmer (9.9) by 10.5 pts" }
              ]
            }
          },
          { 
            position: "TE", 
            name: "David Njoku", 
            espnPoints: 6.4, 
            projected: 8.9, 
            benchAlternative: null, 
            benchPoints: 0,
            benchImpact: "No alternatives",
            projectionIcon: "📉",
            projectionDiff: -2.5,
            processScore: 5.0,
            reasoning: "Performance only (no bench)",
            detailedScoring: {
              baseScore: 5.5,
              baseReason: "Average performance (5-15 pts for TE)",
              projectionPenalty: -0.5,
              projectionReason: "Missed projection by 2.5 pts (-0.5)",
              benchBonus: 0.0,
              benchReason: "No bench alternatives available",
              total: 5.0,
              breakdown: [
                { component: "Base Score (Average)", points: 5.5, description: "6.4 pts in Average range (5-15)" },
                { component: "Projection Miss", points: -0.5, description: "Missed 8.9 projection by 2.5 pts" },
                { component: "Bench Impact", points: 0.0, description: "No bench alternatives to compare" }
              ]
            }
          },
          { 
            position: "FLEX", 
            name: "Jaylen Waddle", 
            espnPoints: 13.7, 
            projected: 11.2, 
            benchAlternative: "Joshua Palmer", 
            benchPoints: 9.9,
            benchImpact: "✅ Beat Palmer (9.9)",
            projectionIcon: "📈",
            projectionDiff: +2.5,
            processScore: 7.5,
            reasoning: "Good + Beat Projection + Bench",
            detailedScoring: {
              baseScore: 6.0,
              baseReason: "Good performance (10-20 pts for WR)",
              projectionBonus: 0.5,
              projectionReason: "Beat projection by 2.5 pts (+0.5)",
              benchBonus: 1.0,
              benchReason: "Beat Palmer by 3.8 pts (+1.0)",
              total: 7.5,
              breakdown: [
                { component: "Base Score (Good)", points: 6.0, description: "13.7 pts in Good range (10-20)" },
                { component: "Projection Bonus", points: 0.5, description: "Beat 11.2 projection by 2.5 pts" },
                { component: "Bench Bonus", points: 1.0, description: "Beat Palmer (9.9) by 3.8 pts" }
              ]
            }
          },
          { 
            position: "D/ST", 
            name: "Saints D/ST", 
            espnPoints: 15.0, 
            projected: 8.3, 
            benchAlternative: null, 
            benchPoints: 0,
            benchImpact: "No alternatives",
            projectionIcon: "📈",
            projectionDiff: +6.7,
            processScore: 8.0,
            reasoning: "Strong + Projection smash",
            detailedScoring: {
              baseScore: 6.5,
              baseReason: "Strong performance (10+ pts for D/ST)",
              projectionBonus: 1.5,
              projectionReason: "Beat projection by 6.7 pts (+1.5)",
              benchBonus: 0.0,
              benchReason: "No bench alternatives available",
              total: 8.0,
              breakdown: [
                { component: "Base Score (Strong)", points: 6.5, description: "15.0 pts ≥ 10 (Strong threshold)" },
                { component: "Projection Bonus", points: 1.5, description: "Beat 8.3 projection by 6.7 pts" },
                { component: "Bench Impact", points: 0.0, description: "No bench alternatives to compare" }
              ]
            }
          },
          { 
            position: "K", 
            name: "Harrison Butker", 
            espnPoints: 9.0, 
            projected: 8.3, 
            benchAlternative: null, 
            benchPoints: 0,
            benchImpact: "No alternatives",
            projectionIcon: "📈",
            projectionDiff: +0.7,
            processScore: 5.0,
            reasoning: "Performance only (no bench)",
            detailedScoring: {
              baseScore: 4.5,
              baseReason: "Average performance (6-12 pts for K)",
              projectionBonus: 0.5,
              projectionReason: "Beat projection by 0.7 pts (+0.5)",
              benchBonus: 0.0,
              benchReason: "No bench alternatives available",
              total: 5.0,
              breakdown: [
                { component: "Base Score (Average)", points: 4.5, description: "9.0 pts in Average range (6-12)" },
                { component: "Projection Bonus", points: 0.5, description: "Beat 8.3 projection by 0.7 pts" },
                { component: "Bench Impact", points: 0.0, description: "No bench alternatives to compare" }
              ]
            }
          }
        ],
        keyInsights: {
          eliteDecisionMaking: [
            "QB Choice: Daniels over Tua was a 8.6-point swing in your favor",
            "WR1 Selection: A.J. Brown delivered elite performance + beat all bench options",
            "D/ST Streaming: Saints nearly doubled their projection"
          ],
          benchManagement: [
            "Beat all WR bench options (Palmer 9.9, Worthy 9.5, Ridley 6.6)",
            "Only missed 2.0 total points to bench decisions", 
            "David Montgomery was slight upgrade over both RBs but minimal impact"
          ],
          projectionAccuracy: [
            "+11.6 points above projections (110% accuracy)",
            "4 players exceeded projections, 5 fell short",
            "Biggest beats: Daniels (+10.1), Saints (+6.7), Brown (+6.2)"
          ]
        },
        bottomLine: "You executed 2 perfect decisions on your highest-leverage positions (QB, WR1) and managed your bench expertly across all WR slots. The 6.9/10 process score reflects strong strategic thinking with only minor RB rotation optimization available. Your 127.0 ESPN points with 98.4% efficiency demonstrates excellent lineup construction."
      }
    }
    
    return weeklyData[weekNum as keyof typeof weeklyData] || weeklyData[1]
  }

  const weekData = getWeekData(week)

  const togglePlayerScoring = (index: number) => {
    setExpandedPlayerScoring(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                W{week}
              </div>
              <div>
                <div className="text-xl font-bold">🏈 Week {week} ESPN Platform Scores & Analysis</div>
                <div className="text-sm text-slate-600 font-normal">{weekData.context}</div>
              </div>
            </div>
            
            {/* Week Navigation Controls */}
            {onWeekChange && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousWeek}
                  disabled={!canGoPrevious || isLoadingWeekData}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    canGoPrevious && !isLoadingWeekData
                      ? "text-blue-600 hover:bg-blue-50 hover:text-blue-700 border border-blue-200"
                      : "text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed"
                  )}
                  title={canGoPrevious ? `Go to Week ${weeks[currentWeekIndex - 1]}` : "No previous week"}
                >
                  {isLoadingWeekData ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowLeft className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Previous</span>
                </button>
                
                <div className="text-sm text-slate-500 px-2">
                  {currentWeekIndex + 1} of {weeks.length}
                </div>
                
                <button
                  onClick={handleNextWeek}
                  disabled={!canGoNext || isLoadingWeekData}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    canGoNext && !isLoadingWeekData
                      ? "text-blue-600 hover:bg-blue-50 hover:text-blue-700 border border-blue-200"
                      : "text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed"
                  )}
                  title={canGoNext ? `Go to Week ${weeks[currentWeekIndex + 1]}` : "No next week"}
                >
                  <span className="hidden sm:inline">Next</span>
                  {isLoadingWeekData ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Starting Lineup Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>STARTING LINEUP BREAKDOWN</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-2 font-semibold text-slate-700">Position</th>
                      <th className="text-left p-2 font-semibold text-slate-700">Player</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Projected</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Actual</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Difference</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Process Score</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortLineupByPosition(weekData.lineup).map((player, index) => (
                      <React.Fragment key={index}>
                        <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-2 font-medium text-slate-900">{player.position}</td>
                          <td className="p-2 font-medium text-slate-900">{player.name}</td>
                          <td className="p-2 text-center text-slate-700">{player.projected.toFixed(1)}</td>
                          <td className="p-2 text-center font-bold text-slate-900">{player.espnPoints.toFixed(1)}</td>
                          <td className="p-2 text-center">
                            <span className={cn(
                              "font-medium",
                              player.projectionDiff > 0 ? "text-green-600" : 
                              player.projectionDiff < 0 ? "text-red-600" : "text-slate-600"
                            )}>
                              {player.projectionDiff > 0 ? '+' : ''}{player.projectionDiff.toFixed(1)}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-bold text-white",
                              player.processScore >= 8 ? "bg-green-500" :
                              player.processScore >= 6 ? "bg-blue-500" :
                              player.processScore >= 4 ? "bg-amber-500" : "bg-red-500"
                            )}>
                              {player.processScore.toFixed(1)}/10
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            {player.detailedScoring && (
                              <button
                                onClick={() => togglePlayerScoring(index)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors mx-auto"
                                title="Click to see detailed score calculation"
                              >
                                <Calculator className="w-3 h-3" />
                                <span className="text-xs font-medium">View</span>
                                {expandedPlayerScoring.has(index) ? 
                                  <ChevronDown className="w-3 h-3" /> : 
                                  <ChevronRight className="w-3 h-3" />
                                }
                              </button>
                            )}
                          </td>
                        </tr>
                        {/* Detailed Scoring Breakdown Row */}
                        {expandedPlayerScoring.has(index) && player.detailedScoring && (
                          <tr className="bg-blue-50/50">
                            <td colSpan={7} className="p-4 border-b border-slate-100">
                              <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center space-x-2 mb-3">
                                  <Calculator className="w-4 h-4 text-blue-600" />
                                  <h4 className="font-semibold text-blue-800">Detailed Process Score Calculation</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {player.detailedScoring.breakdown.map((item, breakdownIndex) => (
                                    <div key={breakdownIndex} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                      <div>
                                        <div className="font-medium text-sm text-slate-800">{item.component}</div>
                                        <div className="text-xs text-slate-600">{item.description}</div>
                                      </div>
                                      <div className={cn(
                                        "text-lg font-bold px-2 py-1 rounded",
                                        item.points > 0 ? "text-green-600 bg-green-100" :
                                        item.points < 0 ? "text-red-600 bg-red-100" : "text-slate-600 bg-slate-100"
                                      )}>
                                        {item.points > 0 ? '+' : ''}{item.points.toFixed(1)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                                  <span className="font-semibold text-slate-800">Total Process Score:</span>
                                  <span className="text-2xl font-bold text-blue-600">
                                    {player.detailedScoring.total.toFixed(1)}/10
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Week Totals */}
          <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <Target className="w-5 h-5" />
                <span>📊 WEEK {week} TOTALS</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{weekData.totalPoints}</div>
                  <div className="text-xs text-slate-600">Total ESPN Points</div>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{weekData.totalProjected}</div>
                  <div className="text-xs text-slate-600">Total Projected</div>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+{weekData.projectionDiff}</div>
                  <div className="text-xs text-slate-600">Beat Projections By</div>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{weekData.processScore}/10</div>
                  <div className="text-xs text-slate-600">Average Process Score</div>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{weekData.efficiency}%</div>
                  <div className="text-xs text-slate-600">Lineup Efficiency</div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-slate-600">
                Points Lost to Bench: <span className="font-bold text-red-600">{weekData.pointsLostToBench}</span> points
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Elite Decision Making */}
            <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <Trophy className="w-5 h-5" />
                  <span>🏆 Elite Decision Making</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {weekData.keyInsights.eliteDecisionMaking.map((insight, index) => (
                  <div key={index} className="text-sm text-slate-700 flex items-start space-x-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Bench Management */}
            <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <Users className="w-5 h-5" />
                  <span>🎯 Bench Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {weekData.keyInsights.benchManagement.map((insight, index) => (
                  <div key={index} className="text-sm text-slate-700 flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Projection Accuracy */}
            <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700">
                  <TrendingUp className="w-5 h-5" />
                  <span>📈 Projection Accuracy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {weekData.keyInsights.projectionAccuracy.map((insight, index) => (
                  <div key={index} className="text-sm text-slate-700 flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Line */}
          <Card className="border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-700">
                <Star className="w-5 h-5" />
                <span>⚡ Bottom Line</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{weekData.bottomLine}</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}