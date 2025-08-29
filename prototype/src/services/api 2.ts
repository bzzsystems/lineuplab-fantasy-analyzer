// ESPN API integration for frontend
const API_BASE_URL = 'http://localhost:8000';

export interface ESPNCredentials {
  espn_s2: string;
  swid: string;
  league_id: string;
}

export interface AuthResponse {
  success: boolean;
  session_token?: string;
  message?: string;
  available_teams?: Array<{
    id: number;
    name: string;
    owner: string;
    isAvailable: boolean;
  }>;
}

export interface TeamAnalysisRequest {
  league_id: string;
  team_id: string;
  year: number;
  start_week: number;
  end_week: number;
}

export interface WeeklyAnalysisData {
  week: number;
  totalPoints: number;
  totalProjected: number;
  projectionDiff: number;
  processScore: number;
  efficiency: number;
  pointsLostToBench: number;
  lineup: Array<{
    position: string;
    player: string;
    espnPoints: number;
    projected: number;
    vsProjected: string;
    processScore: number;
    benchImpact: string;
    scoringLogic: string;
  }>;
  keyInsights: {
    eliteDecisionMaking: string[];
    benchManagement: string[];
    projectionAccuracy: string[];
  };
}

class ESPNApiService {
  private sessionToken: string | null = null;

  async authenticate(credentials: ESPNCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/secure-authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success && data.session_token) {
        this.sessionToken = data.session_token;
        localStorage.setItem('fantasy-session-token', data.session_token);
      }

      return data;
    } catch (error) {
      console.error('Authentication failed:', error);
      return {
        success: false,
        message: 'Failed to connect to server'
      };
    }
  }

  async getTeamAnalysis(request: TeamAnalysisRequest): Promise<{ success: boolean; data?: any; message?: string }> {
    if (!this.sessionToken) {
      this.sessionToken = localStorage.getItem('fantasy-session-token');
    }

    if (!this.sessionToken) {
      return {
        success: false,
        message: 'No valid session token. Please authenticate first.'
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/secure-team-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Team analysis failed:', error);
      return {
        success: false,
        message: 'Failed to fetch team analysis'
      };
    }
  }

  async getWeeklyAnalysis(teamId: string, week: number): Promise<WeeklyAnalysisData | null> {
    const analysis = await this.getTeamAnalysis({
      league_id: '329849', // Your league ID
      team_id: teamId,
      year: 2024,
      start_week: week,
      end_week: week
    });

    if (!analysis.success || !analysis.data) {
      return null;
    }

    // Transform the backend response into the format expected by the frontend
    const weekData = analysis.data.weekly_data?.[week.toString()];
    if (!weekData) return null;

    const teamRoster = weekData.teamRosters?.[teamId];
    if (!teamRoster) return null;

    // Calculate metrics from the roster data
    const totalPoints = teamRoster.lineup?.reduce((sum: number, player: any) => sum + (player.points || 0), 0) || 0;
    const totalProjected = teamRoster.lineup?.reduce((sum: number, player: any) => sum + (player.projected || 0), 0) || 0;

    return {
      week,
      totalPoints,
      totalProjected,
      projectionDiff: totalPoints - totalProjected,
      processScore: 7.5, // Will be calculated by enhanced analysis
      efficiency: totalPoints > 0 ? Math.min(100, (totalPoints / totalProjected) * 100) : 0,
      pointsLostToBench: 0, // Will be calculated
      lineup: teamRoster.lineup?.map((player: any) => ({
        position: player.position || 'FLEX',
        player: player.name || 'Unknown Player',
        espnPoints: player.points || 0,
        projected: player.projected || 0,
        vsProjected: player.points > player.projected ? '+' + (player.points - player.projected).toFixed(1) : (player.points - player.projected).toFixed(1),
        processScore: 7.5, // Will be calculated
        benchImpact: 'TBD', // Will be calculated
        scoringLogic: 'Standard scoring logic' // Will be enhanced
      })) || [],
      keyInsights: {
        eliteDecisionMaking: ['Analysis coming soon'],
        benchManagement: ['Bench analysis coming soon'],
        projectionAccuracy: ['Projection analysis coming soon']
      }
    };
  }

  clearSession() {
    this.sessionToken = null;
    localStorage.removeItem('fantasy-session-token');
  }
}

export const apiService = new ESPNApiService();