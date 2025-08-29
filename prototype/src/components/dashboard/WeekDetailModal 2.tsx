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
  Star
} from 'lucide-react'

interface WeekDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  week: number
}

export function WeekDetailModal({ open, onOpenChange, week }: WeekDetailModalProps) {
  // Enhanced detailed data matching CLI analysis format
  const getWeekData = (weekNum: number) => {
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
            reasoning: "Elite + Beat Projection + Beat Bench"
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
            reasoning: "Good base - Minor bench miss"
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
            reasoning: "Good base - Minor bench miss"
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
            reasoning: "Projection miss + Bench win"
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
            reasoning: "Elite + Beat All + Win Bonus"
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
            reasoning: "Performance only (no bench)"
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
            reasoning: "Good + Beat Projection + Bench"
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
            reasoning: "Strong + Projection smash"
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
            reasoning: "Performance only (no bench)"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              W{week}
            </div>
            <div>
              <div className="text-xl font-bold">🏈 Week {week} ESPN Platform Scores & Analysis</div>
              <div className="text-sm text-slate-600 font-normal">{weekData.context}</div>
            </div>
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
                      <th className="text-left p-2 font-semibold text-slate-700">ESPN Points</th>
                      <th className="text-left p-2 font-semibold text-slate-700">vs Projected</th>
                      <th className="text-left p-2 font-semibold text-slate-700">Process</th>
                      <th className="text-left p-2 font-semibold text-slate-700">Bench Impact</th>
                      <th className="text-left p-2 font-semibold text-slate-700">Scoring Logic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekData.lineup.map((player, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-2 font-medium text-slate-900">{player.position}</td>
                        <td className="p-2 font-medium text-slate-900">{player.name}</td>
                        <td className="p-2 font-bold text-slate-900">{player.espnPoints}</td>
                        <td className="p-2">
                          <span className="flex items-center space-x-1">
                            <span>{player.projectionIcon}</span>
                            <span className={cn(
                              "font-medium",
                              player.projectionDiff > 0 ? "text-green-600" : 
                              player.projectionDiff < 0 ? "text-red-600" : "text-slate-600"
                            )}>
                              {player.projectionDiff > 0 ? '+' : ''}{player.projectionDiff.toFixed(1)}
                            </span>
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-bold text-white",
                            player.processScore >= 8 ? "bg-green-500" :
                            player.processScore >= 6 ? "bg-blue-500" :
                            player.processScore >= 4 ? "bg-amber-500" : "bg-red-500"
                          )}>
                            {player.processScore}/10
                          </span>
                        </td>
                        <td className="p-2 text-sm">{player.benchImpact}</td>
                        <td className="p-2 text-xs text-slate-600">{player.reasoning}</td>
                      </tr>
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