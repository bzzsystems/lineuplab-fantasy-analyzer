# React Frontend Design Document

## Overview

The React Frontend provides a comprehensive, responsive interface for the Fantasy Football Season Analyzer. Built with modern React patterns using functional components and hooks, it integrates seamlessly with the ESPN API backend to deliver real-time fantasy football analysis with league context and competitive insights.

## Architecture

### Component Architecture
```
App
├── AuthProvider (Context)
├── FantasyFootballAnalyzer (Main Container)
    ├── ConnectionTab
    │   ├── ESPNLoginForm
    │   └── ConnectionStatus
    ├── OverviewTab
    │   ├── SeasonSummary
    │   ├── LeagueStandings
    │   └── EfficiencyMetrics
    ├── WeeklyTab
    │   ├── WeekSelector
    │   ├── WeeklyAnalysis
    │   └── LineupDecisionModal
    ├── PositionsTab
    │   ├── PositionBreakdown
    │   └── PositionTrends
    └── InsightsTab
        ├── AIRecommendations
        └── PremiumFeatureTeaser
```

### Technology Stack
- **Framework**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS with mobile-first responsive design
- **State Management**: React Context + useReducer for global state
- **HTTP Client**: Axios for API communication
- **Charts**: Chart.js or Recharts for data visualization
- **Icons**: Heroicons or Lucide React
- **Build Tool**: Vite or Create React App

### State Management Strategy
```javascript
// Global App State
const AppState = {
  auth: {
    isAuthenticated: boolean,
    credentials: { espn_s2, swid, league_id },
    sessionExpiry: timestamp
  },
  league: {
    info: LeagueData,
    teams: TeamData[],
    standings: TeamData[]
  },
  analysis: {
    weeklyData: WeeklyAnalysis[],
    positionData: PositionAnalysis,
    efficiency: EfficiencyMetrics
  },
  ui: {
    activeTab: string,
    selectedWeek: number,
    loading: boolean,
    error: string | null
  }
}
```

## Components and Interfaces

### Core Container Component

#### FantasyFootballAnalyzer.jsx
```javascript
const FantasyFootballAnalyzer = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [activeTab, setActiveTab] = useState('connect');
  
  // Tab configuration
  const tabs = [
    { id: 'connect', label: 'Connect', icon: LinkIcon },
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'weekly', label: 'Weekly', icon: CalendarIcon },
    { id: 'positions', label: 'Positions', icon: UserGroupIcon },
    { id: 'insights', label: 'Insights', icon: LightBulbIcon }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header league={state.league.info} />
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <main className="container mx-auto px-4 py-6">
        {renderActiveTab()}
      </main>
    </div>
  );
};
```

### Authentication Components

#### ESPNLoginForm.jsx
```javascript
const ESPNLoginForm = ({ onAuthenticate, loading, error }) => {
  const [credentials, setCredentials] = useState({
    espn_s2: '',
    swid: '',
    league_id: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAuthenticate(credentials);
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          ESPN_S2 Cookie
        </label>
        <input
          type="password"
          value={credentials.espn_s2}
          onChange={(e) => setCredentials({...credentials, espn_s2: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Long encrypted string from ESPN cookies"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          SWID
        </label>
        <input
          type="text"
          value={credentials.swid}
          onChange={(e) => setCredentials({...credentials, swid: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          League ID
        </label>
        <input
          type="text"
          value={credentials.league_id}
          onChange={(e) => setCredentials({...credentials, league_id: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="6-7 digit number from ESPN URL"
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Connecting...' : 'Connect to ESPN'}
      </button>
    </form>
  );
};
```

### Overview Components

#### SeasonSummary.jsx
```javascript
const SeasonSummary = ({ teamData, efficiency, decisions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Current Record"
        value={`${teamData.wins}-${teamData.losses}`}
        subtitle={`${teamData.pointsFor.toFixed(1)} points scored`}
        icon={TrophyIcon}
        color="blue"
      />
      
      <StatCard
        title="Lineup Efficiency"
        value={`${efficiency.overall.toFixed(1)}%`}
        subtitle={`${efficiency.pointsLeft.toFixed(1)} points left on bench`}
        icon={ChartBarIcon}
        color={efficiency.overall > 85 ? 'green' : efficiency.overall > 75 ? 'yellow' : 'red'}
      />
      
      <StatCard
        title="Decision Quality"
        value={`${decisions.good}/${decisions.total}`}
        subtitle={`${decisions.bad} bad decisions`}
        icon={CheckCircleIcon}
        color={decisions.good / decisions.total > 0.7 ? 'green' : 'yellow'}
      />
    </div>
  );
};
```

#### LeagueStandings.jsx
```javascript
const LeagueStandings = ({ standings, userTeamId }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">League Standings</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Record
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {standings.map((team, index) => (
              <tr 
                key={team.teamId}
                className={team.teamId === userTeamId ? 'bg-blue-50' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {team.teamName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {team.ownerName}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.wins}-{team.losses}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.pointsFor.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

### Weekly Analysis Components

#### WeeklyAnalysis.jsx
```javascript
const WeeklyAnalysis = ({ weeklyData, onWeekSelect }) => {
  return (
    <div className="space-y-4">
      {weeklyData.map((week) => (
        <WeekCard
          key={week.week}
          weekData={week}
          onClick={() => onWeekSelect(week)}
        />
      ))}
    </div>
  );
};

