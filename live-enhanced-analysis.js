// Live Enhanced Analysis - Detailed Terminal Version
// This runs the full enhanced analysis algorithm on your real ESPN data

const axios = require('axios');
const fs = require('fs');

// Read environment variables
const envContent = fs.readFileSync('/Users/home/Desktop/ff-analyzer/.env', 'utf8');
const envLines = envContent.split('\n').filter(line => line.includes('='));
const env = {};

envLines.forEach(line => {
  const [key, value] = line.split('=');
  env[key.trim()] = value.trim();
});

const credentials = {
  espn_s2: env.ESPN_S2,
  swid: env.SWID,
  league_id: env.LEAGUE_ID
};

// Enhanced Analysis Algorithm (from our service)
class TerminalEnhancedAnalysis {
  
  static calculateBasicInjuryRisk(player) {
    // Simple heuristic: players with 0 points have higher injury risk
    if (player.points === 0) return 0.8; // 80% risk if didn't play
    if (player.points < 5) return 0.4;   // 40% risk if very low score
    return 0.1; // 10% base risk
  }
  
  static calculateBasicMatchupQuality(player, week) {
    // Position-based matchup simulation
    const positionVariance = {
      'QB': 0.8, 'RB': 0.6, 'WR': 0.5, 'TE': 0.7, 'K': 0.4, 'D/ST': 0.3
    };
    
    const baseQuality = positionVariance[player.position] || 0.5;
    const weekVariance = (Math.sin(week * player.player_id * 0.001) + 1) * 0.3;
    return Math.max(0.1, Math.min(1.0, baseQuality + weekVariance));
  }
  
  static predictBasicGameScript(player, week) {
    const rand = Math.sin(week * player.player_id * 0.002);
    if (rand > 0.3) return 'favorable';
    if (rand < -0.3) return 'unfavorable';
    return 'neutral';
  }
  
  static calculateDecisionDifficulty(startedPoints, benchPoints, injuryRisk) {
    const projectedDiff = Math.abs(startedPoints - benchPoints);
    const contextAdjustment = injuryRisk * 5;
    const adjustedDiff = Math.max(0, projectedDiff - contextAdjustment);
    
    if (adjustedDiff > 8) return 'easy';
    if (adjustedDiff > 3) return 'moderate';
    return 'difficult';
  }
  
  static getPositionThresholds(position) {
    const positionThresholds = {
      'QB': { elite: 25, strong: 20, good: 15, average: 10 },
      'RB': { elite: 20, strong: 15, good: 10, average: 6 },
      'WR': { elite: 20, strong: 15, good: 10, average: 6 },
      'TE': { elite: 15, strong: 12, good: 8, average: 5 },
      'K': { elite: 12, strong: 9, good: 6, average: 3 },
      'D/ST': { elite: 15, strong: 10, good: 6, average: 2 },
      'FLEX': { elite: 20, strong: 15, good: 10, average: 6 }
    };
    
    return positionThresholds[position] || positionThresholds['RB'];
  }
  
  static scoreDecision(context) {
    const thresholds = this.getPositionThresholds(context.position);
    
    let processScore;
    if (context.actualPoints >= thresholds.elite) {
      processScore = 8.0;
    } else if (context.actualPoints >= thresholds.strong) {
      processScore = 7.0;
    } else if (context.actualPoints >= thresholds.good) {
      processScore = 6.0;
    } else if (context.actualPoints >= thresholds.average) {
      processScore = 5.0;
    } else if (context.actualPoints > 0) {
      processScore = 3.0;
    } else {
      processScore = 1.0;
    }
    
    // Reward choosing higher scorer vs alternatives
    if (context.actualPoints >= context.alternativePoints) {
      processScore += 1.5; // Good choice bonus
    } else {
      // Penalty scaled by how much better the alternative was
      const missedOpportunity = context.alternativePoints - context.actualPoints;
      if (missedOpportunity > 15) {
        processScore -= 2.5; // Major missed opportunity
      } else if (missedOpportunity > 10) {
        processScore -= 2.0; // Significant missed opportunity
      } else if (missedOpportunity > 5) {
        processScore -= 1.5; // Moderate missed opportunity
      } else {
        processScore -= 1.0; // Minor missed opportunity
      }
    }
    
    // Injury risk consideration
    if (context.injuryRisk > 0.7) {
      if (context.actualPoints > 0) {
        processScore += 1.0; // Avoided injury successfully
      } else {
        processScore -= 2.5; // Started injured player (major penalty)
      }
    }
    
    // Matchup quality bonus/penalty
    if (context.matchupQuality > 0.8) {
      processScore += 0.5; // Excellent matchup exploitation
    } else if (context.matchupQuality < 0.3) {
      processScore -= 0.5; // Poor matchup choice
    }
    
    // Game script consideration
    if (context.gameScript === 'favorable' && context.actualPoints > 15) {
      processScore += 0.5; // Capitalized on favorable game script
    } else if (context.gameScript === 'unfavorable' && context.actualPoints > 10) {
      processScore += 1.0; // Overcame unfavorable game script
    }
    
    // Difficulty bonus
    if (context.decisionDifficulty === 'difficult' && context.actualPoints >= context.alternativePoints) {
      processScore += 1.0;
    }
    
    // Ensure score stays within 0-10 range
    processScore = Math.max(0, Math.min(10, processScore));
    
    // Outcome score
    const expectedVsActual = context.actualPoints / Math.max(context.expectedPoints, 1);
    let outcomeScore = expectedVsActual * 5;
    outcomeScore = Math.max(0, Math.min(10, outcomeScore));
    
    const decisionQuality = (processScore * 0.7) + (outcomeScore * 0.3);
    
    return {
      processScore: Math.round(processScore * 10) / 10,
      outcomeScore: Math.round(outcomeScore * 10) / 10,
      decisionQuality: Math.round(decisionQuality * 10) / 10
    };
  }
  
