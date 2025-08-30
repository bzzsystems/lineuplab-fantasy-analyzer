// ESPN API integration for frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ESPNCredentials {
  espn_s2: string;
  swid: string;
  league_id: string;
}

export interface AuthResponse {
  session_token?: string;
  expires_in?: number;
  league_info?: {
    league_id: string;
    name: string;
    current_week: number;
    your_teams: Array<{
      team_id: number;
      team_name: string;
      owners: Array<{
        display_name: string;
        id: string;
      }>;
    }>;
  };
  detail?: string; // For error responses
}

export interface TeamAnalysisRequest {
  league_id: string;
  team_id: string;
  year: number;
  start_week: number;
  end_week: number;
}

export interface PlayerAnalysis {
  position: string;
  name: string;
  espnPoints: number;
  projected: number;
  projectionDiff: number;
  projectionIcon: string;
  processScore: number;
  benchAlternative: string | null;
  benchPoints: number;
  benchImpact: string;
  reasoning: string;
  detailedScoring?: {
    baseScore: number;
    baseReason: string;
    projectionBonus?: number;
    projectionPenalty?: number;
    projectionReason: string;
    benchBonus?: number;
    benchPenalty?: number;
    benchReason: string;
    total: number;
    breakdown: Array<{
      component: string;
      points: number;
      description: string;
    }>;
  };
}

export interface WeeklyAnalysisData {
  week: number;
  totalPoints: number;
  totalProjected: number;
  projectionDiff: number;
  processScore: number;
  efficiency: number;
  pointsLostToBench: number;
  context: string;
  lineup: PlayerAnalysis[];
  keyInsights: {
    eliteDecisionMaking: string[];
    benchManagement: string[];
    projectionAccuracy: string[];
  };
  bottomLine: string;
}

class ESPNApiService {
  private sessionToken: string | null = null;

