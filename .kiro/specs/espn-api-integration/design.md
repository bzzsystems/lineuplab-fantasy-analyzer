# ESPN API Integration Design Document

## Overview

The ESPN API Integration provides a secure, simplified server that interfaces with ESPN's Fantasy Football API to retrieve league, team, and player data. The design prioritizes development speed and reliability over complex security features, making it ideal for testing and rapid iteration.

## Architecture

### System Architecture
```
Frontend Application → Simple ESPN Server → ESPN Fantasy API
                    ↓
                Local Storage (Session State)
```

### Technology Stack
- **Server Framework**: FastAPI (Python)
- **HTTP Client**: requests library
- **Session Storage**: In-memory (development)
- **Authentication**: Simple credential storage
- **CORS**: Enabled for frontend development

## Components and Interfaces

### Core Server Component (`simple_espn_server.py`)

#### Server State Management
```python
server_state = {
    'credentials': {},      # ESPN_S2, SWID, league_id
    'request_count': 0,     # Request counter
    'start_time': datetime, # Server start time
    'authenticated': False  # Authentication status
}
```

#### ESPN API Request Handler
```python
def make_espn_request(league_id: str, year: int, view: str = "") -> Dict
```
- Constructs ESPN API URLs with proper parameters
- Handles authentication headers (Cookie with ESPN_S2 and SWID)
- Implements timeout and error handling
- Returns parsed JSON response

### API Endpoints

#### Authentication Endpoint
```
POST /authenticate
Request: {
    "espn_s2": "string",
    "swid": "string", 
    "league_id": "string"
}
Response: {
    "success": true,
    "message": "Authentication successful",
    "league_info": {
        "league_id": "string",
        "name": "string",
        "current_week": number
    }
}
```

#### League Information Endpoint
```
POST /league-info
Request: {
    "league_id": "string",
    "year": number (optional, defaults to 2024)
}
Response: {
    "league_id": "string",
    "name": "string",
    "season": number,
    "size": number,
    "current_week": number,
    "teams": [TeamData],
    "standings": [TeamData] // sorted by wins, points
}
```

#### Team Roster Endpoint
```
POST /team-roster
Request: {
    "league_id": "string",
    "team_id": "string",
    "year": number (optional),
    "week": number (optional)
}
Response: {
    "team_id": "string",
    "team_name": "string",
    "week": number,
    "roster": [PlayerData],
    "lineup": [PlayerData],
    "bench": [PlayerData]
}
```

#### Matchups Endpoint
```
POST /matchups
Request: {
    "league_id": "string",
    "week": number,
    "year": number (optional)
}
Response: {
    "week": number,
    "matchups": [{
        "home_team": {"team_id": number, "score": number},
        "away_team": {"team_id": number, "score": number}
    }]
}
```

#### Health Check Endpoint
```
GET /health
Response: {
    "status": "healthy",
    "uptime_seconds": number,
    "requests_processed": number,
    "authenticated": boolean
}
```

#### Logout Endpoint
```
DELETE /logout
Response: {
    "message": "Logged out successfully"
}
```

## Data Models

### TeamData Model
```python
{
    "teamId": number,
    "teamName": "string",
    "ownerName": "string", 
    "wins": number,
    "losses": number,
    "pointsFor": number,
    "pointsAgainst": number
}
```

### PlayerData Model
```python
{
    "id": "string",
    "name": "string",
    "position": "string", // QB, RB, WR, TE, K, D/ST, etc.
    "team": number,       // NFL team ID
    "points": number,     // Actual points scored
    "projected": number,  // Projected points
    "lineup_slot": number // ESPN lineup slot ID
}
```

### ESPN Position ID Mapping
```python
positions = {
    1: 'QB', 2: 'RB', 3: 'WR', 4: 'TE', 5: 'K', 16: 'D/ST',
    17: 'FLEX', 20: 'BENCH', 21: 'IR'
}
```

