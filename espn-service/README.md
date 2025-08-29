# Fantasy Football Analyzer - Backend Service

A secure FastAPI backend service that integrates with ESPN Fantasy Football API to provide comprehensive team analysis and decision-making insights.

## Features

- **ESPN API Integration**: Secure authentication and data retrieval
- **Advanced Analytics Engine**: Position-specific scoring algorithms
- **League-wide Analysis**: Process all teams with detailed insights
- **In-memory Caching**: Optimized performance with 1-hour TTL
- **JWT Security**: Token-based authentication system

## Tech Stack

- **FastAPI** - Modern Python web framework
- **ESPN Fantasy API** - Direct league data integration
- **JWT Authentication** - Secure session management
- **Uvicorn** - ASGI server
- **Python 3.8+**

## Getting Started

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install fastapi uvicorn python-jose cryptography requests
```

3. Run the server:
```bash
python secure-espn-server.py
```

The server will start on http://localhost:8000

## API Endpoints

- `POST /secure-authenticate` - Authenticate with ESPN credentials
- `POST /secure-team-analysis` - Get detailed team analysis
- `POST /secure-all-teams-analysis` - Get league-wide analysis (cached)

## ESPN Authentication

You'll need your ESPN session cookies:
- `espn_s2` - Session cookie from ESPN.com
- `swid` - Secure Web ID from ESPN.com
- `league_id` - Your fantasy league ID

## Performance Features

- **Caching System**: Results cached for 1 hour to reduce API calls
- **Batch Processing**: Efficient handling of league-wide analysis
- **Rate Limiting**: Respectful API usage patterns

## Security

- JWT token-based authentication
- Encrypted session management
- Secure cookie handling

Built for fantasy football enthusiasts who want data-driven insights into their league's decision-making patterns.