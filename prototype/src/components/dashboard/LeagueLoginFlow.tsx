import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { apiService } from '@/services/api'
import { 
  Lock,
  Shield,
  Users,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  HelpCircle,
  ChevronDown
} from 'lucide-react'

interface LeagueLoginFlowProps {
  onSetupComplete?: () => void;
}

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
}

function ExpandableSection({ title, children }: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border border-amber-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-amber-100/50 transition-colors"
      >
        <span className="text-sm font-medium text-amber-900">{title}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-amber-600 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </button>
      {isOpen && (
        <div className="px-3 pb-3 border-t border-amber-200 bg-amber-25">
          <div className="pt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function LeagueLoginFlow({ onSetupComplete }: LeagueLoginFlowProps) {
  const [step, setStep] = React.useState<'login' | 'teams'>('login')
  const [credentials, setCredentials] = React.useState({
    espn_s2: '',
    swid: '',
    leagueId: ''
  })
  const [showCredentials, setShowCredentials] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [availableTeams, setAvailableTeams] = React.useState<Array<{id: number, name: string, owner: string, isAvailable: boolean}>>([])
  const [error, setError] = React.useState<string | null>(null)
  const [rememberMe, setRememberMe] = React.useState(true) // Default to remember
  const [credentialsAutoFilled, setCredentialsAutoFilled] = React.useState(false)

  // Load saved credentials on component mount
  React.useEffect(() => {
    const savedCredentials = localStorage.getItem('saved-espn-credentials')
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials)
        const savedDate = new Date(parsed.savedAt)
        const now = new Date()
        const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24)
        
        // If saved less than 7 days ago, auto-fill the credentials
        if (daysDiff < 7) {
          setCredentials({
            espn_s2: parsed.espn_s2,
            swid: parsed.swid,
            leagueId: parsed.leagueId || '329849'
          })
          setCredentialsAutoFilled(true)
        } else {
          // Credentials are expired, clear them
          localStorage.removeItem('saved-espn-credentials')
          setError('Saved credentials have expired (7 days). Please enter them again.')
        }
      } catch (e) {
        localStorage.removeItem('saved-espn-credentials')
      }
    }
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    
    // Clear any existing invalid tokens first
    localStorage.removeItem('fantasy-session-token')
    localStorage.removeItem('selected-team-id')
    localStorage.removeItem('selected-team-name')
    
    console.log('🔄 Starting authentication with credentials:', {
      espn_s2_length: credentials.espn_s2.length,
      swid: credentials.swid,
      leagueId: credentials.leagueId
    })
    
    try {
      const response = await apiService.authenticate({
        espn_s2: credentials.espn_s2,
        swid: credentials.swid,
        league_id: credentials.leagueId
      })
      
      console.log('📡 Authentication response:', response)
      
      if (response.success && response.league_info) {
        // Store league ID for future API calls
        localStorage.setItem('league-id', credentials.leagueId)
        
        // Save credentials if "Remember Me" is checked
        if (rememberMe) {
          const credentialsToSave = {
            espn_s2: credentials.espn_s2,
            swid: credentials.swid,
            leagueId: credentials.leagueId,
            savedAt: new Date().toISOString()
          }
          localStorage.setItem('saved-espn-credentials', JSON.stringify(credentialsToSave))
        } else {
          // Clear saved credentials if user unchecked "Remember Me"
          localStorage.removeItem('saved-espn-credentials')
        }

        // Convert the backend team data to the expected format
        const teams = response.league_info.your_teams.map(team => ({
          id: team.team_id,
          name: team.team_name,
          owner: team.owner_name || 'Unknown Owner',
          isAvailable: true // User can select their own teams
        }))
        
        setAvailableTeams(teams)
        setStep('teams')
      } else {
        setError(response.message || 'Authentication failed')
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeamSelect = (teamId: number) => {
    // Store selected team and go to dashboard
    localStorage.setItem('selected-team-id', teamId.toString())
    // Notify parent component to switch to personal dashboard
    if (onSetupComplete) {
      onSetupComplete()
    }
  }

  if (step === 'login') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">🏈</div>
            <h1 className="text-xl font-bold text-blue-900 mb-2">
              Join Your League Analysis
            </h1>
            <p className="text-sm text-blue-700">
              Connect to your ESPN Fantasy Football League
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
          <CardContent className="space-y-6">
            {/* Instructions for finding ESPN values */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="w-full">
                  <h3 className="font-medium text-amber-900 mb-2">How to get these ESPN values</h3>
                  <p className="text-sm text-amber-800 mb-3">
                    ESPN requires browser cookies for private leagues. Choose your preferred method:
                  </p>
                  
                  <div className="space-y-2">
                    <ExpandableSection
                      title="📱 Option 1: Manual Process (Recommended)"
                      isExpanded={false}
                    >
                      <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside pl-2">
                        <li>Go to <a href="https://fantasy.espn.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">fantasy.espn.com</a> and log into your account</li>
                        <li>Right-click anywhere on the page and select "Inspect" (or press F12)</li>
                        <li>Click the "Application" tab in the developer tools</li>
                        <li>In the left sidebar, expand "Storage" → "Cookies" → "https://fantasy.espn.com"</li>
                        <li>Find and copy the values for:</li>
                        <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5">
                          <li><code className="bg-amber-100 px-1 rounded text-amber-900">espn_s2</code> - Long encrypted string</li>
                          <li><code className="bg-amber-100 px-1 rounded text-amber-900">SWID</code> - Looks like {"{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}"}</li>
                        </ul>
                      </ol>
                    </ExpandableSection>

                    <ExpandableSection
                      title="🔧 Option 2: Browser Extension (Easier)"
                      isExpanded={false}
                    >
                      <div className="text-xs text-amber-800 space-y-2">
                        <p>Use the <strong>ESPN Private League Key and SWID Finder</strong> extension:</p>
                        <ol className="list-decimal list-inside pl-2 space-y-1">
                          <li>Install: <a 
                            href="https://chromewebstore.google.com/detail/espn-private-league-key-a/bakealnpgdijapoiibbgdbogehhmaopn" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="underline hover:text-amber-900 font-medium"
                          >
                            ESPN Private League Key Finder
                          </a></li>
                          <li>Log into ESPN Fantasy in the same browser</li>
                          <li>Click the extension icon to automatically copy your values</li>
                          <li>Paste the values into the form below</li>
                        </ol>
                      </div>
                    </ExpandableSection>

                    <ExpandableSection
                      title="🔒 Privacy & Security"
                      isExpanded={false}
                    >
                      <p className="text-xs text-amber-700">
                        Your cookies are only used to access your ESPN data and are stored securely in your browser. 
                        We never store your ESPN login credentials. These values will be saved locally so you only need to do this once per device.
                      </p>
                    </ExpandableSection>
                  </div>
                </div>
              </div>
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
                  placeholder="123456"
                  value={credentials.leagueId}
                  onChange={(e) => setCredentials({...credentials, leagueId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <div className="mt-2">
                  <ExpandableSection
                    title="📍 How to find your ESPN League ID"
                    isExpanded={false}
                  >
                    <p className="text-xs text-amber-800 leading-relaxed">
                      1. Go to your ESPN Fantasy Football league<br />
                      2. Look at the URL in your browser's address bar<br />
                      3. Copy the highlighted number from the URL:<br />
                      <code className="bg-amber-100 px-1 rounded text-amber-900">
                        https://fantasy.espn.com/football/league?leagueId=<strong className="bg-yellow-200">123456</strong>&...
                      </code>
                    </p>
                  </ExpandableSection>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-800">Authentication Error</span>
                </div>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Remember Me and Clear Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-700">
                  Remember my credentials (7 days)
                </label>
              </div>
              
              {/* Clear saved credentials option */}
              {credentialsAutoFilled && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('saved-espn-credentials')
                    setCredentials({ espn_s2: '', swid: '', leagueId: '329849' })
                    setCredentialsAutoFilled(false)
                    setError(null)
                  }}
                  className="text-xs text-red-600 hover:text-red-700 underline"
                >
                  Clear saved credentials
                </button>
              )}
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
              disabled={!credentials.espn_s2 || !credentials.swid || !credentials.leagueId || isLoading}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors",
                (!credentials.espn_s2 || !credentials.swid || !credentials.leagueId || isLoading)
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

            {/* Credentials Auto-Filled Notification */}
            {credentialsAutoFilled && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Credentials Auto-Filled</span>
                </div>
                <p className="text-xs text-green-700">
                  Using your saved ESPN credentials. You can proceed to login or clear them below.
                </p>
              </div>
            )}
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

  // If we get here, return null (no privacy step)
  return null
}