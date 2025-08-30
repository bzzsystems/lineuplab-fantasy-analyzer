import { useState, useEffect } from 'react'
import { apiService, WeeklyAnalysisData } from '@/services/api'
import { dataCache } from '@/utils/dataCache'

interface SeasonData {
  seasonSummary: {
    avgPoints: number;
    avgProcessScore: number;
    totalWeeks: number;
    eliteGames: number;
    strongGames: number;
    averageGames: number;
    poorGames: number;
    benchPoints: number;
  };
  weeklyPerformance: Array<{
    week: number;
    points: number;
    topPlayer: string;
    topPoints: number;
    processScore: number;
    bigMiss: string | null;
  }>;
  seasonHighlights: Array<{
    week: number;
    player: string;
    points: number;
    type: 'elite' | 'good';
  }>;
  improvementAreas: Array<{
    area: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }>;
}

interface TeamData {
  teamId: string | null
  weeklyData: Record<number, WeeklyAnalysisData>
  seasonData: SeasonData | null
  isLoading: boolean
  error: string | null
  loadingProgress?: { loaded: number, total: number, weeks: number[] }
}

export function useTeamData(year: number = 2024) {
  const [teamData, setTeamData] = useState<TeamData>({
    teamId: null,
    weeklyData: {},
    seasonData: null,
    isLoading: false,
    error: null
  })

  const setTeamId = (teamId: string) => {
    setTeamData(prev => ({ ...prev, teamId }))
  }

  const fetchWeekData = async (week: number, force = false) => {
    if (!teamData.teamId) return

    // Check cache first
    if (!force) {
      const cachedData = dataCache.get('weeklyData', teamData.teamId, week)
      if (cachedData) {
        setTeamData(prev => ({
          ...prev,
          weeklyData: {
            ...prev.weeklyData,
            [week]: cachedData
          }
        }))
        return cachedData
      }
    }

    setTeamData(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const weeklyAnalysis = await apiService.getWeeklyAnalysis(teamData.teamId, week, year)
      
      if (weeklyAnalysis) {
        // Cache the result
        dataCache.set('weeklyData', weeklyAnalysis, teamData.teamId, week)
        
        setTeamData(prev => ({
          ...prev,
          weeklyData: {
            ...prev.weeklyData,
            [week]: weeklyAnalysis
          },
          isLoading: false
        }))
        return weeklyAnalysis
      } else {
        setTeamData(prev => ({ 
          ...prev, 
          error: `No data found for week ${week}`, 
          isLoading: false 
        }))
        return null
      }
    } catch (error) {
      console.error('Error fetching week data:', error)
      setTeamData(prev => ({
        ...prev,
        error: 'Failed to fetch week data',
        isLoading: false
      }))
      return null
    }
  }

  const fetchSeasonData = async (force = false) => {
    if (!teamData.teamId) return
    
    // Prevent multiple simultaneous calls
    if (teamData.isLoading && !force) {
      console.log('⚠️ Season data fetch already in progress, skipping')
      return
    }

    // Check cache first
    if (!force) {
      const cachedData = dataCache.get('seasonData', teamData.teamId)
      if (cachedData) {
        setTeamData(prev => ({
          ...prev,
          seasonData: cachedData
        }))
        return cachedData
      }
    }

    setTeamData(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Skip instant loading for now - has a bug
      // console.log('🚀 Fetching instant team info...')
      // const instantInfo = await apiService.getInstantTeamInfo(teamData.teamId, year)
      // if (instantInfo) {
      //   console.log('✨ Got instant info, showing skeleton with basic details')
      // }
      
      console.log('🚀 Fast loading season data for', teamData.teamId, 'year', year)
      
      // Use progressive loading with progress updates
      const result = await apiService.getProgressiveSeasonSummary(
        teamData.teamId, 
        year,
        (progress) => {
          // Update loading message with progress
          console.log(`📊 Loading progress: ${progress.loaded}/${progress.total} weeks (${progress.weeks.join(', ')})`)
          
          // Optional: You could update UI state here to show progress
          setTeamData(prev => ({
            ...prev,
            loadingProgress: progress
          }))
        }
      ).catch((error) => {
        console.error('❌ Progressive loading failed:', error)
        // Return null to trigger fallback
        return null
      })
      
      if (result) {
        // Cache the result
        dataCache.set('seasonData', result, teamData.teamId)
        
        setTeamData(prev => ({
          ...prev,
          seasonData: result,
          isLoading: false,
          loadingProgress: undefined
        }))
        console.log('✅ Fast season data loaded successfully')
        return result
      } else {
        console.log('⚠️ Progressive loading failed, trying fallback to regular season summary')
        
        // Fallback: Try regular getSeasonSummary method
        try {
          const fallbackResult = await apiService.getSeasonSummary(teamData.teamId, year)
          
          if (fallbackResult) {
            // Cache the fallback result
            dataCache.set('seasonData', fallbackResult, teamData.teamId)
            
            setTeamData(prev => ({
              ...prev,
              seasonData: fallbackResult,
              isLoading: false,
              loadingProgress: undefined
            }))
            console.log('✅ Fallback season data loaded successfully')
            return fallbackResult
          }
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError)
        }
        
        setTeamData(prev => ({ 
          ...prev, 
          error: 'Unable to load season data. Please try refreshing or re-authenticating.', 
          isLoading: false,
          loadingProgress: undefined
        }))
        return null
      }
    } catch (error) {
      console.error('❌ Error fetching season data:', error)
      setTeamData(prev => ({
        ...prev,
        error: 'Failed to fetch season data. Please try again.',
        isLoading: false,
        loadingProgress: undefined
      }))
      return null
    }
  }

  // Auto-load team ID from localStorage
  useEffect(() => {
    const selectedTeamId = localStorage.getItem('selected-team-id')
    const sessionToken = localStorage.getItem('fantasy-session-token')
    
    if (selectedTeamId && sessionToken && selectedTeamId !== teamData.teamId) {
      setTeamData(prev => ({ ...prev, teamId: selectedTeamId }))
    }
  }, [teamData.teamId])

  // Check cache immediately when team ID is set (no API calls)
  useEffect(() => {
    if (teamData.teamId && !teamData.seasonData && !teamData.isLoading) {
      const cachedData = dataCache.get('seasonData', teamData.teamId)
      if (cachedData) {
        setTeamData(prev => ({
          ...prev,
          seasonData: cachedData
        }))
      }
    }
  }, [teamData.teamId, teamData.seasonData, teamData.isLoading])

  return {
    ...teamData,
    setTeamId,
    fetchWeekData,
    fetchSeasonData
  }
}