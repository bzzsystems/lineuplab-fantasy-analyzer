import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Wifi,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  ExternalLink,
  AlertCircle
} from 'lucide-react'

interface ConnectionGuideProps {
  onConnect: () => void
  className?: string
}

export function ConnectionGuide({ onConnect, className }: ConnectionGuideProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Connection Card */}
      <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900 mb-2">
            Connect Your ESPN League
          </CardTitle>
          <p className="text-blue-700 max-w-md mx-auto">
            Get instant insights into your fantasy football decision-making patterns and see how you compare to your league mates.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Setup Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/80 rounded-xl border border-blue-200/50">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-700 font-bold text-sm">1</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Get ESPN Cookies</h3>
              <p className="text-sm text-slate-600">
                Login to ESPN Fantasy on the same browser
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/80 rounded-xl border border-blue-200/50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-700 font-bold text-sm">2</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Enter League ID</h3>
              <p className="text-sm text-slate-600">
                Find your league ID in the ESPN URL
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/80 rounded-xl border border-blue-200/50">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-700 font-bold text-sm">3</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Analyze!</h3>
              <p className="text-sm text-slate-600">
                Get instant insights and process scores
              </p>
            </div>
          </div>

          {/* Connect Button */}
          <div className="text-center pt-4">
            <button
              onClick={onConnect}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <span>🔗 Connect My League</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="text-xs text-blue-600 mt-3">
              ⚡ Takes less than 30 seconds • Works with any ESPN league
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security & FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Info */}
        <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Shield className="w-5 h-5" />
              <span>Secure & Private</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">
                We only read your lineup data from ESPN
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">
                No passwords stored or saved anywhere
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">
                Cannot modify your league or lineups
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Help */}
        <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-800">
              <Clock className="w-5 h-5" />
              <span>Need Help?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-amber-700 space-y-2">
              <p>
                <strong>Can't find your League ID?</strong><br />
                Look for the number in your ESPN league URL
              </p>
              <p>
                <strong>Private league issues?</strong><br />
                Make sure you're logged into ESPN first
              </p>
              <p>
                <strong>Still having trouble?</strong><br />
                Try refreshing ESPN and connecting again
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What You'll Get Preview */}
      <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-purple-900">
            ✨ What You'll Get After Connecting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-lg border border-purple-200/50">
              <div className="text-2xl font-bold text-purple-700 mb-1">7.8/10</div>
              <div className="text-sm text-purple-600">Process Score</div>
              <div className="text-xs text-slate-500 mt-1">Your decision quality</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg border border-purple-200/50">
              <div className="text-2xl font-bold text-green-700 mb-1">3</div>
              <div className="text-sm text-green-600">Elite Weeks</div>
              <div className="text-xs text-slate-500 mt-1">150+ point games</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg border border-purple-200/50">
              <div className="text-2xl font-bold text-blue-700 mb-1">2nd</div>
              <div className="text-sm text-blue-600">League Rank</div>
              <div className="text-xs text-slate-500 mt-1">Process score ranking</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg border border-purple-200/50">
              <div className="text-2xl font-bold text-amber-700 mb-1">+12.4</div>
              <div className="text-sm text-amber-600">Improvement</div>
              <div className="text-xs text-slate-500 mt-1">Points from better decisions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}