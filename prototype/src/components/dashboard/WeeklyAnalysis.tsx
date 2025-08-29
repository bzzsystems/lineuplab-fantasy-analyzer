import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Users
} from 'lucide-react'

interface WeeklyAnalysisProps {
  selectedWeek?: number
}

export function WeeklyAnalysis({ selectedWeek = 1 }: WeeklyAnalysisProps) {
  const [currentWeek, setCurrentWeek] = React.useState(selectedWeek)

  // Mock data - would come from ESPN API
  const weekData = {
    1: {
      totalPoints: 117.3,
      processScore: 5.6,
      context: "vs. Strong Opponents",
      lineup: [
        { name: "CeeDee Lamb", position: "WR", points: 16.5, optimal: false, optimalPoints: 11.1 },
        { name: "A.J. Brown", position: "WR", points: 20.4, optimal: true, feedback: "🏆 Excellent performance! Great pick." },
        { name: "James Cook", position: "RB", points: 11.8, optimal: true },
        { name: "Josh Jacobs", position: "RB", points: 11.4, optimal: true },
        { name: "Jaylen Waddle", position: "WR", points: 13.7, optimal: true },
        { name: "David Njoku", position: "TE", points: 8.9, optimal: true },
        { name: "Jayden Daniels", position: "QB", points: 18.1, optimal: false, optimalPoints: 28.16 },
        { name: "Harrison Butker", position: "K", points: 8.3, optimal: true },
        { name: "Saints D/ST", position: "D/ST", points: 8.3, optimal: true }
      ],
      bench: [
        { name: "David Montgomery", points: 12.1 },
        { name: "Calvin Ridley", points: 12.0 },
        { name: "Tua Tagovailoa", points: 19.6 }
      ],
      bigMisses: [
        { position: "RB", started: "Keaton Mitchell", startedPoints: 0.0, optimal: "David Montgomery", missedPoints: 12.1 }
      ],
      elitePerformances: [
        { player: "A.J. Brown", position: "WR", points: 20.4 }
      ]
    },
    3: {
      totalPoints: 108.3,
      processScore: 4.9,
      context: "vs. Easy Opponents",
      lineup: [
        { name: "Dallas Goedert", position: "TE", points: 22.0, optimal: true, feedback: "🏆 Excellent performance! Great pick." },
        { name: "James Cook", position: "RB", points: 16.7, optimal: true },
        { name: "David Montgomery", position: "RB", points: 11.3, optimal: true },
        { name: "Josh Jacobs", position: "RB", points: 5.3, optimal: false, optimalPoints: 15.5 },
        { name: "Jayden Daniels", position: "QB", points: 28.1, optimal: true, feedback: "🔥 MONSTER GAME! Elite performance." }
      ],
      bigMisses: [
        { position: "RB", started: "Josh Jacobs", startedPoints: 5.3, optimal: "Emanuel Wilson", missedPoints: 10.2 },
        { position: "RB", started: "Raheem Mostert", startedPoints: 0.0, optimal: "Emanuel Wilson", missedPoints: 15.5 }
      ],
      elitePerformances: [
        { player: "Dallas Goedert", position: "TE", points: 22.0 },
        { player: "Jayden Daniels", position: "QB", points: 28.1 }
      ]
    }
  }

  const currentWeekData = weekData[currentWeek as keyof typeof weekData] || weekData[1]

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentWeek > 1) {
      setCurrentWeek(currentWeek - 1)
    } else if (direction === 'next' && currentWeek < 13) {
      setCurrentWeek(currentWeek + 1)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Week Navigation */}
      <Card className="gradient-card border-white/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-slate-900">Week {currentWeek} Analysis</h2>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-blue-700">
                  {currentWeekData.context}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek('prev')}
                disabled={currentWeek === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm font-medium text-slate-700 min-w-[100px] text-center">
                Week {currentWeek} of 13
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek('next')}
                disabled={currentWeek === 13}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Week Summary Stats */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{currentWeekData.totalPoints}</div>
              <div className="text-sm text-slate-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-3xl font-bold",
                currentWeekData.processScore >= 7 ? "text-green-600" : 
                currentWeekData.processScore >= 5 ? "text-amber-600" : "text-red-600"
              )}>
                {currentWeekData.processScore}
              </div>
              <div className="text-sm text-slate-600">Process Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{currentWeekData.elitePerformances.length}</div>
              <div className="text-sm text-slate-600">Elite Games</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Starting Lineup Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Starting Lineup Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentWeekData.lineup.map((player, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:shadow-md",
                  player.optimal 
                    ? "bg-green-50/50 border border-green-200/50" 
                    : "bg-red-50/50 border border-red-200/50"
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                    player.optimal 
                      ? "bg-green-500 text-white" 
                      : "bg-red-500 text-white"
                  )}>
                    {player.position}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{player.name}</div>
                    {player.feedback && (
                      <div className="text-sm text-slate-600 mt-1">{player.feedback}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">
                    {player.points.toFixed(1)}
                  </div>
                  {!player.optimal && player.optimalPoints && (
                    <div className="text-sm text-red-600">
                      vs {player.optimalPoints.toFixed(1)} optimal
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Big Misses */}
        {currentWeekData.bigMisses.length > 0 && (
          <Card className="border-red-200/50 bg-gradient-to-br from-red-50 to-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span>Critical Misses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentWeekData.bigMisses.map((miss, index) => (
                <div key={index} className="p-4 bg-white/60 rounded-lg border border-red-200/30">
                  <div className="font-medium text-sm text-slate-900 mb-2">
                    {miss.position}: Started {miss.started} over {miss.optimal}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-600">
                      {miss.started}: {miss.startedPoints.toFixed(1)} pts
                    </div>
                    <div className="text-sm font-bold text-red-600">
                      -{miss.missedPoints.toFixed(1)} pts
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Elite Performances */}
        {currentWeekData.elitePerformances.length > 0 && (
          <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Star className="w-5 h-5" />
                <span>Elite Performances</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentWeekData.elitePerformances.map((performance, index) => (
                <div key={index} className="p-4 bg-white/60 rounded-lg border border-green-200/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm text-slate-900">
                        {performance.player} ({performance.position})
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Outstanding performance - keep starting!
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-700">
                        {performance.points.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-600">points</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Decision Quality Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Decision Quality Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-slate-50/50">
              <div className="text-2xl font-bold text-slate-900 mb-2">
                {currentWeekData.processScore.toFixed(1)}/10
              </div>
              <div className="text-sm text-slate-600 mb-2">Process Score</div>
              <div className="text-xs text-slate-500">
                Quality of decision-making
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-50/50">
              <div className="text-2xl font-bold text-slate-900 mb-2">
                {Math.round((currentWeekData.lineup.filter(p => p.optimal).length / currentWeekData.lineup.length) * 100)}%
              </div>
              <div className="text-sm text-slate-600 mb-2">Optimal Rate</div>
              <div className="text-xs text-slate-500">
                Correct start/sit decisions
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-50/50">
              <div className="text-2xl font-bold text-slate-900 mb-2">
                {currentWeekData.bigMisses.reduce((sum, miss) => sum + miss.missedPoints, 0).toFixed(1)}
              </div>
              <div className="text-sm text-slate-600 mb-2">Points Lost</div>
              <div className="text-xs text-slate-500">
                Opportunity cost
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Jump to Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-13 gap-2">
            {Array.from({ length: 13 }, (_, i) => {
              const week = i + 1
              const isSelected = week === currentWeek
              
              return (
                <Button
                  key={week}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentWeek(week)}
                  className={cn(
                    "aspect-square p-0 text-xs",
                    isSelected && "ring-2 ring-primary/50"
                  )}
                >
                  {week}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}