## Error Handling

### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (missing parameters, invalid format)
- **401**: Unauthorized (invalid/expired ESPN credentials)
- **404**: Not Found (team not found, invalid league)
- **500**: Internal Server Error (unexpected errors)
- **502**: Bad Gateway (ESPN API unavailable)

### Error Response Format
```python
{
    "detail": "Human-readable error message"
}
```

### ESPN API Error Handling
1. **401 from ESPN**: Clear authentication state, require re-login
2. **Rate Limiting**: Implement exponential backoff (future enhancement)
3. **Timeouts**: 15-second timeout with clear error messages
4. **Network Errors**: Return 502 with "ESPN API unavailable"

## Testing Strategy

### Unit Tests
- ESPN API request construction
- Data transformation functions
- Error handling scenarios
- Position ID mapping

### Integration Tests
- Full authentication flow
- League data retrieval
- Team roster processing
- Matchup data parsing

### End-to-End Tests
- Complete user workflow
- Error recovery scenarios
- Performance under load
- ESPN API compatibility

### Test Data Requirements
- Valid ESPN credentials (ESPN_S2, SWID)
- Test league with known data
- Historical data for multiple weeks
- Edge cases (empty rosters, bye weeks)

## Security Considerations

### Development Security (Current)
- Credentials stored in memory only
- No encryption (acceptable for single-user development)
- CORS enabled for all origins (development convenience)
- No rate limiting (ESPN handles this)

### Production Security (Future)
- AWS Parameter Store for credential encryption
- JWT tokens with expiration
- User-specific session isolation
- Rate limiting and monitoring
- CORS restricted to known domains

## Performance Considerations

### Current Performance
- In-memory state (fast access)
- Direct ESPN API calls (no caching)
- Single-threaded (adequate for development)
- 15-second timeouts

### Optimization Opportunities
- Response caching for static data
- Batch requests for multiple teams
- Connection pooling
- Async request handling

## Deployment

### Development Deployment
```bash
# Setup
cd espn-service
source .venv/bin/activate
pip install -r requirements.txt

# Configuration
cp .env.example .env
# Edit .env with ESPN credentials

# Run
python simple_espn_server.py
# Server starts on http://localhost:8001
```

### Environment Variables
```
ESPN_S2=your_espn_s2_cookie
SWID=your_swid_value
LEAGUE_ID=your_league_id
PORT=8001 (optional)
```

### Dependencies
```
fastapi>=0.68.0
uvicorn>=0.15.0
requests>=2.25.0
python-dotenv>=0.19.0
```

## Monitoring and Logging

### Logging Strategy
- INFO level for normal operations
- ERROR level for failures
- Request/response logging for debugging
- Performance metrics (response times)

### Health Monitoring
- Server uptime tracking
- Request success/failure rates
- ESPN API availability
- Memory usage (for session state)

## Future Enhancements

### Phase 2 Features
- Multi-user session management
- Response caching
- Batch data operations
- Advanced error recovery

### Phase 3 Features
- Real-time data updates
- Webhook support
- Advanced analytics endpoints
- Performance optimization

## API Usage Examples

### Complete Workflow Example
```python
import requests

SERVER = "http://localhost:8001"

# 1. Authenticate
auth_response = requests.post(f"{SERVER}/authenticate", json={
    "espn_s2": "your_cookie",
    "swid": "your_swid", 
    "league_id": "329849"
})

# 2. Get league info
league_response = requests.post(f"{SERVER}/league-info", json={
    "league_id": "329849"
})

# 3. Get team roster
roster_response = requests.post(f"{SERVER}/team-roster", json={
    "league_id": "329849",
    "team_id": "1",
    "week": 1
})

# 4. Get matchups
matchup_response = requests.post(f"{SERVER}/matchups", json={
    "league_id": "329849", 
    "week": 1
})
```

This design provides a solid foundation for ESPN API integration while maintaining simplicity for rapid development and testing.