  async authenticate(credentials: ESPNCredentials): Promise<AuthResponse & { success: boolean; message?: string }> {
    console.log('🔄 Starting authentication request to:', `${API_BASE_URL}/secure-authenticate`);
    console.log('📊 Credentials:', { 
      league_id: credentials.league_id, 
      espn_s2_length: credentials.espn_s2?.length || 0, 
      swid: credentials.swid 
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/secure-authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📋 Response data:', data);
      
      if (response.ok && data.session_token) {
        this.sessionToken = data.session_token;
        localStorage.setItem('fantasy-session-token', data.session_token);
        console.log('✅ Authentication successful!');
        return { ...data, success: true };
      } else {
        console.log('❌ Authentication failed:', data);
        return {
          success: false,
          message: data.detail || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('💥 Network error during authentication:', error);
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
      // Add small delay to prevent resource exhaustion
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await fetch(`${API_BASE_URL}/secure-team-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
        return {
          success: false,
          message: response.status === 401 
            ? 'Session expired. Please re-authenticate.' 
            : response.status === 403
            ? 'Access forbidden. Please check your credentials.'
            : response.status === 404
            ? 'Team or league not found. Please verify your league settings.'
            : response.status === 500
            ? 'Server error. Please try again in a few minutes.'
            : errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Team analysis failed:', error);
      return {
        success: false,
        message: 'Failed to fetch team analysis. Please re-authenticate.'
      };
    }
  }

  // Position-specific scoring thresholds
  private getPositionThresholds(position: string) {
    const thresholds = {
      'QB': { elite: 25, good: 20, average: 15 },
      'RB': { elite: 20, good: 15, average: 10 },
      'WR': { elite: 20, good: 15, average: 10 },
      'TE': { elite: 15, good: 10, average: 5 },
      'FLEX': { elite: 18, good: 12, average: 8 },
      'K': { elite: 12, good: 8, average: 6 },
      'D/ST': { elite: 15, good: 10, average: 5 }
    };
    return thresholds[position as keyof typeof thresholds] || thresholds['FLEX'];
  }

  private getProjectedPoints(player: any): number {
    // Use actual projected points from ESPN API
    return player.projected || 0;
  }

  private calculatePlayerProcessScore(player: any, benchPlayers: any[], projectedPoints: number = 0): PlayerAnalysis {
    const position = player.position || 'FLEX';
    const points = player.points || 0;
    const thresholds = this.getPositionThresholds(position);
    
    // Determine base score based on performance tier
    let baseScore = 3.0; // Poor base
    let tier = 'Poor';
    
    if (points >= thresholds.elite) {
      baseScore = 7.5;
      tier = 'Elite';
    } else if (points >= thresholds.good) {
      baseScore = 6.0;
      tier = 'Good';  
    } else if (points >= thresholds.average) {
      baseScore = 5.0;
      tier = 'Average';
    }

    // Calculate projection bonus/penalty
    const projectionDiff = points - projectedPoints;
    let projectionAdjustment = 0;
    if (Math.abs(projectionDiff) > 2) {
      projectionAdjustment = projectionDiff > 0 ? 
        Math.min(1.5, projectionDiff * 0.15) : 
        Math.max(-1.0, projectionDiff * 0.1);
    }

    // Find best bench alternative for same position
    const positionBench = benchPlayers.filter(p => 
      p.position === position || 
      (position === 'FLEX' && ['RB', 'WR', 'TE'].includes(p.position))
    );
    
    const bestBenchOption = positionBench.length > 0 ? 
      positionBench.reduce((best, current) => 
        current.points > best.points ? current : best
      ) : null;

    // Calculate bench bonus/penalty
    let benchAdjustment = 0;
    let benchImpact = 'No alternatives';
    let benchAlternative = null;
    let benchPoints = 0;

    if (bestBenchOption) {
      benchAlternative = bestBenchOption.name;
      benchPoints = bestBenchOption.points;
      const benchDiff = points - bestBenchOption.points;
      
      if (Math.abs(benchDiff) > 1) {
        benchAdjustment = benchDiff > 0 ? 
          Math.min(1.0, benchDiff * 0.1) : 
          Math.max(-1.0, benchDiff * 0.15);
      }
      
      benchImpact = benchDiff > 0 ? 
        `✅ Beat ${bestBenchOption.name} (${bestBenchOption.points.toFixed(1)})` :
        `⚠️ ${bestBenchOption.name} (+${Math.abs(benchDiff).toFixed(1)})`;
    }

    const totalScore = Math.min(10, Math.max(0, baseScore + projectionAdjustment + benchAdjustment));

    // Generate reasoning
    let reasoning = `${tier} base`;
    if (projectionAdjustment > 0) reasoning += ' + Beat projection';
    if (projectionAdjustment < 0) reasoning += ' - Missed projection';
    if (benchAdjustment > 0) reasoning += ' + Beat bench';
    if (benchAdjustment < 0) reasoning += ' - Bench miss';
    if (!bestBenchOption) reasoning += ' (no bench)';

    // Create detailed scoring breakdown
    const breakdown = [
      {
        component: `Base Score (${tier})`,
        points: baseScore,
        description: `${points.toFixed(1)} pts ${tier === 'Elite' ? '≥' : 'in'} ${tier === 'Elite' ? thresholds.elite : tier === 'Good' ? 'Good range (' + thresholds.average + '-' + thresholds.elite + ')' : tier === 'Average' ? 'Average range (' + thresholds.average + '-' + thresholds.good + ')' : '< ' + thresholds.average + ' (Poor)'}`
      }
    ];

    if (projectionAdjustment !== 0) {
      breakdown.push({
        component: projectionAdjustment > 0 ? 'Projection Bonus' : 'Projection Miss',
        points: projectionAdjustment,
        description: `${projectionAdjustment > 0 ? 'Beat' : 'Missed'} ${projectedPoints.toFixed(1)} projection by ${Math.abs(projectionDiff).toFixed(1)} pts`
      });
    }

    if (bestBenchOption) {
      breakdown.push({
        component: benchAdjustment >= 0 ? 'Bench Bonus' : 'Bench Miss',
        points: benchAdjustment,
        description: `${bestBenchOption.name} (${bestBenchOption.points.toFixed(1)}) ${benchAdjustment >= 0 ? 'outscored' : 'scored'} by ${Math.abs(points - bestBenchOption.points).toFixed(1)} pts`
      });
    } else {
      breakdown.push({
        component: 'Bench Impact',
        points: 0,
        description: 'No bench alternatives to compare'
      });
    }

    return {
      position,
      name: player.name || 'Unknown Player',
      espnPoints: points,
      projected: projectedPoints,
      projectionDiff,
      projectionIcon: projectionDiff > 0 ? '📈' : projectionDiff < 0 ? '📉' : '➡️',
      processScore: totalScore,
      benchAlternative,
      benchPoints,
      benchImpact,
      reasoning,
      detailedScoring: {
        baseScore,
        baseReason: `${tier} performance (${tier === 'Elite' ? thresholds.elite + '+' : tier === 'Good' ? thresholds.average + '-' + thresholds.elite : tier === 'Average' ? '5-' + thresholds.good : '<' + thresholds.average} pts for ${position})`,
        projectionBonus: projectionAdjustment > 0 ? projectionAdjustment : undefined,
        projectionPenalty: projectionAdjustment < 0 ? projectionAdjustment : undefined,
        projectionReason: projectionAdjustment !== 0 ? 
          `${projectionAdjustment > 0 ? 'Beat' : 'Missed'} projection by ${Math.abs(projectionDiff).toFixed(1)} pts (${projectionAdjustment > 0 ? '+' : ''}${projectionAdjustment.toFixed(1)})` :
          'Met projection exactly',
        benchBonus: benchAdjustment > 0 ? benchAdjustment : undefined,
        benchPenalty: benchAdjustment < 0 ? benchAdjustment : undefined,
        benchReason: bestBenchOption ? 
          `${bestBenchOption.name} scored ${Math.abs(points - bestBenchOption.points).toFixed(1)} pts ${benchAdjustment >= 0 ? 'less' : 'more'} (${benchAdjustment > 0 ? '+' : ''}${benchAdjustment.toFixed(1)})` :
          'No bench alternatives available',
        total: totalScore,
        breakdown
      }
    };
  }

  async getWeeklyAnalysis(teamId: string, week: number, year: number = 2024): Promise<WeeklyAnalysisData | null> {
    // Get stored league ID
    const leagueId = localStorage.getItem('league-id') || '329849';
    
    const analysis = await this.getTeamAnalysis({
      league_id: leagueId,
      team_id: teamId,
      year: year,
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

    const lineupPlayers = teamRoster.lineup || [];
    const benchPlayers = teamRoster.bench || [];

    // Calculate lineup analysis with real decision-making algorithm
    const analyzedLineup = lineupPlayers.map((player: any) => 
      this.calculatePlayerProcessScore(player, benchPlayers, this.getProjectedPoints(player))
    );

    const totalPoints = analyzedLineup.reduce((sum, player) => sum + player.espnPoints, 0);
    const totalProjected = analyzedLineup.reduce((sum, player) => sum + player.projected, 0);
    const avgProcessScore = analyzedLineup.reduce((sum, player) => sum + player.processScore, 0) / analyzedLineup.length;
    
    // Calculate points lost to bench
    const bestBenchScores = benchPlayers.map((bp: any) => bp.points || 0).sort((a: number, b: number) => b - a);
    const worstLineupScores = analyzedLineup.map(p => p.espnPoints).sort((a, b) => a - b);
    let pointsLostToBench = 0;
    for (let i = 0; i < Math.min(bestBenchScores.length, worstLineupScores.length); i++) {
      if (bestBenchScores[i] > worstLineupScores[i]) {
        pointsLostToBench += bestBenchScores[i] - worstLineupScores[i];
      }
    }

    // Generate insights
    const eliteDecisions = analyzedLineup.filter(p => p.processScore >= 8);
    const benchMisses = analyzedLineup.filter(p => p.benchImpact.includes('⚠️'));
    const projectionBeats = analyzedLineup.filter(p => p.projectionDiff > 5);

    const analysisResult = {
      week,
      totalPoints: Math.round(totalPoints * 10) / 10,
      totalProjected: Math.round(totalProjected * 10) / 10,
      projectionDiff: Math.round((totalPoints - totalProjected) * 10) / 10,
      processScore: Math.round(avgProcessScore * 10) / 10,
      efficiency: totalProjected > 0 ? Math.round(((totalPoints - pointsLostToBench) / totalPoints) * 1000) / 10 : 0,
      pointsLostToBench: Math.round(pointsLostToBench * 10) / 10,
      context: eliteDecisions.length >= 2 ? `Elite decision-making drives strong week` : 
               benchMisses.length >= 3 ? `Multiple bench optimization opportunities` :
               projectionBeats.length >= 2 ? `Projection smashes overcome lineup issues` :
               `Mixed performance with ${Math.round(avgProcessScore * 10) / 10}/10 average process score`,
      lineup: analyzedLineup,
      keyInsights: {
        eliteDecisionMaking: eliteDecisions.length > 0 ? 
          eliteDecisions.slice(0, 3).map(p => `${p.position} Choice: ${p.name} delivered ${p.processScore}/10 process score`) :
          ['Focus on identifying high-leverage position decisions'],
        benchManagement: benchMisses.length > 0 ?
          benchMisses.slice(0, 3).map(p => p.benchImpact.replace('⚠️ ', '').replace('(+', ' could have gained ').replace(')', ' points')) :
          [`Excellent bench management - only ${pointsLostToBench.toFixed(1)} points left on bench`],
        projectionAccuracy: [
          `${totalPoints > totalProjected ? '+' : ''}${(totalPoints - totalProjected).toFixed(1)} points vs projections (${Math.round((totalPoints / totalProjected) * 100)}% accuracy)`,
          `${projectionBeats.length} players significantly exceeded projections`,
          `Biggest beats: ${projectionBeats.slice(0, 2).map(p => `${p.name} (+${p.projectionDiff.toFixed(1)})`).join(', ') || 'None'}`
        ]
      },
      bottomLine: `You executed ${eliteDecisions.length} elite decisions with a ${avgProcessScore.toFixed(1)}/10 average process score. ${pointsLostToBench > 5 ? `Consider ${benchMisses.length} lineup optimizations that could have gained ${pointsLostToBench.toFixed(1)} points.` : 'Strong lineup construction with minimal bench regrets.'} Your ${totalPoints.toFixed(1)} points with ${Math.round(((totalPoints - pointsLostToBench) / totalPoints) * 100)}% efficiency demonstrates ${avgProcessScore >= 7 ? 'excellent' : avgProcessScore >= 6 ? 'solid' : avgProcessScore >= 5 ? 'average' : 'developing'} fantasy management.`
    };

    return analysisResult;
  }

  async getLeagueAnalysis(year: number = 2024): Promise<any> {
    if (!this.sessionToken) {
      this.sessionToken = localStorage.getItem('fantasy-session-token');
    }

    if (!this.sessionToken) {
      return null;
    }

    try {
      // Get all teams analysis data
      const response = await fetch(`${API_BASE_URL}/secure-all-teams-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify({
          league_id: localStorage.getItem('league-id') || '329849',
          year: year,
          start_week: 1,
          end_week: 17
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.teams) {
        return null;
      }

      // Process all teams with the same analysis engine
      const leagueAnalysis = {};

      for (const [teamId, teamData] of Object.entries(data.teams as any)) {
        const weeklyData = teamData.weekly_data || {};
        const weeks = Object.keys(weeklyData)
          .filter(w => parseInt(w) <= 17)
          .sort((a, b) => parseInt(a) - parseInt(b));

        // Process each week to get analytics
        const weeklyAnalytics = [];
        let totalPoints = 0;
        let totalProcessScore = 0;
        let eliteGames = 0;
        let strongGames = 0;
        let averageGames = 0;
        let poorGames = 0;

        for (const week of weeks) {
          const weekNum = parseInt(week);
          const weekDataForWeek = weeklyData[week];
          
          if (!weekDataForWeek) continue;

          const lineupPlayers = weekDataForWeek.lineup || [];
          const benchPlayers = weekDataForWeek.bench || [];

          // Calculate weekly metrics using the same algorithm
          const analyzedLineup = lineupPlayers.map((player: any) => 
            this.calculatePlayerProcessScore(player, benchPlayers, this.getProjectedPoints(player))
          );

          const weekPoints = analyzedLineup.reduce((sum, player) => sum + player.espnPoints, 0);
          const validProcessScores = analyzedLineup.filter(p => 
            p.processScore !== null && 
            p.processScore !== undefined && 
            !isNaN(p.processScore) && 
            p.processScore > 0
          );
          const weekProcessScore = validProcessScores.length > 0 ? 
            validProcessScores.reduce((sum, player) => sum + player.processScore, 0) / validProcessScores.length : 
            5.0; // Default to middle score if no valid scores

          totalPoints += weekPoints;
          totalProcessScore += weekProcessScore;

          // Count performance tiers based on Process Score
          if (weekProcessScore >= 8.0) eliteGames++;
          else if (weekProcessScore >= 6.5) strongGames++;
          else if (weekProcessScore >= 5.0) averageGames++;
          else poorGames++;

          // Find top performer and any major misses
          const topPerformer = analyzedLineup.reduce((best, current) => 
            current.espnPoints > best.espnPoints ? current : best, analyzedLineup[0] || { name: 'None', espnPoints: 0 });
          
          const bigMiss = analyzedLineup.find(p => p.benchImpact.includes('⚠️') && 
            parseFloat(p.benchImpact.match(/\+(\d+\.?\d*)/)?.[1] || '0') > 5);

          weeklyAnalytics.push({
            week: weekNum,
            points: Math.round(weekPoints * 10) / 10,
            topPlayer: topPerformer?.name || 'Unknown',
            topPoints: Math.round((topPerformer?.espnPoints || 0) * 10) / 10,
            processScore: Math.round(weekProcessScore * 10) / 10,
            bigMiss: bigMiss?.benchAlternative || null
          });
        }

        const avgPoints = weeks.length > 0 ? totalPoints / weeks.length : 0;
        const avgProcessScore = weeks.length > 0 ? totalProcessScore / weeks.length : 0;

        // Calculate season highlights and improvement areas
        const allPlayerPerformances = [];
        const positionMisses = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, 'D/ST': 0, FLEX: 0 };

        for (const week of weeks) {
          const weekDataForWeek = weeklyData[week];
          if (!weekDataForWeek) continue;

          const lineupPlayers = weekDataForWeek.lineup || [];
          const benchPlayers = weekDataForWeek.bench || [];
          const analyzedLineup = lineupPlayers.map((player: any) => 
            this.calculatePlayerProcessScore(player, benchPlayers, this.getProjectedPoints(player))
          );

          // Track individual performances
          analyzedLineup.forEach(player => {
            if (player.espnPoints >= 20) {
              allPlayerPerformances.push({
                week: parseInt(week),
                player: player.name,
                points: player.espnPoints,
                type: player.espnPoints >= 25 ? 'elite' : 'good'
              });
            }

            // Track position-specific misses
            if (player.benchImpact.includes('⚠️')) {
              const missedPoints = parseFloat(player.benchImpact.match(/\+(\d+\.?\d*)/)?.[1] || '0');
              positionMisses[player.position as keyof typeof positionMisses] += missedPoints;
            }
          });
        }

        // Get top 5 highlights
        const seasonHighlights = allPlayerPerformances
          .sort((a, b) => b.points - a.points)
          .slice(0, 5);

        // Calculate improvement areas
        const improvementAreas = Object.entries(positionMisses)
          .filter(([_, points]) => points > 5)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 4)
          .map(([position, points]) => ({
            area: `${position} ${position === 'RB' ? 'Rotation Timing' : position === 'WR' ? 'Matchup Analysis' : position === 'QB' ? 'Streaming Decisions' : 'Start/Sit Decisions'}`,
            impact: `+${points.toFixed(1)} pts`,
            priority: points > 15 ? 'high' : points > 8 ? 'medium' : 'low',
            description: position === 'RB' ? 'Better start/sit decisions for running backs' :
                        position === 'WR' ? 'Exploit favorable receiver matchups' :
                        position === 'QB' ? 'Optimize quarterback streaming' :
                        position === 'TE' ? 'Improve tight end selection' :
                        position === 'K' ? 'Target dome games and good matchups' :
                        position === 'D/ST' ? 'Stream defenses more effectively' :
                        'General lineup optimization'
          }));

        leagueAnalysis[teamId] = {
          teamId,
          teamName: teamData.team_name || teamData.teamName || `Team ${teamId}`,
          ownerName: teamData.owner_name || teamData.ownerName || 'Unknown Owner',
          seasonSummary: {
            avgPoints: Math.round(avgPoints * 10) / 10,
            avgProcessScore: Math.round(avgProcessScore * 10) / 10,
            totalWeeks: weeks.length,
            eliteGames,
            strongGames,
            averageGames,
            poorGames,
            benchPoints: 0 // Calculate if needed
          },
          weeklyPerformance: weeklyAnalytics,
          seasonHighlights,
          improvementAreas
        };
      }

      return leagueAnalysis;

    } catch (error) {
      console.error('League analysis failed:', error);
      return null;
    }
  }

  async getSeasonSummary(teamId: string, year: number = 2024): Promise<any> {
    if (!this.sessionToken) {
      this.sessionToken = localStorage.getItem('fantasy-session-token');
    }

    if (!this.sessionToken) {
      return null;
    }

    try {
      // Get stored league ID
      const leagueId = localStorage.getItem('league-id') || '329849';
      
      // Get data for weeks 1-17 
      const analysis = await this.getTeamAnalysis({
        league_id: leagueId,
        team_id: teamId,
        year: year,
        start_week: 1,
        end_week: 17
      });

      if (!analysis.success || !analysis.data) {
        return null;
      }

      const weeklyData = analysis.data.weekly_data || {};
      const weeks = Object.keys(weeklyData)
        .filter(w => parseInt(w) <= 17)
        .sort((a, b) => parseInt(a) - parseInt(b));

      // Process each week to get analytics
      const weeklyAnalytics = [];
      let totalPoints = 0;
      let totalProcessScore = 0;
      let eliteGames = 0;
      let strongGames = 0;
      let averageGames = 0;
      let poorGames = 0;

      for (const week of weeks) {
        const weekNum = parseInt(week);
        const weekData = weeklyData[week];
        const teamRoster = weekData.teamRosters?.[teamId];
        
        if (!teamRoster) continue;

        const lineupPlayers = teamRoster.lineup || [];
        const benchPlayers = teamRoster.bench || [];

        // Calculate weekly metrics
        const analyzedLineup = lineupPlayers.map((player: any) => 
          this.calculatePlayerProcessScore(player, benchPlayers, this.getProjectedPoints(player))
        );

        const weekPoints = analyzedLineup.reduce((sum, player) => sum + player.espnPoints, 0);
        const weekProjected = analyzedLineup.reduce((sum, player) => sum + player.projected, 0);
        const weekProcessScore = analyzedLineup.reduce((sum, player) => sum + player.processScore, 0) / analyzedLineup.length;

        totalPoints += weekPoints;
        totalProcessScore += weekProcessScore;

        // Count performance tiers based on Process Score
        if (weekProcessScore >= 8.0) eliteGames++;
        else if (weekProcessScore >= 6.5) strongGames++;
        else if (weekProcessScore >= 5.0) averageGames++;
        else poorGames++;

        // Find top performer and any major misses
        const topPerformer = analyzedLineup.reduce((best, current) => 
          current.espnPoints > best.espnPoints ? current : best, analyzedLineup[0] || { name: 'None', espnPoints: 0 });
        
        const bigMiss = analyzedLineup.find(p => p.benchImpact.includes('⚠️') && 
          parseFloat(p.benchImpact.match(/\+(\d+\.?\d*)/)?.[1] || '0') > 5);

        weeklyAnalytics.push({
          week: weekNum,
          points: Math.round(weekPoints * 10) / 10,
          topPlayer: topPerformer?.name || 'Unknown',
          topPoints: Math.round((topPerformer?.espnPoints || 0) * 10) / 10,
          processScore: Math.round(weekProcessScore * 10) / 10,
          bigMiss: bigMiss?.benchAlternative || null
        });
      }

      const avgPoints = weeks.length > 0 ? totalPoints / weeks.length : 0;
      const avgProcessScore = weeks.length > 0 ? totalProcessScore / weeks.length : 0;

      // Calculate season highlights and improvement areas
      const allPlayerPerformances = [];
      const positionMisses = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, 'D/ST': 0, FLEX: 0 };

      for (const week of weeks) {
        const weekData = weeklyData[week];
        const teamRoster = weekData.teamRosters?.[teamId];
        if (!teamRoster) continue;

        const lineupPlayers = teamRoster.lineup || [];
        const benchPlayers = teamRoster.bench || [];
        const analyzedLineup = lineupPlayers.map((player: any) => 
          this.calculatePlayerProcessScore(player, benchPlayers, this.getProjectedPoints(player))
        );

        // Track individual performances
        analyzedLineup.forEach(player => {
          if (player.espnPoints >= 20) {
            allPlayerPerformances.push({
              week: parseInt(week),
              player: player.name,
              points: player.espnPoints,
              type: player.espnPoints >= 25 ? 'elite' : 'good'
            });
          }

          // Track position-specific misses
          if (player.benchImpact.includes('⚠️')) {
            const missedPoints = parseFloat(player.benchImpact.match(/\+(\d+\.?\d*)/)?.[1] || '0');
            positionMisses[player.position as keyof typeof positionMisses] += missedPoints;
          }
        });
      }

      // Get top 5 highlights
      const seasonHighlights = allPlayerPerformances
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);

      // Calculate improvement areas
      const improvementAreas = Object.entries(positionMisses)
        .filter(([_, points]) => points > 5)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([position, points]) => ({
          area: `${position} ${position === 'RB' ? 'Rotation Timing' : position === 'WR' ? 'Matchup Analysis' : position === 'QB' ? 'Streaming Decisions' : 'Start/Sit Decisions'}`,
          impact: `+${points.toFixed(1)} pts`,
          priority: points > 15 ? 'high' : points > 8 ? 'medium' : 'low',
          description: position === 'RB' ? 'Better start/sit decisions for running backs' :
                      position === 'WR' ? 'Exploit favorable receiver matchups' :
                      position === 'QB' ? 'Optimize quarterback streaming' :
                      position === 'TE' ? 'Improve tight end selection' :
                      position === 'K' ? 'Target dome games and good matchups' :
                      position === 'D/ST' ? 'Stream defenses more effectively' :
                      'General lineup optimization'
        }));

      return {
        seasonSummary: {
          avgPoints: Math.round(avgPoints * 10) / 10,
          avgProcessScore: Math.round(avgProcessScore * 10) / 10,
          totalWeeks: weeks.length,
          eliteGames,
          strongGames,
          averageGames,
          poorGames,
          benchPoints: 0 // Calculate if needed
        },
        weeklyPerformance: weeklyAnalytics,
        seasonHighlights,
        improvementAreas
      };

    } catch (error) {
      console.error('Season summary failed:', error);
      return null;
    }
  }

