// Data types for the ESPN integration (future use)
export interface Player {
  id: string
  name: string
  position: string
  points: number
  projectedPoints?: number
  isStarted: boolean
  lineupSlot?: number
  injuryStatus?: 'healthy' | 'questionable' | 'doubtful' | 'out' | 'ir'
}

export interface WeekData {
  week: number
  totalPoints: number
  processScore: number
  outcomeScore: number
  lineup: Player[]
  bench: Player[]
  context?: string
  weather?: string
  opponent?: string
}

export interface SeasonData {
  year: number
  weeks: WeekData[]
  totalPoints: number
  averagePoints: number
  processScore: number
  eliteGames: number
  goodGames: number
  poorGames: number
  zeroPointGames: number
  benchPoints: number
}

export interface DecisionAnalysis {
  week: number
  position: string
  startedPlayer: string
  startedPoints: number
  optimalPlayer: string
  optimalPoints: number
  pointsDifference: number
  processScore: number
  outcomeScore: number
  feedback: string
  context?: string
}

export interface LeagueInfo {
  id: string
  name: string
  size: number
  currentWeek: number
  teams: TeamInfo[]
}

export interface TeamInfo {
  id: string
  name: string
  ownerName: string
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  isYou: boolean
}

export interface PerformanceMetrics {
  consistency: number
  ceiling: number
  floor: number
  volatility: number
  trendDirection: 'up' | 'down' | 'stable'
}

export interface Recommendation {
  id: string
  type: 'roster' | 'waiver' | 'trade' | 'strategy'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImpact: number
  confidence: number
}