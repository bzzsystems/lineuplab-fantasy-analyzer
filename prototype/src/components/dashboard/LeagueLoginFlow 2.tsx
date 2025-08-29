import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Lock,
  Shield,
  Users,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'

export function LeagueLoginFlow() {
  const [step, setStep] = React.useState<'login' | 'teams' | 'privacy'>('login')
  const [credentials, setCredentials] = React.useState({
    espn_s2: '',
    swid: '',
    leagueId: '329849' // Pre-filled for your league
  })
  const [showCredentials, setShowCredentials] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [availableTeams, setAvailableTeams] = React.useState([
    { id: 3, name: "Sarah's Savages", owner: "Sarah", isAvailable: false },
    { id: 7, name: "Mike's Monsters", owner: "Mike", isAvailable: false },
    { id: 10, name: "Your Team Here", owner: "Available", isAvailable: true },
    { id: 2, name: "Tom's Terrors", owner: "Tom", isAvailable: false },
  ])

  const handleLogin = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setStep('teams')
  }

  const handleTeamSelect = (teamId: number) => {
    setStep('privacy')
  }

  if (step === 'login') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">🏈</div>
            <h1 className="text-xl font-bold text-blue-900 mb-2">
              Join Your League Analysis
            </h1>
            <p className="text-sm text-blue-700">
              Morgan Dwinell is Gay League • 2024 Season
            </p>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Connect Your ESPN Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Instructions */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">How to find your ESPN credentials:</span>
              </div>
              <ol className="text-xs text-amber-700 space-y-1 ml-6 list-decimal">
                <li>Go to ESPN Fantasy Football in your browser</li>
                <li>Open Developer Tools (F12)</li>
                <li>Go to Application → Cookies → espn.com</li>
                <li>Copy the values for "espn_s2" and "SWID"</li>
              </ol>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ESPN S2 Cookie
                </label>
                <div className="relative">
                  <input
                    type={showCredentials ? "text" : "password"}
                    placeholder="AEAg%2FGZPGC8wbwvwsdhwjO..."
                    value={credentials.espn_s2}
                    onChange={(e) => setCredentials({...credentials, espn_s2: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                  >
                    {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SWID Cookie
                </label>
                <input
                  type="text"
                  placeholder="{6E889D57-323D-422B-B872-50335582EEC4}"
                  value={credentials.swid}
                  onChange={(e) => setCredentials({...credentials, swid: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  League ID
                </label>
                <input
                  type="text"
                  value={credentials.leagueId}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Your data is secure</span>
              </div>
              <p className="text-xs text-green-700">
                We encrypt and store your credentials securely. We only access your fantasy data to provide analysis.
              </p>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={!credentials.espn_s2 || !credentials.swid || isLoading}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors",
                (!credentials.espn_s2 || !credentials.swid || isLoading)
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Connect to League</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'teams') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        {/* Success Header */}
        <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-green-900 mb-2">
              Successfully Connected!
            </h1>
            <p className="text-sm text-green-700">
              Choose your team to continue
            </p>
          </CardContent>
        </Card>

        {/* Team Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-slate-600" />
              <span>Select Your Team</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => team.isAvailable && handleTeamSelect(team.id)}
                  disabled={!team.isAvailable}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                    team.isAvailable 
                      ? "border-blue-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                      : "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={cn(
                        "font-semibold",
                        team.isAvailable ? "text-slate-900" : "text-slate-500"
                      )}>
                        {team.name}
                      </div>
                      <div className={cn(
                        "text-sm",
                        team.isAvailable ? "text-slate-600" : "text-slate-400"
                      )}>
                        {team.owner}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {team.isAvailable ? (
                        <span className="text-green-600 text-sm font-medium">Available</span>
                      ) : (
                        <span className="text-slate-400 text-sm">Taken</span>
                      )}
                      <ChevronRight className={cn(
                        "w-4 h-4",
                        team.isAvailable ? "text-blue-600" : "text-slate-400"
                      )} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Privacy Settings Step
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50 to-violet-50">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h1 className="text-xl font-bold text-purple-900 mb-2">
            Privacy Settings
          </h1>
          <p className="text-sm text-purple-700">
            Control what others can see about your team
          </p>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-slate-600" />
            <span>Choose Your Privacy Level</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Option 1 */}
          <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-green-900">📊 Full Transparency (Recommended)</div>
              <input type="radio" name="privacy" defaultChecked className="text-green-600" />
            </div>
            <p className="text-sm text-green-700 mb-3">
              Everyone in the league can view your analysis and compare with you. Maximum fun and engagement!
            </p>
            <ul className="text-xs text-green-600 space-y-1">
              <li>✅ Appears in league rankings</li>
              <li>✅ Others can view your weekly analysis</li>
              <li>✅ Available for head-to-head comparisons</li>
              <li>✅ Contributes to league insights</li>
            </ul>
          </div>

          {/* Option 2 */}
          <div className="p-4 border-2 border-amber-200 bg-amber-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-amber-900">🔒 Limited Sharing</div>
              <input type="radio" name="privacy" className="text-amber-600" />
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Show only your rankings position and basic stats. Keep detailed analysis private.
            </p>
            <ul className="text-xs text-amber-600 space-y-1">
              <li>✅ Appears in league rankings</li>
              <li>❌ Others cannot view detailed analysis</li>
              <li>❌ Not available for comparisons</li>
              <li>✅ Basic stats contribute to league insights</li>
            </ul>
          </div>

          {/* Option 3 */}
          <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-red-900">👻 Private Mode</div>
              <input type="radio" name="privacy" className="text-red-600" />
            </div>
            <p className="text-sm text-red-700 mb-3">
              Complete privacy. Only you can see your analysis.
            </p>
            <ul className="text-xs text-red-600 space-y-1">
              <li>❌ Does not appear in league rankings</li>
              <li>❌ Others cannot view any data</li>
              <li>❌ Not available for comparisons</li>
              <li>❌ No contribution to league insights</li>
            </ul>
          </div>

          {/* Continue Button */}
          <button className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Complete Setup & Enter League 🎉
          </button>
        </CardContent>
      </Card>
    </div>
  )
}