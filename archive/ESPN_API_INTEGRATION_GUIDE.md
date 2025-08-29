# ESPN Fantasy Football API Integration Guide

## 🏈 Overview

This guide provides complete documentation for the ESPN Fantasy Football API integration used in the Fantasy Football Season Analyzer. The integration enables secure access to ESPN's private league data for analyzing fantasy football decisions and optimizing lineup strategies.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- ESPN Fantasy Football league access
- ESPN cookies (ESPN_S2 and SWID)

### Setup
```bash
# 1. Navigate to ESPN service directory
cd espn-service

# 2. Activate virtual environment
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your ESPN credentials

# 5. Start the server
python simple_espn_server.py
```

### Test the Integration
```bash
# Run the test suite
python ../test_simple_server.py
```

## 📋 API Documentation

### Base URL
```
http://localhost:8001
```

### Authentication
All endpoints (except `/health`) require authentication via the `/authenticate` endpoint first.

#### POST /authenticate
Authenticate with ESPN and store credentials for the session.

**Request:**
```json
{
    "espn_s2": "your_espn_s2_cookie_value",
    "swid": "{YOUR-SWID-VALUE}",
    "league_id": "your_league_id"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Authentication successful",
    "league_info": {
        "league_id": "329849",
        "name": "Your League Name",
        "current_week": 19
    }
}
```

#### POST /league-info
Get complete league information including teams and standings.

**Request:**
```json
{
    "league_id": "329849",
    "year": 2024
}
```

**Response:**
```json
{
    "league_id": "329849",
    "name": "Your League Name",
    "season": 2024,
    "size": 10,
    "current_week": 19,
    "teams": [
        {
            "teamId": 1,
            "teamName": "Team Name",
            "ownerName": "Owner Name",
            "wins": 8,
            "losses": 6,
            "pointsFor": 1456.5,
            "pointsAgainst": 1398.2
        }
    ],
    "standings": [
        // Teams sorted by wins, then points
    ]
}
```

#### POST /team-roster
Get detailed roster information for a specific team and week.

**Request:**
```json
{
    "league_id": "329849",
    "team_id": "1",
    "week": 1,
    "year": 2024
}
```

**Response:**
```json
{
    "team_id": "1",
    "team_name": "Team Name",
    "week": 1,
    "roster": [
        {
            "id": "12345",
            "name": "Player Name",
            "position": "QB",
            "team": 1,
            "points": 24.5,
            "projected": 22.1,
            "lineup_slot": 0
        }
    ],
    "lineup": [
        // Starting players
    ],
    "bench": [
        // Bench players
    ]
}
```

#### POST /matchups
Get matchup results for a specific week.

**Request:**
```json
{
    "league_id": "329849",
    "week": 1,
    "year": 2024
}
```

**Response:**
```json
{
    "week": 1,
    "matchups": [
        {
            "home_team": {
                "team_id": 1,
                "score": 124.5
            },
            "away_team": {
                "team_id": 2,
                "score": 118.2
            }
        }
    ]
}
```

#### GET /health
Check server health and status.

**Response:**
```json
{
    "status": "healthy",
    "uptime_seconds": 3600,
    "requests_processed": 42,
    "authenticated": true
}
```

#### DELETE /logout
Clear stored credentials and end session.

**Response:**
```json
{
    "message": "Logged out successfully"
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `espn-service` directory:

```env
ESPN_S2=your_espn_s2_cookie_value
SWID={YOUR-SWID-VALUE}
LEAGUE_ID=your_league_id
PORT=8001
```

### Getting ESPN Credentials

1. **Login to ESPN Fantasy Football** in your browser
2. **Open Developer Tools** (F12)
3. **Go to Application/Storage tab**
4. **Find Cookies** for `fantasy.espn.com`
5. **Copy values:**
   - `espn_s2`: Long encrypted string
   - `SWID`: Value in format `{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}`

### Finding Your League ID
Your league ID is in the ESPN Fantasy URL:
```
https://fantasy.espn.com/football/league?leagueId=329849
                                                 ^^^^^^
                                              League ID
```

## 🏗️ Architecture

### System Flow
```
Frontend → Simple ESPN Server → ESPN Fantasy API
         ↓
    Local Session Storage
```

### Key Components

1. **Authentication Handler**: Validates and stores ESPN credentials
2. **ESPN API Client**: Makes requests to ESPN with proper headers
3. **Data Transformer**: Converts ESPN data to consistent formats
4. **Error Handler**: Provides user-friendly error messages
5. **Session Manager**: Maintains authentication state

### Data Models

#### Team Data
```python
{
    "teamId": int,
    "teamName": str,
    "ownerName": str,
    "wins": int,
    "losses": int,
    "pointsFor": float,
    "pointsAgainst": float
}
```

#### Player Data
```python
{
    "id": str,
    "name": str,
    "position": str,  # QB, RB, WR, TE, K, D/ST
    "team": int,      # NFL team ID
    "points": float,  # Actual points
    "projected": float,
    "lineup_slot": int
}
```

## 🧪 Testing

### Automated Testing
```bash
# Run the complete test suite
python test_simple_server.py