const WeekCard = ({ weekData, onClick }) => {
  const { week, efficiency, decisions, pointsLeft } = weekData;
  
  return (
    <div 
      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Week {week}
        </h3>
        <div className="flex space-x-2">
          <DecisionBadge type="good" count={decisions.good} />
          <DecisionBadge type="okay" count={decisions.okay} />
          <DecisionBadge type="bad" count={decisions.bad} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Efficiency</p>
          <p className="text-xl font-semibold text-gray-900">
            {efficiency.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Points Left</p>
          <p className="text-xl font-semibold text-gray-900">
            {pointsLeft.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};
```

#### LineupDecisionModal.jsx
```javascript
const LineupDecisionModal = ({ isOpen, onClose, weekData }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Week {weekData.week} Lineup Analysis
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Starting Lineup
              </h3>
              <PlayerList players={weekData.lineup} showDecisions />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Bench
              </h3>
              <PlayerList players={weekData.bench} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Position Analysis Components

#### PositionBreakdown.jsx
```javascript
const PositionBreakdown = ({ positionData }) => {
  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'D/ST'];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {positions.map((position) => (
        <PositionCard
          key={position}
          position={position}
          data={positionData[position]}
        />
      ))}
    </div>
  );
};

const PositionCard = ({ position, data }) => {
  const getEfficiencyColor = (efficiency) => {
    if (efficiency > 85) return 'text-green-600 bg-green-100';
    if (efficiency > 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{position}</h3>
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getEfficiencyColor(data.efficiency)}`}>
          {data.efficiency.toFixed(1)}%
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Good Decisions</span>
          <span className="text-sm font-medium text-green-600">{data.decisions.good}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Bad Decisions</span>
          <span className="text-sm font-medium text-red-600">{data.decisions.bad}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Points Left</span>
          <span className="text-sm font-medium text-gray-900">{data.pointsLeft.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
```

## Data Models

### Core Data Types
```typescript
interface LeagueData {
  league_id: string;
  name: string;
  season: number;
  size: number;
  current_week: number;
  teams: TeamData[];
  standings: TeamData[];
}

interface TeamData {
  teamId: number;
  teamName: string;
  ownerName: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  isYou?: boolean;
}

interface PlayerData {
  id: string;
  name: string;
  position: string;
  team: number;
  points: number;
  projected: number;
  lineup_slot: number;
  decision?: 'good' | 'okay' | 'bad';
}

interface WeeklyAnalysis {
  week: number;
  efficiency: number;
  pointsLeft: number;
  decisions: {
    good: number;
    okay: number;
    bad: number;
    total: number;
  };
  lineup: PlayerData[];
  bench: PlayerData[];
}

interface EfficiencyMetrics {
  overall: number;
  pointsLeft: number;
  weeklyTrend: number[];
  bestWeek: number;
  worstWeek: number;
}
```

### Decision Rating Algorithm
```javascript
const rateDecision = (startedPoints, benchPoints) => {
  if (startedPoints >= benchPoints) return 'good';
  
  const percentageDiff = (benchPoints - startedPoints) / benchPoints;
  if (percentageDiff <= 0.25) return 'okay';  // Within 25%
  return 'bad';  // More than 25% difference
};

const analyzeWeeklyLineup = (lineup, bench) => {
  const decisions = { good: 0, okay: 0, bad: 0, total: 0 };
  let totalPointsLeft = 0;
  
  lineup.forEach((starter) => {
    const bestBenchOption = bench
      .filter(player => canReplace(starter, player))
      .reduce((best, current) => 
        current.points > best.points ? current : best, 
        { points: 0 }
      );
    
    if (bestBenchOption.points > 0) {
      const decision = rateDecision(starter.points, bestBenchOption.points);
      decisions[decision]++;
      decisions.total++;
      
      if (decision === 'bad') {
        totalPointsLeft += bestBenchOption.points - starter.points;
      }
      
      starter.decision = decision;
    }
  });
  
  return { decisions, totalPointsLeft };
};
```

## Error Handling

### Error Boundary Component
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Fantasy Football Analyzer Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### API Error Handling
```javascript
const useESPNAPI = () => {
  const [state, dispatch] = useContext(AppContext);
  
  const handleAPIError = (error) => {
    if (error.response?.status === 401) {
      dispatch({ type: 'LOGOUT' });
      return 'Your ESPN session has expired. Please log in again.';
    }
    
    if (error.response?.status === 502) {
      return 'ESPN servers are currently unavailable. Please try again later.';
    }
    
    return error.response?.data?.detail || 'An unexpected error occurred.';
  };
  
  const makeRequest = async (endpoint, data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, data);
      return response.data;
    } catch (error) {
      const errorMessage = handleAPIError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  return { makeRequest };
};
```

## Testing Strategy

### Component Testing
```javascript
// Example test for ESPNLoginForm
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ESPNLoginForm } from './ESPNLoginForm';

describe('ESPNLoginForm', () => {
  it('should submit credentials when form is filled', async () => {
    const mockOnAuthenticate = jest.fn();
    
    render(
      <ESPNLoginForm 
        onAuthenticate={mockOnAuthenticate}
        loading={false}
        error={null}
      />
    );
    
    fireEvent.change(screen.getByPlaceholderText(/ESPN_S2/), {
      target: { value: 'test-espn-s2' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/SWID/), {
      target: { value: '{test-swid}' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/League ID/), {
      target: { value: '123456' }
    });
    
    fireEvent.click(screen.getByText('Connect to ESPN'));
    
    await waitFor(() => {
      expect(mockOnAuthenticate).toHaveBeenCalledWith({
        espn_s2: 'test-espn-s2',
        swid: '{test-swid}',
        league_id: '123456'
      });
    });
  });
});
```

### Integration Testing
- Test complete authentication flow
- Test data loading and display
- Test error handling scenarios
- Test responsive design breakpoints

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- Color contrast compliance
- Focus management

This design provides a comprehensive, accessible, and maintainable React frontend that integrates seamlessly with the ESPN API backend while delivering an excellent user experience for fantasy football analysis.