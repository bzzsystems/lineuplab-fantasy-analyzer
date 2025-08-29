import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Zap,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Users,
  Lightbulb,
  Award,
  Brain
} from 'lucide-react'

interface WelcomeFlowProps {
  onGetStarted: () => void
  initialStep?: number
}

export function WelcomeFlow({ onGetStarted, initialStep = 0 }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(initialStep)

  const steps = [
    {
      id: 'welcome',
      title: '🏈 Welcome to LineupLab',
      subtitle: 'The smartest way to analyze your fantasy football decisions'
    },
    {
      id: 'process-score',
      title: '🧠 What is a Process Score?',
      subtitle: 'Your decision-making quality, not just luck'
    },
    {
      id: 'insights',
      title: '📊 What You\'ll Discover',
      subtitle: 'Actionable insights to improve your lineup decisions'
    },
    {
      id: 'ready',
      title: '🚀 Ready to Get Started?',
      subtitle: 'Connect your ESPN league in seconds'
    }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Stop Guessing, Start Winning
              </h2>
              <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                Most fantasy players focus on results. LineupLab focuses on the <strong>quality of your decisions</strong> – 
                because good process leads to consistent wins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200/50">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900 mb-1">Smart Analysis</h3>
                <p className="text-sm text-blue-700">AI-powered insights into your lineup decisions</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200/50">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900 mb-1">Track Progress</h3>
                <p className="text-sm text-green-700">See your decision-making improve over time</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200/50">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-900 mb-1">Beat Friends</h3>
                <p className="text-sm text-purple-700">Compare your process against league mates</p>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Process Score: Your Decision Quality Rating
              </h2>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-700 mb-2">7.8/10</div>
                  <div className="text-sm text-amber-600 mb-4">Sample Process Score</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Started your best WR</span>
                    </div>
                    <span className="text-xs font-medium text-green-600">+1.2 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Benched injured RB</span>
                    </div>
                    <span className="text-xs font-medium text-green-600">+0.8 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Left points on bench</span>
                    </div>
                    <span className="text-xs font-medium text-red-600">-0.5 pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-600 text-sm leading-relaxed">
                Unlike fantasy points (which depend on luck), Process Scores measure the 
                <strong> quality of your pre-game decisions</strong>. Make better choices, win more consistently.
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Insights That Actually Help You Win
              </h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Every analysis is actionable – no fluff, just the insights you need to make better lineup decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Award className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Weekly Breakdowns</h3>
                      <p className="text-sm text-green-700 leading-relaxed">
                        See exactly which lineup decisions helped or hurt you each week
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <BarChart3 className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Season Trends</h3>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        Track your decision-making improvement throughout the season
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Users className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-1">League Rankings</h3>
                      <p className="text-sm text-purple-700 leading-relaxed">
                        Compare your process quality against all league members
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-1">Improvement Areas</h3>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        Specific recommendations to boost your process score
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Ready to Analyze Your Season?
              </h2>
              <p className="text-slate-600 max-w-md mx-auto mb-6">
                Connect your ESPN Fantasy Football league to get instant insights into your decision-making patterns.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200/50 rounded-xl p-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">🔒 Your Data is Safe</h3>
                <p className="text-sm text-blue-700">
                  We only read your lineup data from ESPN. No passwords stored, no league modifications.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <span>🔗 Connect Your ESPN League</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <p className="text-xs text-slate-500">
                Takes less than 30 seconds • Works with any ESPN league
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-4xl h-full flex flex-col justify-center">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  index <= currentStep 
                    ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md" 
                    : "bg-slate-200 text-slate-400"
                )}>
                  {index < currentStep ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-12 h-1 mx-2 rounded-full transition-all duration-300",
                    index < currentStep ? "bg-gradient-to-r from-green-600 to-blue-600" : "bg-slate-200"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-slate-900 mb-1">
              {steps[currentStep]?.title}
            </h1>
            <p className="text-sm text-slate-600">
              {steps[currentStep]?.subtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <Card className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-xl flex-1 max-h-[500px]">
          <CardContent className="p-8 h-full overflow-y-auto">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-colors",
              currentStep === 0 
                ? "text-slate-400 cursor-not-allowed" 
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            ← Back
          </button>

          <div className="text-sm text-slate-500">
            {currentStep + 1} of {steps.length}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-24" /> // Spacer to maintain layout
          )}
        </div>
      </div>
    </div>
  )
}