  // FAST LOADING METHODS - Added to fix 3-5 minute load times

  async getInstantTeamInfo(teamId: string, year: number = 2024): Promise<any> {
    if (!this.sessionToken) {
      this.sessionToken = localStorage.getItem('fantasy-session-token');
    }

    if (!this.sessionToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/secure-team-instant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify({
          league_id: localStorage.getItem('league-id') || '329849',
          team_id: teamId,
          year: year
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Instant team info failed:', errorData);
        return null;
      }

      const data = await response.json();
      console.log('✨ Instant team info loaded:', data);
      return data;
    } catch (error) {
      console.error('Network error in instant team info:', error);
      return null;
    }
  }

  async getQuickTeamSummary(teamId: string, year: number = 2024): Promise<any> {
    if (!this.sessionToken) {
      this.sessionToken = localStorage.getItem('fantasy-session-token');
    }

    if (!this.sessionToken) {
      console.error('❌ No session token available for quick team summary')
      throw new Error('No valid session. Please log in again.');
    }

    try {
      // Add small delay to prevent resource exhaustion
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await fetch(`${API_BASE_URL}/secure-team-quick-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify({
          league_id: localStorage.getItem('league-id') || '329849',
          team_id: teamId,
          year: year
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(errorData.detail || 'Quick summary failed');
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Quick team summary failed:', error);
      return null;
    }
  }

  async getTeamWeekRange(teamId: string, startWeek: number, endWeek: number, year: number = 2024): Promise<any> {
    if (!this.sessionToken) {
      this.sessionToken = localStorage.getItem('fantasy-session-token');
    }

    if (!this.sessionToken) {
      console.error('❌ No session token available for week range request')
      throw new Error('No valid session. Please log in again.');
    }

    try {
      // Add small delay to prevent resource exhaustion
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await fetch(`${API_BASE_URL}/secure-team-week-range`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify({
          league_id: localStorage.getItem('league-id') || '329849',
          team_id: teamId,
          year: year,
          start_week: startWeek,
          end_week: endWeek
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(errorData.detail || 'Week range request failed');
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Team week range failed:', error);
      return null;
    }
  }

  async getProgressiveSeasonSummary(teamId: string, year: number = 2024, progressCallback?: (progress: { loaded: number, total: number, weeks: number[] }) => void): Promise<any> {
    // First, get the quick summary (last 3 weeks)
    console.log('📊 Starting progressive loading with quick summary')
    const quickData = await this.getQuickTeamSummary(teamId, year);
    
    if (!quickData) {
      console.error('❌ Quick summary failed, cannot start progressive loading')
      throw new Error('Unable to load initial team data. Please check your connection and re-authenticate if needed.');
    }

    // Process the quick data into season format
    let combinedWeeklyData = quickData.weekly_data || {};
    let processedWeeks = Object.keys(combinedWeeklyData).map(w => parseInt(w)).sort((a, b) => a - b);
    
    // Notify progress
    if (progressCallback) {
      progressCallback({ loaded: processedWeeks.length, total: 17, weeks: processedWeeks });
    }

    // Now load the rest of the season in chunks
    const allWeeks = Array.from({length: 17}, (_, i) => i + 1);
    const remainingWeeks = allWeeks.filter(w => !processedWeeks.includes(w));
    
    if (remainingWeeks.length > 0) {
      console.log(`📊 Loading remaining ${remainingWeeks.length} weeks in chunks`)
    }
    
    // Load in chunks of 5 weeks
    const chunkSize = 5;
    let failedChunks = 0;
    
    for (let i = 0; i < remainingWeeks.length; i += chunkSize) {
      const chunk = remainingWeeks.slice(i, i + chunkSize);
      if (chunk.length === 0) continue;
      
      const startWeek = Math.min(...chunk);
      const endWeek = Math.max(...chunk);
      
      try {
        console.log(`📊 Loading weeks ${startWeek}-${endWeek}...`)
        const chunkData = await this.getTeamWeekRange(teamId, startWeek, endWeek, year);
        
        if (chunkData && chunkData.weekly_data) {
          // Merge the new data
          combinedWeeklyData = { ...combinedWeeklyData, ...chunkData.weekly_data };
          processedWeeks = Object.keys(combinedWeeklyData).map(w => parseInt(w)).sort((a, b) => a - b);
          
          console.log(`✅ Successfully loaded weeks ${startWeek}-${endWeek}`)
          
          // Notify progress
          if (progressCallback) {
            progressCallback({ loaded: processedWeeks.length, total: 17, weeks: processedWeeks });
          }
        } else {
          console.warn(`⚠️ No data returned for weeks ${startWeek}-${endWeek}`)
          failedChunks++;
        }
      } catch (error) {
        console.error(`❌ Failed to load weeks ${startWeek}-${endWeek}:`, error);
        failedChunks++;
        
        // If this is an auth error, stop trying other chunks
        if (error.message && (error.message.includes('session') || error.message.includes('401'))) {
          console.error('❌ Authentication error detected, stopping progressive loading')
          throw error;
        }
        
        // Continue loading other chunks, but log the failure
        if (progressCallback) {
          progressCallback({ loaded: processedWeeks.length, total: 17, weeks: [...processedWeeks, `Error: ${startWeek}-${endWeek}`] });
        }
      }
    }
    
    // If too many chunks failed, throw an error
    if (failedChunks > Math.ceil(remainingWeeks.length / chunkSize / 2)) {
      console.error(`❌ Too many chunks failed (${failedChunks}), progressive loading considered failed`)
      throw new Error(`Failed to load most of the season data. Loaded ${processedWeeks.length}/17 weeks.`);
    }

    // Process the combined data into season summary format
    console.log(`📊 Processing ${Object.keys(combinedWeeklyData).length} weeks of data into season summary`)
    const result = this.processSeasonDataFromWeekly(combinedWeeklyData, teamId, year);
    console.log('✅ Season summary processed successfully:', result ? 'Valid data' : 'No data returned')
    return result;
  }

  private processSeasonDataFromWeekly(weeklyData: any, teamId: string, year: number): any {
    const weeks = Object.keys(weeklyData)
      .filter(w => parseInt(w) <= 17)
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    console.log('📊 Processing weeks:', weeks, 'for team:', teamId)
    
    if (weeks.length === 0) {
      console.error('❌ No weeks found in weekly data')
      return null;
    }

    // Process each week to get analytics (same logic as before)
    const weeklyAnalytics = [];
    let totalPoints = 0;
    let totalProcessScore = 0;
    let eliteGames = 0;
    let strongGames = 0;
    let averageGames = 0;
    let poorGames = 0;

    for (const week of weeks) {
      const weekNum = parseInt(week);
      const weekData = weeklyData[week];
      const teamRoster = weekData.teamRosters?.[teamId];
      
      if (!teamRoster) continue;

      const lineupPlayers = teamRoster.lineup || [];
      const benchPlayers = teamRoster.bench || [];

      // Calculate weekly metrics
      const analyzedLineup = lineupPlayers.map((player: any) => 
        this.calculatePlayerProcessScore(player, benchPlayers, this.getProjectedPoints(player))
      );

      const weekPoints = analyzedLineup.reduce((sum, player) => sum + player.espnPoints, 0);
      const weekProjected = analyzedLineup.reduce((sum, player) => sum + player.projected, 0);
      const weekProcessScore = analyzedLineup.reduce((sum, player) => sum + player.processScore, 0) / analyzedLineup.length;

      totalPoints += weekPoints;
      totalProcessScore += weekProcessScore;

      // Count performance tiers based on Process Score
      if (weekProcessScore >= 8.0) eliteGames++;
      else if (weekProcessScore >= 6.5) strongGames++;
      else if (weekProcessScore >= 5.0) averageGames++;
      else poorGames++;

      // Find top performer and any major misses
      const topPerformer = analyzedLineup.reduce((best, current) => 
        current.espnPoints > best.espnPoints ? current : best, analyzedLineup[0] || { name: 'None', espnPoints: 0 });
      
      const bigMiss = analyzedLineup.find(p => p.benchImpact.includes('⚠️') && 
        parseFloat(p.benchImpact.match(/\+(\d+\.?\d*)/)?.[1] || '0') > 5);

      weeklyAnalytics.push({
        week: weekNum,
        points: Math.round(weekPoints * 10) / 10,
        topPlayer: topPerformer?.name || 'Unknown',
        topPoints: Math.round((topPerformer?.espnPoints || 0) * 10) / 10,
        processScore: Math.round(weekProcessScore * 10) / 10,
        bigMiss: bigMiss?.benchAlternative || null
      });
    }

    const avgPoints = weeks.length > 0 ? totalPoints / weeks.length : 0;
    const avgProcessScore = weeks.length > 0 ? totalProcessScore / weeks.length : 0;

    // Calculate season highlights and improvement areas (simplified)
    const allPlayerPerformances = [];
    const positionMisses = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, 'D/ST': 0, FLEX: 0 };

    for (const week of weeks) {
      const weekData = weeklyData[week];
      const teamRoster = weekData.teamRosters?.[teamId];
      if (!teamRoster) continue;

      const lineupPlayers = teamRoster.lineup || [];
      const benchPlayers = teamRoster.bench || [];
      const analyzedLineup = lineupPlayers.map((player: any) => 
        this.calculatePlayerProcessScore(player, benchPlayers, this.getProjectedPoints(player))
      );

      // Track individual performances
      analyzedLineup.forEach(player => {
        if (player.espnPoints >= 20) {
          allPlayerPerformances.push({
            week: parseInt(week),
            player: player.name,
            points: player.espnPoints,
            type: player.espnPoints >= 25 ? 'elite' : 'good'
          });
        }

        // Track position-specific misses
        if (player.benchImpact.includes('⚠️')) {
          const missedPoints = parseFloat(player.benchImpact.match(/\+(\d+\.?\d*)/)?.[1] || '0');
          positionMisses[player.position as keyof typeof positionMisses] += missedPoints;
        }
      });
    }

    // Get top 5 highlights
    const seasonHighlights = allPlayerPerformances
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    // Calculate improvement areas
    const improvementAreas = Object.entries(positionMisses)
      .filter(([_, points]) => points > 5)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([position, points]) => ({
        area: `${position} ${position === 'RB' ? 'Rotation Timing' : position === 'WR' ? 'Matchup Analysis' : position === 'QB' ? 'Streaming Decisions' : 'Start/Sit Decisions'}`,
        impact: `+${points.toFixed(1)} pts`,
        priority: points > 15 ? 'high' : points > 8 ? 'medium' : 'low',
        description: position === 'RB' ? 'Better start/sit decisions for running backs' :
                    position === 'WR' ? 'Exploit favorable receiver matchups' :
                    position === 'QB' ? 'Optimize quarterback streaming' :
                    position === 'TE' ? 'Improve tight end selection' :
                    position === 'K' ? 'Target dome games and good matchups' :
                    position === 'D/ST' ? 'Stream defenses more effectively' :
                    'General lineup optimization'
      }));

    return {
      seasonSummary: {
        avgPoints: Math.round(avgPoints * 10) / 10,
        avgProcessScore: Math.round(avgProcessScore * 10) / 10,
        totalWeeks: weeks.length,
        eliteGames,
        strongGames,
        averageGames,
        poorGames,
        benchPoints: 0 // Calculate if needed
      },
      weeklyPerformance: weeklyAnalytics,
      seasonHighlights,
      improvementAreas
    };
  }

  clearSession() {
    this.sessionToken = null;
    localStorage.removeItem('fantasy-session-token');
  }
}

export const apiService = new ESPNApiService();