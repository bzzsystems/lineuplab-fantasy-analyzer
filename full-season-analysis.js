// Full Season Analysis - Weeks 1-13 of 2024
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
class FullSeasonAnalysis {
  
  static calculateBasicInjuryRisk(player) {
    if (player.points === 0) return 0.8;
    if (player.points < 5) return 0.4;
    if (player.points < 10) return 0.2;
    return 0.1;
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
    
    // Ensure score stays within 0-10 range
    processScore = Math.max(0, Math.min(10, processScore));
    
    // Outcome score
    let outcomeScore = 5.0;
    if (context.actualPoints > 20) outcomeScore = 9.0;
    else if (context.actualPoints > 15) outcomeScore = 8.0;
    else if (context.actualPoints > 10) outcomeScore = 7.0;
    else if (context.actualPoints > 5) outcomeScore = 6.0;
    else if (context.actualPoints > 0) outcomeScore = 4.0;
    else outcomeScore = 2.0;
    
    const decisionQuality = (processScore * 0.7) + (outcomeScore * 0.3);
    
    return {
      processScore: Math.round(processScore * 10) / 10,
      outcomeScore: Math.round(outcomeScore * 10) / 10,
      decisionQuality: Math.round(decisionQuality * 10) / 10
    };
  }
  
  static generateFeedback(decision) {
    const { actualPoints, pointsDifference } = decision;
    
    if (actualPoints > 25) {
      return "🔥 MONSTER GAME! Elite performance.";
    } else if (actualPoints > 20) {
      return "🏆 Excellent performance! Great pick.";
    } else if (actualPoints > 15) {
      return "💪 Strong showing. Solid choice.";
    } else if (actualPoints > 10) {
      return "✅ Good performance. Decent points.";
    } else if (actualPoints > 5) {
      return "📈 Modest points. Room for improvement.";
    } else if (actualPoints > 0) {
      return "📉 Low output. Consider alternatives.";
    } else {
      return "🚨 Zero points! Check injury/bye status.";
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
      
      const context = {
        position: startedPlayer.position,
        actualPoints: startedPlayer.points,
        alternativePoints: bestAlternative.points,
        injuryRisk
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
        ...scores
      };
      
      decision.feedback = this.generateFeedback(decision);
      decisions.push(decision);
    });
    
    const avgProcessScore = decisions.length > 0 ? decisions.reduce((sum, d) => sum + d.processScore, 0) / decisions.length : 0;
    const avgOutcomeScore = decisions.length > 0 ? decisions.reduce((sum, d) => sum + d.outcomeScore, 0) / decisions.length : 0;
    
    return {
      week,
      processScore: Math.round(avgProcessScore * 10) / 10,
      outcomeScore: Math.round(avgOutcomeScore * 10) / 10,
      decisions,
      totalPoints: lineup.reduce((sum, p) => sum + p.points, 0),
      summary: {
        elitePerformances: decisions.filter(d => d.actualPoints > 20).length,
        goodPerformances: decisions.filter(d => d.actualPoints > 10 && d.actualPoints <= 20).length,
        poorPerformances: decisions.filter(d => d.actualPoints <= 5).length,
        zeroPoints: decisions.filter(d => d.actualPoints === 0).length,
        totalPointsLost: decisions.filter(d => d.pointsDifference > 0)
          .reduce((sum, d) => sum + d.pointsDifference, 0)
      }
    };
  }
}