# Test specific functionality
python simple_espn_test.py
```

### Manual Testing
```bash
# 1. Health check
curl http://localhost:8001/health

# 2. Authentication
curl -X POST http://localhost:8001/authenticate \
  -H "Content-Type: application/json" \
  -d '{"espn_s2": "your_cookie", "swid": "your_swid", "league_id": "329849"}'

# 3. League info
curl -X POST http://localhost:8001/league-info \
  -H "Content-Type: application/json" \
  -d '{"league_id": "329849"}'
```

### Test Results Interpretation
- ✅ **All tests pass**: Integration is working correctly
- ⚠️ **Some tests fail**: Check credentials or ESPN API availability
- ❌ **Authentication fails**: Update ESPN cookies
- 🔄 **Timeouts**: ESPN API may be slow or unavailable

## 🚨 Error Handling

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Update ESPN credentials |
| 404 | Not Found | Verify league/team IDs |
| 500 | Server Error | Check server logs |
| 502 | Bad Gateway | ESPN API unavailable |

### Error Response Format
```json
{
    "detail": "Human-readable error message"
}
```

### Troubleshooting

#### "Authentication failed"
- Verify ESPN_S2 and SWID cookies are current
- Check that you have access to the specified league
- Ensure league ID is correct

#### "ESPN API unavailable"
- ESPN servers may be down for maintenance
- Check ESPN Fantasy website availability
- Retry after a few minutes

#### "Session expired"
- ESPN cookies have expired
- Re-authenticate with fresh cookies
- Consider automating cookie refresh

## 🔒 Security Considerations

### Current Security (Development)
- ✅ Credentials stored in memory only
- ✅ No persistent storage of sensitive data
- ✅ Session-based authentication
- ⚠️ No encryption (acceptable for single-user development)
- ⚠️ CORS enabled for all origins (development convenience)

### Production Security (Future)
- 🔒 AWS Parameter Store for credential encryption
- 🔒 JWT tokens with expiration
- 🔒 User-specific session isolation
- 🔒 Rate limiting and monitoring
- 🔒 CORS restricted to known domains

## 📊 Performance

### Current Performance
- **Response Time**: < 2 seconds for most requests
- **Throughput**: Suitable for single-user development
- **Memory Usage**: Minimal (in-memory session only)
- **ESPN API Limits**: Handled by ESPN (no explicit limits)

### Optimization Opportunities
- Response caching for static data
- Batch requests for multiple teams
- Connection pooling
- Async request handling

## 🔄 Development Workflow

### Adding New Endpoints
1. Define endpoint in `simple_espn_server.py`
2. Add ESPN API view parameter if needed
3. Implement data transformation
4. Add error handling
5. Update tests
6. Document the endpoint

### Modifying Data Formats
1. Update data models in design document
2. Modify transformation functions
3. Update all affected endpoints
4. Run full test suite
5. Update API documentation

### Debugging Issues
1. Check server logs for detailed errors
2. Test ESPN API directly with curl
3. Verify credentials are current
4. Use health endpoint to check server state
5. Run test suite to isolate issues

## 📚 Additional Resources

### ESPN API Documentation
- ESPN doesn't provide official API docs for fantasy football
- Community resources: [ESPN Fantasy API Guide](https://github.com/cwendt94/espn-api)
- Data format examples in test files

### Related Projects
- [espn-api Python library](https://github.com/cwendt94/espn-api)
- [ESPN Fantasy Football API](https://github.com/mkreiser/ESPN-Fantasy-Football-API)

### Support
- Check existing test files for usage examples
- Review server logs for detailed error information
- Refer to the design document for architecture details

## 🎯 Next Steps

### Immediate Development
1. **Frontend Integration**: Connect React components to these endpoints
2. **Business Logic**: Implement decision rating algorithm (25% threshold)
3. **Data Analysis**: Build efficiency calculation features
4. **User Experience**: Add league context and competitive features

### Future Enhancements
1. **Multi-user Support**: Session isolation and user management
2. **Caching**: Response caching for better performance
3. **Real-time Updates**: WebSocket support for live data
4. **Advanced Analytics**: More sophisticated analysis endpoints

---

This integration provides a solid foundation for ESPN Fantasy Football data access while maintaining simplicity for rapid development and testing. The architecture is designed to be easily extensible for future enhancements while providing reliable access to ESPN's fantasy football data.