// Enhanced Analysis with REAL 2024 data from the correct weeks
const axios = require('axios');
const fs = require('fs');

// Read environment variables
const envContent = fs.readFileSync('.env', 'utf8');
const envLines = envContent.split('\n').filter(line => line.includes('='));
const env = {};
envLines.forEach(line => {
  const [key, value] = line.split('=');
  env[key.trim()] = value.trim();
});

// Enhanced Analysis Algorithm
class RealDataEnhancedAnalysis {
  
  static calculateBasicInjuryRisk(player) {
    if (player.points === 0) return 0.8; // High risk if didn't play
    if (player.points < 5) return 0.4;   // Moderate risk if very low
    if (player.points < 10) return 0.2;  // Low risk
    return 0.1; // Very low risk for good performance
  }
  
  static calculateBasicMatchupQuality(player, week) {
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
  
  static getPositionThresholds(position) {
    // Position-specific performance thresholds based on historical scoring patterns
    const positionThresholds = {
      'QB': { elite: 25, strong: 20, good: 15, average: 10 },
      'RB': { elite: 20, strong: 15, good: 10, average: 6 },
      'WR': { elite: 20, strong: 15, good: 10, average: 6 },
      'TE': { elite: 15, strong: 12, good: 8, average: 5 },
      'K': { elite: 12, strong: 9, good: 6, average: 3 },
      'D/ST': { elite: 15, strong: 10, good: 6, average: 2 },
      'FLEX': { elite: 20, strong: 15, good: 10, average: 6 } // Use RB/WR thresholds
    };
    
    return positionThresholds[position] || positionThresholds['RB']; // Default to RB thresholds
  }
  
  static scoreDecision(context) {
    // Position-specific performance thresholds
    const thresholds = this.getPositionThresholds(context.position);
    
    let processScore;
    if (context.actualPoints >= thresholds.elite) {
      processScore = 8.0; // Elite performances start high
    } else if (context.actualPoints >= thresholds.strong) {
      processScore = 7.0; // Strong performances
    } else if (context.actualPoints >= thresholds.good) {
      processScore = 6.0; // Good performances  
    } else if (context.actualPoints >= thresholds.average) {
      processScore = 5.0; // Average performances
    } else if (context.actualPoints > 0) {
      processScore = 3.0; // Poor but non-zero performances
    } else {
      processScore = 1.0; // Zero point performances start very low
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
    
    // Ensure score stays within 0-10 range
    processScore = Math.max(0, Math.min(10, processScore));
    
    // Outcome score based on actual performance (unchanged)
    let outcomeScore;
    if (context.actualPoints > 20) outcomeScore = 9.0;
    else if (context.actualPoints > 15) outcomeScore = 8.0;
    else if (context.actualPoints > 10) outcomeScore = 7.0;
    else if (context.actualPoints > 5) outcomeScore = 6.0;
    else if (context.actualPoints > 0) outcomeScore = 4.0;
    else outcomeScore = 1.0;
    
    const decisionQuality = (processScore * 0.7) + (outcomeScore * 0.3);
    
    return {
      processScore: Math.round(processScore * 10) / 10,
      outcomeScore: Math.round(outcomeScore * 10) / 10,
      decisionQuality: Math.round(decisionQuality * 10) / 10
    };
  }
  
  static generateFeedback(decision) {
    const { processScore, pointsDifference, actualPoints } = decision;
    
    if (actualPoints > 20) {
      return "🔥 ELITE performance! Great player selection.";
    } else if (processScore >= 8.5) {
      if (pointsDifference <= 0) {
        return "🎯 Excellent decision! Great process and outcome.";
      } else {
        return "🧠 Great process, but missed some points. Keep this approach.";
      }
    } else if (processScore >= 6.0) {
      if (actualPoints > 10) {
        return "✅ Solid decision that delivered good points.";
      } else {
        return "📈 Decent decision, could optimize further.";
      }
    } else {
      if (actualPoints === 0) {
        return "🚨 Poor choice - player didn't score. Check injury reports.";
      } else {
        return "📉 Suboptimal decision. Review alternatives.";
      }
    }
  }
  
  static analyzeWeek(lineup, bench, week) {
    const decisions = [];
    
    lineup.forEach(startedPlayer => {
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
        actualPoints: startedPlayer.points,
        alternativePoints: bestAlternative.points,
        injuryRisk,
        matchupQuality,
        gameScript
      };
      
      const scores = this.scoreDecision(context);
      
      const decision = {
        position: startedPlayer.position,
        startedPlayer: startedPlayer.name,
        actualPoints: startedPlayer.points,
        optimalPlayer: bestAlternative.name,
        optimalPoints: bestAlternative.points,
        pointsDifference: bestAlternative.points - startedPlayer.points,
        injuryRisk,
        matchupQuality,
        gameScript,
        ...scores
      };
      
      decision.feedback = this.generateFeedback(decision);
      decisions.push(decision);
    });
    
    const avgProcessScore = decisions.reduce((sum, d) => sum + d.processScore, 0) / decisions.length;
    const avgOutcomeScore = decisions.reduce((sum, d) => sum + d.outcomeScore, 0) / decisions.length;
    
    return {
      week,
      processScore: Math.round(avgProcessScore * 10) / 10,
      outcomeScore: Math.round(avgOutcomeScore * 10) / 10,
      decisions,
      totalPoints: lineup.reduce((sum, p) => sum + p.points, 0),
      summary: {
        excellentDecisions: decisions.filter(d => d.processScore >= 8.5).length,
        goodDecisions: decisions.filter(d => d.processScore >= 6.5 && d.processScore < 8.5).length,
        poorDecisions: decisions.filter(d => d.processScore < 6.5).length,
        totalPointsLost: decisions.filter(d => d.pointsDifference > 0)
          .reduce((sum, d) => sum + d.pointsDifference, 0),
        elitePerformances: decisions.filter(d => d.actualPoints > 20).length
      }
    };
  }
}

async function runRealDataAnalysis() {
  try {
    console.log('🔥 REAL 2024 FANTASY DATA ANALYSIS');
    console.log('='.repeat(60));
    
    // Auth
    const authResponse = await axios.post('http://localhost:8000/secure-authenticate', {
      espn_s2: env.ESPN_S2,
      swid: env.SWID,
      league_id: env.LEAGUE_ID
    });
    
    const sessionToken = authResponse.data.session_token;
    console.log('✅ Authenticated with ESPN');
    
    // Test multiple weeks to find where we have real data
    const weeksToTest = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    const teamId = 10; // Your team ID
    
    console.log('\n📊 Finding weeks with real scoring data...');
    
    const weeklyAnalyses = [];
    
    for (const week of weeksToTest) {
      try {
        const response = await axios.post(
          'http://localhost:8000/secure-team-analysis',
          { 
            league_id: env.LEAGUE_ID, 
            team_id: teamId.toString(),
            year: 2024,
            start_week: week,
            end_week: week
          },
          { headers: { Authorization: `Bearer ${sessionToken}` } }
        );
        
        const weekData = response.data.weekly_data[week.toString()];
        if (weekData && weekData.teamRosters[teamId]) {
          const roster = weekData.teamRosters[teamId];
          const totalPoints = roster.lineup.reduce((sum, p) => sum + p.points, 0);
          
          if (totalPoints > 0) {
            console.log(`✅ Week ${week}: ${totalPoints.toFixed(1)} total points`);
            
            // Run enhanced analysis
            const analysis = RealDataEnhancedAnalysis.analyzeWeek(
              roster.lineup, 
              roster.bench || [], 
              week
            );
            
            weeklyAnalyses.push(analysis);
            
            // Show week details
            console.log(`\n${'='.repeat(40)}`);
            console.log(`📈 WEEK ${week} ENHANCED ANALYSIS`);
            console.log(`${'='.repeat(40)}`);
            console.log(`Team: ${roster.team_name}`);
            console.log(`Total Points: ${totalPoints.toFixed(1)}`);
            console.log(`Process Score: ${analysis.processScore}/10`);
            console.log(`Outcome Score: ${analysis.outcomeScore}/10`);
            
            console.log(`\n🏆 TOP PERFORMERS:`);
            const topPerformers = roster.lineup
              .sort((a, b) => b.points - a.points)
              .slice(0, 3);
            
            topPerformers.forEach((player, i) => {
              const rank = ['🥇', '🥈', '🥉'][i];
              console.log(`${rank} ${player.name} (${player.position}): ${player.points} pts`);
            });
            
            console.log(`\n🔍 DECISION ANALYSIS:`);
            analysis.decisions.forEach(decision => {
              console.log(`\n${decision.position}: ${decision.startedPlayer} (${decision.actualPoints} pts)`);
              console.log(`  ${decision.feedback}`);
              
              if (decision.pointsDifference > 0) {
                console.log(`  ⚠️  Could have started: ${decision.optimalPlayer} (+${decision.pointsDifference.toFixed(1)} pts)`);
              }
            });
            
            console.log(`\n📊 WEEK SUMMARY:`);
            console.log(`🌟 Elite Performances: ${analysis.summary.elitePerformances}`);
            console.log(`✅ Good Decisions: ${analysis.summary.goodDecisions}`);
            console.log(`❌ Poor Decisions: ${analysis.summary.poorDecisions}`);
            console.log(`💸 Points Lost: ${analysis.summary.totalPointsLost.toFixed(1)}`);
            
            // Stop after analyzing 3 weeks to keep output manageable
            if (weeklyAnalyses.length >= 3) break;
            
          } else {
            console.log(`❌ Week ${week}: No scoring data`);
          }
        }
      } catch (error) {
        console.log(`❌ Week ${week}: Error fetching data`);
      }
    }
    
    // Season summary
    if (weeklyAnalyses.length > 0) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🏆 REAL DATA SEASON SUMMARY`);
      console.log(`${'='.repeat(60)}`);
      
      const avgProcessScore = weeklyAnalyses.reduce((sum, w) => sum + w.processScore, 0) / weeklyAnalyses.length;
      const avgOutcomeScore = weeklyAnalyses.reduce((sum, w) => sum + w.outcomeScore, 0) / weeklyAnalyses.length;
      const totalPoints = weeklyAnalyses.reduce((sum, w) => sum + w.totalPoints, 0);
      const avgPointsPerWeek = totalPoints / weeklyAnalyses.length;
      
      console.log(`\n🎯 PERFORMANCE METRICS:`);
      console.log(`Average Process Score: ${avgProcessScore.toFixed(1)}/10`);
      console.log(`Average Outcome Score: ${avgOutcomeScore.toFixed(1)}/10`);
      console.log(`Average Points/Week: ${avgPointsPerWeek.toFixed(1)}`);
      console.log(`Total Points (${weeklyAnalyses.length} weeks): ${totalPoints.toFixed(1)}`);
      
      const totalElite = weeklyAnalyses.reduce((sum, w) => sum + w.summary.elitePerformances, 0);
      const totalGood = weeklyAnalyses.reduce((sum, w) => sum + w.summary.goodDecisions, 0);
      const totalPoor = weeklyAnalyses.reduce((sum, w) => sum + w.summary.poorDecisions, 0);
      const totalLost = weeklyAnalyses.reduce((sum, w) => sum + w.summary.totalPointsLost, 0);
      
      console.log(`\n📈 DECISION TOTALS:`);
      console.log(`🔥 Elite Performances: ${totalElite}`);
      console.log(`✅ Good Decisions: ${totalGood}`);
      console.log(`❌ Poor Decisions: ${totalPoor}`);
      console.log(`💸 Total Points Lost: ${totalLost.toFixed(1)}`);
      
      // Overall rating
      let rating = '';
      if (avgProcessScore >= 8.5) rating = '🏆 ELITE Fantasy Manager';
      else if (avgProcessScore >= 7.5) rating = '🥈 Strong Decision Maker';
      else if (avgProcessScore >= 6.5) rating = '🥉 Solid Manager';
      else if (avgProcessScore >= 5.5) rating = '📈 Developing Skills';
      else rating = '📚 Needs Improvement';
      
      console.log(`\n🏅 FINAL RATING: ${rating}`);
      
      if (avgPointsPerWeek > 120) {
        console.log(`🔥 DOMINANT SCORING! You're putting up elite numbers.`);
      } else if (avgPointsPerWeek > 100) {
        console.log(`💪 Strong scoring performance. Keep it up!`);
      } else {
        console.log(`📈 Room for improvement in scoring consistency.`);
      }
      
    } else {
      console.log('\n❌ No real scoring data found in any weeks');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

runRealDataAnalysis();