  static generateFeedback(decision) {
    const { processScore, pointsDifference } = decision;
    
    if (processScore >= 8.5) {
      if (pointsDifference <= 0) {
        return "🎯 Excellent decision! Great process and outcome.";
      } else {
        return "🧠 Great process, unlucky outcome. Keep making decisions like this.";
      }
    } else if (processScore >= 7.0) {
      if (pointsDifference <= 0) {
        return "✅ Good decision that worked out well.";
      } else {
        return "📈 Decent process, could improve context awareness.";
      }
    } else if (processScore >= 5.5) {
      return "⚖️ Average decision. Consider injury risk and matchups more carefully.";
    } else {
      if (decision.injuryRisk > 0.7) {
        return "🚨 Poor risk management. Avoid starting players with high injury risk.";
      } else {
        return "📉 Suboptimal decision. Review matchup quality and projections.";
      }
    }
  }
  
  static analyzeWeek(lineup, bench, week) {
    const decisions = [];
    let totalProcessScore = 0;
    let totalOutcomeScore = 0;
    let totalRiskManagement = 0;
    let totalContextMastery = 0;
    
    lineup.forEach(startedPlayer => {
      // Find best bench alternative for same position
      const alternatives = bench.filter(p => p.position === startedPlayer.position);
      if (alternatives.length === 0) return;
      
      const bestAlternative = alternatives.reduce((best, current) => 
        current.points > best.points ? current : best
      );
      
      const injuryRisk = this.calculateBasicInjuryRisk(startedPlayer);
      const matchupQuality = this.calculateBasicMatchupQuality(startedPlayer, week);
      const gameScript = this.predictBasicGameScript(startedPlayer, week);
      
      const context = {
        position: startedPlayer.position,
        expectedPoints: startedPlayer.points * (0.8 + Math.random() * 0.4), // Mock projection
        actualPoints: startedPlayer.points,
        alternativePoints: bestAlternative.points,
        injuryRisk,
        matchupQuality,
        gameScript,
        decisionDifficulty: this.calculateDecisionDifficulty(
          startedPlayer.points, 
          bestAlternative.points, 
          injuryRisk
        )
      };
      
      const scores = this.scoreDecision(context);
      
      const decision = {
        position: startedPlayer.position,
        startedPlayer: startedPlayer.name,
        startedPoints: startedPlayer.points,
        optimalPlayer: bestAlternative.name,
        optimalPoints: bestAlternative.points,
        pointsDifference: bestAlternative.points - startedPlayer.points,
        injuryRisk,
        matchupQuality,
        gameScript,
        ...scores,
        feedback: ''
      };
      
      decision.feedback = this.generateFeedback(decision);
      decisions.push(decision);
      
      totalProcessScore += scores.processScore;
      totalOutcomeScore += scores.outcomeScore;
      
      // Risk management score
      if (injuryRisk > 0.7 && startedPlayer.points > 0) {
        totalRiskManagement += 9;
      } else if (injuryRisk > 0.7 && startedPlayer.points === 0) {
        totalRiskManagement += 2;
      } else {
        totalRiskManagement += 7;
      }
      
      // Context mastery score
      let contextScore = 5;
      if (matchupQuality > 0.7 && startedPlayer.points > context.expectedPoints) contextScore += 2;
      if (gameScript === 'favorable' && startedPlayer.points > context.expectedPoints) contextScore += 1;
      totalContextMastery += contextScore;
    });
    
    const numDecisions = decisions.length;
    
    return {
      week,
      processScore: numDecisions > 0 ? Math.round((totalProcessScore / numDecisions) * 10) / 10 : 0,
      outcomeScore: numDecisions > 0 ? Math.round((totalOutcomeScore / numDecisions) * 10) / 10 : 0,
      riskManagement: numDecisions > 0 ? Math.round((totalRiskManagement / numDecisions) * 10) / 10 : 0,
      contextMastery: numDecisions > 0 ? Math.round((totalContextMastery / numDecisions) * 10) / 10 : 0,
      decisions,
      summary: {
        excellentDecisions: decisions.filter(d => d.processScore >= 8.5).length,
        goodDecisions: decisions.filter(d => d.processScore >= 6.5 && d.processScore < 8.5).length,
        poorDecisions: decisions.filter(d => d.processScore < 6.5).length,
        totalPointsLost: decisions.filter(d => d.pointsDifference > 0)
          .reduce((sum, d) => sum + d.pointsDifference, 0)
      }
    };
  }
}