async function runFullSeasonAnalysis() {
  try {
    console.log('🏈 2024 FANTASY FOOTBALL SEASON ANALYSIS (Weeks 1-13)');
    console.log('='.repeat(70));
    
    // Auth
    const authResponse = await axios.post('http://localhost:8000/secure-authenticate', {
      espn_s2: env.ESPN_S2,
      swid: env.SWID,
      league_id: env.LEAGUE_ID
    });
    
    const sessionToken = authResponse.data.session_token;
    console.log('✅ Authenticated with ESPN');
    
    const teamId = 10;
    const weeklyAnalyses = [];
    
    console.log('\n📅 Analyzing weeks 1-13...\n');
    
    // Analyze each week
    for (let week = 1; week <= 13; week++) {
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
          
          const analysis = FullSeasonAnalysis.analyzeWeek(
            roster.lineup, 
            roster.bench || [], 
            week
          );
          
          weeklyAnalyses.push(analysis);
          
          // Week summary line
          const topScorer = roster.lineup.sort((a, b) => b.points - a.points)[0];
          console.log(`Week ${week.toString().padStart(2)}: ${totalPoints.toFixed(1).padStart(6)} pts | Top: ${topScorer.name} (${topScorer.points.toFixed(1)}) | Process: ${analysis.processScore}/10`);
          
        } else {
          console.log(`Week ${week.toString().padStart(2)}: No data available`);
        }
        
      } catch (error) {
        console.log(`Week ${week.toString().padStart(2)}: Error - ${error.message}`);
      }
    }
    
    // Detailed analysis
    if (weeklyAnalyses.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('📊 DETAILED WEEKLY BREAKDOWN');
      console.log('='.repeat(70));
      
      weeklyAnalyses.forEach(analysis => {
        console.log(`\n📈 WEEK ${analysis.week}:`);
        console.log(`Total Points: ${analysis.totalPoints.toFixed(1)} | Process Score: ${analysis.processScore}/10`);
        
        // Show top 3 performers
        const topPerformers = analysis.decisions
          .sort((a, b) => b.actualPoints - a.actualPoints)
          .slice(0, 3);
        
        if (topPerformers.length > 0) {
          console.log(`Top Performers:`);
          topPerformers.forEach((player, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            console.log(`  ${medals[i]} ${player.startedPlayer} (${player.position}): ${player.actualPoints.toFixed(1)} pts`);
          });
        }
        
        // Show any big misses
        const bigMisses = analysis.decisions.filter(d => d.pointsDifference > 10);
        if (bigMisses.length > 0) {
          console.log(`❌ Big Misses:`);
          bigMisses.forEach(miss => {
            console.log(`  ${miss.position}: Started ${miss.startedPlayer} (${miss.actualPoints.toFixed(1)}) over ${miss.optimalPlayer} (+${miss.pointsDifference.toFixed(1)})`);
          });
        }
        
        // Show elite performances
        const elitePerfs = analysis.decisions.filter(d => d.actualPoints > 20);
        if (elitePerfs.length > 0) {
          console.log(`🔥 Elite Performances:`);
          elitePerfs.forEach(perf => {
            console.log(`  ${perf.startedPlayer} (${perf.position}): ${perf.actualPoints.toFixed(1)} pts - ${perf.feedback}`);
          });
        }
      });
      
      // Season Summary
      console.log('\n' + '='.repeat(70));
      console.log('🏆 FULL SEASON SUMMARY');
      console.log('='.repeat(70));
      
      const totalPoints = weeklyAnalyses.reduce((sum, w) => sum + w.totalPoints, 0);
      const avgPointsPerWeek = totalPoints / weeklyAnalyses.length;
      const avgProcessScore = weeklyAnalyses.reduce((sum, w) => sum + w.processScore, 0) / weeklyAnalyses.length;
      
      const totalElite = weeklyAnalyses.reduce((sum, w) => sum + w.summary.elitePerformances, 0);
      const totalGood = weeklyAnalyses.reduce((sum, w) => sum + w.summary.goodPerformances, 0);
      const totalPoor = weeklyAnalyses.reduce((sum, w) => sum + w.summary.poorPerformances, 0);
      const totalZeros = weeklyAnalyses.reduce((sum, w) => sum + w.summary.zeroPoints, 0);
      const totalPointsLost = weeklyAnalyses.reduce((sum, w) => sum + w.summary.totalPointsLost, 0);
      
      console.log(`\n📈 SCORING PERFORMANCE:`);
      console.log(`Total Points (${weeklyAnalyses.length} weeks): ${totalPoints.toFixed(1)}`);
      console.log(`Average Points/Week: ${avgPointsPerWeek.toFixed(1)}`);
      console.log(`Best Week: ${Math.max(...weeklyAnalyses.map(w => w.totalPoints)).toFixed(1)} pts`);
      console.log(`Worst Week: ${Math.min(...weeklyAnalyses.map(w => w.totalPoints)).toFixed(1)} pts`);
      
      console.log(`\n🎯 DECISION QUALITY:`);
      console.log(`Average Process Score: ${avgProcessScore.toFixed(1)}/10`);
      
      console.log(`\n🏅 PERFORMANCE BREAKDOWN:`);
      console.log(`🔥 Elite Games (20+ pts): ${totalElite}`);
      console.log(`💪 Good Games (10-20 pts): ${totalGood}`);
      console.log(`📉 Poor Games (≤5 pts): ${totalPoor}`);
      console.log(`🚨 Zero Point Games: ${totalZeros}`);
      console.log(`💸 Total Points Lost: ${totalPointsLost.toFixed(1)}`);
      
      // Find your best and worst decisions
      const allDecisions = weeklyAnalyses.flatMap(w => w.decisions.map(d => ({...d, week: w.week})));
      const bestDecisions = allDecisions
        .filter(d => d.actualPoints > 15)
        .sort((a, b) => b.actualPoints - a.actualPoints)
        .slice(0, 5);
      
      const worstDecisions = allDecisions
        .filter(d => d.pointsDifference > 5)
        .sort((a, b) => b.pointsDifference - a.pointsDifference)
        .slice(0, 5);
      
      if (bestDecisions.length > 0) {
        console.log(`\n🌟 SEASON'S BEST DECISIONS:`);
        bestDecisions.forEach((decision, i) => {
          console.log(`${i+1}. Week ${decision.week}: ${decision.startedPlayer} (${decision.position}) - ${decision.actualPoints.toFixed(1)} pts`);
        });
      }
      
      if (worstDecisions.length > 0) {
        console.log(`\n💸 BIGGEST MISSED OPPORTUNITIES:`);
        worstDecisions.forEach((decision, i) => {
          console.log(`${i+1}. Week ${decision.week}: Started ${decision.startedPlayer} over ${decision.optimalPlayer} (-${decision.pointsDifference.toFixed(1)} pts)`);
        });
      }
      
      // Overall Rating
      console.log(`\n🏅 SEASON RATING:`);
      let seasonRating = '';
      if (avgProcessScore >= 8.0) seasonRating = '🏆 ELITE MANAGER';
      else if (avgProcessScore >= 7.0) seasonRating = '🥈 STRONG MANAGER';
      else if (avgProcessScore >= 6.0) seasonRating = '🥉 SOLID MANAGER';
      else if (avgProcessScore >= 5.0) seasonRating = '📈 DEVELOPING MANAGER';
      else seasonRating = '📚 NEEDS IMPROVEMENT';
      
      console.log(seasonRating);
      
      // Competitive analysis
      if (avgPointsPerWeek > 120) {
        console.log(`🔥 CHAMPIONSHIP CALIBER: Your scoring is elite!`);
      } else if (avgPointsPerWeek > 100) {
        console.log(`💪 PLAYOFF CONTENDER: Strong scoring performance.`);
      } else if (avgPointsPerWeek > 80) {
        console.log(`📈 MIDDLE OF THE PACK: Room for improvement.`);
      } else {
        console.log(`🆘 REBUILD MODE: Significant changes needed.`);
      }
      
      // Key insights
      console.log(`\n💡 KEY INSIGHTS:`);
      if (totalZeros > weeklyAnalyses.length * 2) {
        console.log(`🚨 High zero-point rate suggests roster management issues`);
      }
      if (totalPointsLost > 100) {
        console.log(`💸 ${totalPointsLost.toFixed(1)} points left on bench - focus on start/sit decisions`);
      }
      if (totalElite > 0) {
        console.log(`🌟 You have ${totalElite} elite performances - build on those successes`);
      }
      
    } else {
      console.log('\n❌ No data found for weeks 1-13');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

runFullSeasonAnalysis();