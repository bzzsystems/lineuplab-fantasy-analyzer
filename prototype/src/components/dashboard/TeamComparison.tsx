import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  TrendingUp,
  TrendingDown, 
  Trophy,
  Target,
  Users,
  ArrowRight,
  Zap,
  Award,
  AlertTriangle
} from 'lucide-react'

export function TeamComparison() {
  const [selectedWeek, setSelectedWeek] = React.useState(13)

  // Mock comparison data
  const comparisonData = {
    yourTeam: {
      name: "Your Team Name",
      owner: "You",
      avatar: "🏈",
      processScore: 7.8,
      totalPoints: 132.4,
      efficiency: 94.2,
      decisions: [
        { position: "QB", player: "Jayden Daniels", points: 23.1, processScore: 9.2, status: "great" },
        { position: "RB", player: "Josh Jacobs", points: 28.6, processScore: 9.8, status: "great" },
        { position: "RB", player: "James Cook", points: 11.2, processScore: 6.1, status: "ok" },
        { position: "WR", player: "CeeDee Lamb", points: 15.7, processScore: 7.4, status: "good" },
        { position: "WR", player: "A.J. Brown", points: 10.9, processScore: 5.2, status: "poor" },
      ]
    },
    opponentTeam: {
      name: "Sarah's Savages", 
      owner: "Sarah",
      avatar: "👑",
      processScore: 8.2,
      totalPoints: 145.8,
      efficiency: 96.8,
      decisions: [
        { position: "QB", player: "Josh Allen", points: 26.3, processScore: 9.5, status: "great" },
        { position: "RB", player: "Christian McCaffrey", points: 22.1, processScore: 8.9, status: "great" },
        { position: "RB", player: "Derrick Henry", points: 18.4, processScore: 8.2, status: "great" },
        { position: "WR", player: "Tyreek Hill", points: 19.6, processScore: 8.8, status: "great" },
        { position: "WR", player: "Davante Adams", points: 12.4, processScore: 7.1, status: "good" },
      ]
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'great': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'  
      case 'ok': return 'text-amber-600 bg-amber-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'great': return '🔥'
      case 'good': return '✅'
      case 'ok': return '📈' 
      case 'poor': return '📉'
      default: return '⚪'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50 to-violet-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Head-to-Head Comparison</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Week:</span>
              <select 
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="px-3 py-1 border border-purple-200 rounded-lg text-sm"
              >
                {Array.from({length: 13}, (_, i) => (
                  <option key={i+1} value={i+1}>Week {i+1}</option>
                ))}
              </select>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Team Headers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Team */}
        <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{comparisonData.yourTeam.avatar}</div>
                <div>
                  <div className="font-bold text-blue-900">{comparisonData.yourTeam.name}</div>
                  <div className="text-sm text-blue-700">{comparisonData.yourTeam.owner}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-700">{comparisonData.yourTeam.processScore}</div>
                <div className="text-sm text-blue-600">Process Score</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-white/60 rounded-lg">
                <div className="text-lg font-bold text-blue-700">{comparisonData.yourTeam.totalPoints}</div>
                <div className="text-xs text-slate-600">Total Points</div>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <div className="text-lg font-bold text-blue-700">{comparisonData.yourTeam.efficiency}%</div>
                <div className="text-xs text-slate-600">Efficiency</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opponent Team */}
        <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{comparisonData.opponentTeam.avatar}</div>
                <div>
                  <div className="font-bold text-green-900">{comparisonData.opponentTeam.name}</div>
                  <div className="text-sm text-green-700">{comparisonData.opponentTeam.owner}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">{comparisonData.opponentTeam.processScore}</div>
                <div className="text-sm text-green-600">Process Score</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-white/60 rounded-lg">
                <div className="text-lg font-bold text-green-700">{comparisonData.opponentTeam.totalPoints}</div>
                <div className="text-xs text-slate-600">Total Points</div>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <div className="text-lg font-bold text-green-700">{comparisonData.opponentTeam.efficiency}%</div>
                <div className="text-xs text-slate-600">Efficiency</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span>Position-by-Position Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.yourTeam.decisions.map((yourDecision, index) => {
              const opponentDecision = comparisonData.opponentTeam.decisions[index]
              const yourBetter = yourDecision.processScore > opponentDecision.processScore

              return (
                <div key={yourDecision.position} className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-slate-700 flex items-center space-x-2">
                      <span className="bg-slate-100 px-2 py-1 rounded text-sm">{yourDecision.position}</span>
                      {yourBetter ? (
                        <span className="text-green-600 text-sm">You Won! 🎉</span>
                      ) : (
                        <span className="text-red-600 text-sm">They Won 😤</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      Process Score Difference: {Math.abs(yourDecision.processScore - opponentDecision.processScore).toFixed(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Your Decision */}
                    <div className={cn(
                      "p-4 rounded-lg border-2",
                      yourBetter ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-slate-900">{yourDecision.player}</div>
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-bold",
                          getStatusColor(yourDecision.status)
                        )}>
                          {getStatusIcon(yourDecision.status)} {yourDecision.processScore}/10
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold">{yourDecision.points} pts</span> • Your Team
                      </div>
                    </div>

                    {/* Opponent Decision */}
                    <div className={cn(
                      "p-4 rounded-lg border-2",
                      !yourBetter ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-slate-900">{opponentDecision.player}</div>
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-bold",
                          getStatusColor(opponentDecision.status)
                        )}>
                          {getStatusIcon(opponentDecision.status)} {opponentDecision.processScore}/10
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold">{opponentDecision.points} pts</span> • {comparisonData.opponentTeam.name}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-slate-600" />
            <span>Week {selectedWeek} Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-700">2</div>
              <div className="text-sm text-slate-600">Positions You Won</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-700">3</div>
              <div className="text-sm text-slate-600">Positions They Won</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">-13.4</div>
              <div className="text-sm text-slate-600">Point Difference</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-amber-800">Key Takeaway</span>
            </div>
            <p className="text-amber-700 text-sm">
              Sarah's team had better process scores across 3 positions, particularly at QB and RB. 
              Your A.J. Brown decision was the main difference maker - consider checking injury reports more carefully.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}