async function runLiveEnhancedAnalysis() {
  try {
    console.log('🚀 Live Enhanced Analysis - Your Fantasy Team Deep Dive');
    console.log('='.repeat(60));
    
    // Authenticate
    console.log('\n🔐 Authenticating with ESPN...');
    const authResponse = await axios.post('http://localhost:8000/secure-authenticate', credentials);
    const sessionToken = authResponse.data.session_token;
    const userTeam = authResponse.data.league_info.your_teams[0];
    
    console.log(`✅ Authenticated! Team: ${userTeam.team_name} (ID: ${userTeam.team_id})`);
    
    // Get season data
    console.log('\n📊 Fetching season roster data...');
    const seasonResponse = await axios.post(
      'http://localhost:8000/secure-team-analysis',
      { 
        league_id: credentials.league_id, 
        team_id: userTeam.team_id.toString(),
        year: 2024,
        start_week: 1,
        end_week: 10  // Get more weeks
      },
      { headers: { Authorization: `Bearer ${sessionToken}` } }
    );
    
    const weeklyData = seasonResponse.data.weekly_data;
    const availableWeeks = Object.keys(weeklyData).map(w => parseInt(w)).sort((a, b) => a - b);
    
    console.log(`✅ Data retrieved for weeks: ${availableWeeks.join(', ')}`);
    
    // Analyze each week
    const weeklyAnalyses = [];
    
    for (const week of availableWeeks.slice(0, 5)) { // Analyze first 5 weeks
      const teamRoster = weeklyData[week].teamRosters[userTeam.team_id];
      if (!teamRoster || !teamRoster.lineup || !teamRoster.bench) continue;
      
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📈 WEEK ${week} ENHANCED ANALYSIS`);
      console.log(`${'='.repeat(50)}`);
      
      const analysis = TerminalEnhancedAnalysis.analyzeWeek(
        teamRoster.lineup, 
        teamRoster.bench, 
        week
      );
      
      weeklyAnalyses.push(analysis);
      
      // Display week summary
      console.log(`\n🎯 WEEK ${week} SUMMARY:`);
      console.log(`Decision Quality: ${analysis.processScore}/10`);
      console.log(`Outcome Score: ${analysis.outcomeScore}/10`);
      console.log(`Risk Management: ${analysis.riskManagement}/10`);
      console.log(`Context Mastery: ${analysis.contextMastery}/10`);
      
      console.log(`\n📊 DECISION BREAKDOWN:`);
      console.log(`✅ Excellent: ${analysis.summary.excellentDecisions}`);
      console.log(`👍 Good: ${analysis.summary.goodDecisions}`);
      console.log(`👎 Poor: ${analysis.summary.poorDecisions}`);
      console.log(`💸 Points Lost: ${analysis.summary.totalPointsLost.toFixed(1)}`);
      
      // Show individual decisions
      console.log(`\n🔍 POSITION-BY-POSITION ANALYSIS:`);
      analysis.decisions.forEach(decision => {
        console.log(`\n${decision.position}: ${decision.startedPlayer} (${decision.startedPoints.toFixed(1)} pts)`);
        console.log(`  Process Score: ${decision.processScore}/10`);
        console.log(`  ${decision.feedback}`);
        
        if (decision.pointsDifference > 0) {
          console.log(`  ⚠️  Alternative: ${decision.optimalPlayer} (+${decision.pointsDifference.toFixed(1)} pts)`);
        }
        
        // Show context factors
        console.log(`  📊 Context: Injury Risk ${(decision.injuryRisk * 100).toFixed(0)}%, ` +
                   `Matchup ${(decision.matchupQuality * 100).toFixed(0)}%, ` +
                   `Game Script: ${decision.gameScript}`);
      });
    }
    
    // Season summary
    if (weeklyAnalyses.length > 0) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🏆 SEASON SUMMARY (${weeklyAnalyses.length} weeks analyzed)`);
      console.log(`${'='.repeat(60)}`);
      
      const avgProcessScore = weeklyAnalyses.reduce((sum, w) => sum + w.processScore, 0) / weeklyAnalyses.length;
      const avgOutcomeScore = weeklyAnalyses.reduce((sum, w) => sum + w.outcomeScore, 0) / weeklyAnalyses.length;
      const avgRiskManagement = weeklyAnalyses.reduce((sum, w) => sum + w.riskManagement, 0) / weeklyAnalyses.length;
      const avgContextMastery = weeklyAnalyses.reduce((sum, w) => sum + w.contextMastery, 0) / weeklyAnalyses.length;
      
      const totalExcellent = weeklyAnalyses.reduce((sum, w) => sum + w.summary.excellentDecisions, 0);
      const totalGood = weeklyAnalyses.reduce((sum, w) => sum + w.summary.goodDecisions, 0);
      const totalPoor = weeklyAnalyses.reduce((sum, w) => sum + w.summary.poorDecisions, 0);
      const totalPointsLost = weeklyAnalyses.reduce((sum, w) => sum + w.summary.totalPointsLost, 0);
      
      console.log(`\n🎯 OVERALL PERFORMANCE:`);
      console.log(`Average Process Score: ${avgProcessScore.toFixed(1)}/10`);
      console.log(`Average Outcome Score: ${avgOutcomeScore.toFixed(1)}/10`);
      console.log(`Average Risk Management: ${avgRiskManagement.toFixed(1)}/10`);
      console.log(`Average Context Mastery: ${avgContextMastery.toFixed(1)}/10`);
      
      console.log(`\n📈 SEASON TOTALS:`);
      console.log(`🌟 Excellent Decisions: ${totalExcellent}`);
      console.log(`✅ Good Decisions: ${totalGood}`);
      console.log(`❌ Poor Decisions: ${totalPoor}`);
      console.log(`💸 Total Points Lost: ${totalPointsLost.toFixed(1)}`);
      
      // Performance rating
      let rating = '';
      if (avgProcessScore >= 8.5) rating = '🏆 Elite Fantasy Manager';
      else if (avgProcessScore >= 7.5) rating = '🥈 Strong Decision Maker';
      else if (avgProcessScore >= 6.5) rating = '🥉 Solid Manager';
      else if (avgProcessScore >= 5.5) rating = '📈 Developing Skills';
      else rating = '📚 Needs Improvement';
      
      console.log(`\n🏅 OVERALL RATING: ${rating}`);
      
      // Trend analysis
      if (weeklyAnalyses.length >= 3) {
        const firstHalf = weeklyAnalyses.slice(0, Math.floor(weeklyAnalyses.length / 2));
        const secondHalf = weeklyAnalyses.slice(Math.floor(weeklyAnalyses.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, w) => sum + w.processScore, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, w) => sum + w.processScore, 0) / secondHalf.length;
        
        console.log(`\n📊 TREND ANALYSIS:`);
        if (secondHalfAvg > firstHalfAvg + 0.5) {
          console.log(`📈 IMPROVING! Your decision-making has gotten better over time`);
          console.log(`   Early weeks: ${firstHalfAvg.toFixed(1)}/10 → Recent weeks: ${secondHalfAvg.toFixed(1)}/10`);
        } else if (secondHalfAvg < firstHalfAvg - 0.5) {
          console.log(`📉 Declining. Your recent decisions need attention`);
          console.log(`   Early weeks: ${firstHalfAvg.toFixed(1)}/10 → Recent weeks: ${secondHalfAvg.toFixed(1)}/10`);
        } else {
          console.log(`📊 CONSISTENT. You're maintaining steady decision-making quality`);
          console.log(`   Average: ${avgProcessScore.toFixed(1)}/10`);
        }
      }
      
      // Recommendations
      console.log(`\n💡 RECOMMENDATIONS:`);
      if (avgRiskManagement < 7.0) {
        console.log(`🚨 Focus on injury risk management - avoid starting questionable players`);
      }
      if (avgContextMastery < 7.0) {
        console.log(`🎯 Improve matchup analysis - research defensive rankings before setting lineups`);
      }
      if (totalPointsLost > 50) {
        console.log(`🔄 Consider alternative lineup approaches - you're leaving significant points on bench`);
      }
      if (avgProcessScore >= 8.0) {
        console.log(`🌟 Keep up the excellent work! Your process is strong.`);
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✨ Enhanced Analysis Complete! ✨`);
    console.log(`${'='.repeat(60)}`);
    
  } catch (error) {
    console.error('\n❌ Analysis failed:', error.response?.data || error.message);
  }
}

runLiveEnhancedAnalysis();