import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Calculator,
  Target, 
  TrendingUp,
  Users,
  AlertTriangle,
  Trophy,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export function ScoringExplanation() {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <Card className="border-slate-200">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <span>How Process Scores Are Calculated</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 font-normal">
              {isExpanded ? 'Click to collapse' : 'Click to learn more'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </CardTitle>
        {!isExpanded && (
          <p className="text-sm text-slate-600">
            Understanding the algorithm behind your fantasy football decision analysis
          </p>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3 max-h-[50vh] overflow-y-auto pb-4">
        
        {/* Algorithm Overview */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
            <Info className="w-4 h-4" />
            <span>Algorithm Overview</span>
          </h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            Your process score measures <strong>decision quality</strong>, not just results. 
            It uses position-specific performance thresholds (kickers need 12+ for elite, QBs need 25+), then adjusts for projection accuracy and bench management. 
            This rewards good process even when luck doesn't go your way.
          </p>
        </div>

        {/* Step-by-Step Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 text-base">Step-by-Step Calculation</h3>
          
          {/* Step 1: Base Score */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-green-800 flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Performance-Based Starting Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Step 2: Projection Adjustment */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-purple-800 flex items-center space-x-2">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Projection Accuracy Bonus/Penalty</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Step 3: Bench Comparison */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-blue-800 flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Bench Management Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Step 4: Bonus Adjustments */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-amber-800 flex items-center space-x-2">
                <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Situational Bonuses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>
        </div>

        {/* Real Examples */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 text-base flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span>Real Examples from Week 1</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Perfect Score Example */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-800 flex items-center justify-between">
                  <span>🔥 Perfect Score (10.0/10)</span>
                  <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">10/10</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
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
              </CardContent>
            </Card>

            {/* Average Score Example */}
            <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-800 flex items-center justify-between">
                  <span>📈 Average Score (5.0/10)</span>
                  <span className="bg-slate-600 text-white px-2 py-1 rounded-full text-xs font-bold">5/10</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Principles */}
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Key Principles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-semibold text-green-800 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
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
                  <AlertTriangle className="w-4 h-4" />
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
          </CardContent>
        </Card>
        
      </CardContent>
      )}
    </Card>
  )
}