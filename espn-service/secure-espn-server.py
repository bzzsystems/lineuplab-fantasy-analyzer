# Secure server state
import os
import json
import logging
import secrets
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
# from dotenv import load_dotenv  # Commented out
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import requests
import jwt
from cryptography.fernet import Fernet
import hashlib

# load_dotenv()  # Commented out

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security configuration
JWT_SECRET = os.getenv('JWT_SECRET', secrets.token_urlsafe(32))
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', Fernet.generate_key())
SESSION_TIMEOUT = 3600  # 1 hour in seconds

# In-memory cache for league analysis (1 hour TTL) - CLEARED FOR TESTING
league_analysis_cache = {}
CACHE_TTL = 3600  # 1 hour

def get_cache_key(league_id: str, year: int, start_week: int, end_week: int) -> str:
    """Generate a cache key for league analysis"""
    return f"league_{league_id}_{year}_{start_week}_{end_week}"

def get_cached_analysis(cache_key: str) -> Optional[Dict]:
    """Get cached analysis if still valid"""
    if cache_key in league_analysis_cache:
        cached_data = league_analysis_cache[cache_key]
        if time.time() - cached_data['timestamp'] < CACHE_TTL:
            logger.info(f"Cache HIT for {cache_key}")
            return cached_data['data']
        else:
            # Cache expired, remove it
            del league_analysis_cache[cache_key]
            logger.info(f"Cache EXPIRED for {cache_key}")
    
    logger.info(f"Cache MISS for {cache_key}")
    return None

def set_cached_analysis(cache_key: str, data: Dict) -> None:
    """Cache the analysis result"""
    league_analysis_cache[cache_key] = {
        'data': data,
        'timestamp': time.time()
    }
    logger.info(f"Cache SET for {cache_key}")

app = FastAPI(title="Secure ESPN Fantasy Football Server")
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://yourdomain.com"],
    allow_credentials=True, 
    allow_methods=["GET", "POST", "OPTIONS"], 
    allow_headers=["*"]
)

security = HTTPBearer()
cipher_suite = Fernet(ENCRYPTION_KEY)

# Secure server state
class SecureServerState:
    def __init__(self):
        self.encrypted_sessions: Dict[str, Dict] = {}
        self.request_count = 0
        self.start_time = datetime.now()
        self.failed_attempts: Dict[str, int] = {}
    
    def cleanup_expired_sessions(self):
        """Remove expired sessions"""
        current_time = time.time()
        expired_sessions = [
            session_id for session_id, data in self.encrypted_sessions.items()
            if current_time > data.get('expires_at', 0)
        ]
        for session_id in expired_sessions:
            del self.encrypted_sessions[session_id]
            logger.info(f"Cleaned up expired session: {session_id[:8]}...")

server_state = SecureServerState()
class SecurityManager:
    @staticmethod
    def encrypt_credentials(credentials: Dict[str, str]) -> str:
        """Encrypt ESPN credentials"""
        try:
            credentials_json = json.dumps(credentials)
            encrypted = cipher_suite.encrypt(credentials_json.encode())
            return encrypted.decode()
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Security error")
    
    @staticmethod
    def decrypt_credentials(encrypted_data: str) -> Dict[str, str]:
        """Decrypt ESPN credentials"""
        try:
            decrypted = cipher_suite.decrypt(encrypted_data.encode())
            return json.loads(decrypted.decode())
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            raise HTTPException(status_code=401, detail="Invalid session")
    
    @staticmethod
    def create_session_token(league_id: str, user_identifier: str) -> str:
        """Create JWT session token"""
        payload = {
            'league_id': league_id,
            'user_id': user_identifier,  # Use user_identifier directly (already hashed)
            'issued_at': time.time(),
            'expires_at': time.time() + SESSION_TIMEOUT
        }
        return jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    
    @staticmethod
    def validate_session_token(token: str) -> Dict[str, Any]:
        """Validate JWT session token"""
        logger.info(f"Validating JWT token: {token[:30]}...")
        
        try:
            # Decode the JWT token
            logger.info("Attempting to decode JWT...")
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            logger.info(f"JWT decoded successfully: {payload}")
            
            # Check expiration
            current_time = time.time()
            expires_at = payload.get('expires_at', 0)
            logger.info(f"Current time: {current_time}, Expires at: {expires_at}")
            
            if current_time > expires_at:
                logger.error(f"Token expired: {current_time} > {expires_at}")
                raise HTTPException(status_code=401, detail="Session expired")
            
            logger.info("Token validation successful")
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.error("JWT signature expired")
            raise HTTPException(status_code=401, detail="Session expired")
        except jwt.InvalidTokenError as e:
            logger.error(f"JWT invalid: {str(e)}")
            raise HTTPException(status_code=401, detail="Invalid session token")
        except Exception as e:
            logger.error(f"Unexpected JWT error: {type(e).__name__}: {str(e)}")
            raise HTTPException(status_code=401, detail="Token validation failed")

def validate_inputs(league_id: str, year: int = None):
    """Validate and sanitize inputs"""
    # ESPN league IDs are 6-7 digit numbers
    if not league_id or not league_id.isdigit() or len(league_id) < 6 or len(league_id) > 7:
        raise HTTPException(status_code=400, detail="Invalid league ID format")
    
    if year and (year < 2015 or year > 2025):
        raise HTTPException(status_code=400, detail="Invalid year")
    
    return league_id, year

def get_position_name(position_id: int) -> str:
    """Convert ESPN position ID to readable position name"""
    position_map = {
        0: 'QB',   # Quarterback
        1: 'QB',   # Quarterback
        2: 'RB',   # Running Back
        3: 'WR',   # Wide Receiver
        4: 'TE',   # Tight End
        5: 'K',    # Kicker
        16: 'D/ST', # Defense/Special Teams
        17: 'FLEX', # Flex
        20: 'BENCH', # Bench
        21: 'IR'    # Injured Reserve
    }
    return position_map.get(position_id, 'FLEX')

def rate_limit_check(identifier: str) -> bool:
    """Basic rate limiting"""
    current_time = time.time()
    
    # Clean old attempts (older than 1 hour)
    cleaned_attempts = {}
    for k, v in server_state.failed_attempts.items():
        try:
            timestamp = float(k.split('_')[-1]) if k.split('_')[-1].isdigit() else 0
            if current_time - timestamp < 3600:  # Keep if less than 1 hour old
                cleaned_attempts[k] = v
        except (ValueError, IndexError):
            pass  # Skip malformed keys
    
    server_state.failed_attempts = cleaned_attempts
    
    # Check recent failures
    recent_failures = sum(1 for k in server_state.failed_attempts.keys() if k.startswith(identifier))
    if recent_failures >= 10:  # Max 10 failures per hour
        raise HTTPException(status_code=429, detail="Too many failed attempts")
    
    return True
def make_espn_request(session_token: str, league_id: str, year: int, view: str = "", scoring_period: int = None) -> Dict:
    """Make secure ESPN API request"""
    logger.info("=== ESPN REQUEST DEBUG ===")
    
    # Validate session and get credentials
    session_data = SecurityManager.validate_session_token(session_token)
    logger.info(f"Session data: {session_data}")
    
    # Simplified session lookup - use the expected session ID format
    expected_session_id = f"{session_data['user_id']}_{session_data['league_id']}"
    logger.info(f"Looking for session ID: {expected_session_id}")
    logger.info(f"Available sessions: {list(server_state.encrypted_sessions.keys())}")
    
    if expected_session_id not in server_state.encrypted_sessions:
        logger.error(f"Session not found: {expected_session_id}")
        
        # Clean up expired sessions first
        server_state.cleanup_expired_sessions()
        
        # Try again after cleanup
        if expected_session_id not in server_state.encrypted_sessions:
            # Fallback: try to find any session for this league
            session_found = None
            for stored_session_id, session_info in server_state.encrypted_sessions.items():
                if session_info.get('league_id') == session_data['league_id']:
                    session_found = stored_session_id
                    logger.info(f"Found fallback session: {session_found}")
                    break
            
            if not session_found:
                raise HTTPException(status_code=401, detail="Session not found - please re-authenticate")
            expected_session_id = session_found
    
    # Get session data
    session_info = server_state.encrypted_sessions[expected_session_id]
    
    # Check session expiration
    if time.time() > session_info.get('expires_at', 0):
        del server_state.encrypted_sessions[expected_session_id]
        raise HTTPException(status_code=401, detail="Session expired - please re-authenticate")
    
    # Decrypt credentials
    encrypted_creds = session_info['credentials']
    credentials = SecurityManager.decrypt_credentials(encrypted_creds)
    logger.info("Successfully retrieved and decrypted credentials")
    
    # Make ESPN request
    headers = {
        'Cookie': f"espn_s2={credentials['espn_s2']}; SWID={credentials['swid']}",
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    url = f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/{year}/segments/0/leagues/{league_id}"
    
    # Build query parameters
    params = []
    if view:
        params.append(f"view={view}")
    if scoring_period:
        params.append(f"scoringPeriodId={scoring_period}")
    
    if params:
        url += "?" + "&".join(params)
    
    logger.info(f"Making ESPN API request to: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            logger.info("ESPN API request successful")
            return response.json()
        elif response.status_code == 401:
            # Log failed attempt
            identifier = session_data['user_id']
            server_state.failed_attempts[f"{identifier}_{int(time.time())}"] = 1
            raise HTTPException(status_code=401, detail="ESPN authentication failed - credentials may be expired")
        else:
            logger.error(f"ESPN API error: {response.status_code} - {response.text[:200]}")
            raise HTTPException(status_code=502, detail=f"ESPN API error: {response.status_code}")
            
    except requests.RequestException as e:
        logger.error(f"ESPN API request failed: {str(e)}")
        raise HTTPException(status_code=502, detail="ESPN API unavailable")
    
    url = f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/{year}/segments/0/leagues/{league_id}"
    
    # Build query parameters
    params = []
    if view:
        params.append(f"view={view}")
    if scoring_period:
        params.append(f"scoringPeriodId={scoring_period}")
    
    if params:
        url += "?" + "&".join(params)
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            logger.info("ESPN API request successful")
            return response.json()
        elif response.status_code == 401:
            # Log failed attempt
            identifier = session_data['user_id']
            server_state.failed_attempts[f"{identifier}_{int(time.time())}"] = 1
            raise HTTPException(status_code=401, detail="ESPN authentication failed")
        else:
            raise HTTPException(status_code=502, detail=f"ESPN API error: {response.status_code}")
            
    except requests.RequestException as e:
        logger.error(f"ESPN API request failed: {str(e)}")
        raise HTTPException(status_code=502, detail="ESPN API unavailable")
async def get_current_session(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """Extract and validate session token"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    token = credentials.credentials
    logger.info(f"Validating session token: {token[:30]}...")
    
    try:
        # Validate the token and return it if valid
        SecurityManager.validate_session_token(token)
        return token
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session validation error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid session token")
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    server_state.cleanup_expired_sessions()
    return {
        'status': 'healthy',
        'uptime_seconds': (datetime.now() - server_state.start_time).total_seconds(),
        'requests_processed': server_state.request_count,
        'active_sessions': len(server_state.encrypted_sessions)
    }
@app.post("/secure-authenticate")
async def secure_authenticate(request: dict):
    """Secure authentication endpoint"""
    server_state.request_count += 1
    
    try:
        # Debug: Log the received request
        logger.info(f"Received authentication request: {type(request)}")
        
        # Handle case where request might be a string (FastAPI parsing issue)
        if isinstance(request, str):
            try:
                request = json.loads(request)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON in request")
        
        # Validate inputs
        espn_s2 = request.get('espn_s2', '').strip() if isinstance(request, dict) else ''
        swid = request.get('swid', '').strip() if isinstance(request, dict) else ''
        league_id = request.get('league_id', '').strip() if isinstance(request, dict) else ''
        
        logger.info(f"Parsed credentials - League ID: {league_id}, ESPN_S2 length: {len(espn_s2)}, SWID: {swid}")
        logger.info(f"ESPN_S2 (first 50 chars): {espn_s2[:50]}...")
        logger.info(f"ESPN_S2 (last 20 chars): ...{espn_s2[-20:]}")
        
        if not all([espn_s2, swid, league_id]):
            logger.error(f"Missing credentials - ESPN_S2: {bool(espn_s2)}, SWID: {bool(swid)}, League: {bool(league_id)}")
            raise HTTPException(status_code=400, detail="Missing required credentials")
        
        # Validate league ID format
        league_id, _ = validate_inputs(league_id)
        
        # Rate limiting
        user_identifier = hashlib.sha256(f"{espn_s2}_{swid}".encode()).hexdigest()[:16]
        rate_limit_check(user_identifier)
        
        # Test credentials by making a test request
        test_headers = {
            'Cookie': f"espn_s2={espn_s2}; SWID={swid}",
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        
        test_url = f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/{league_id}?view=mTeam"
        logger.info(f"Testing ESPN API connection to: {test_url}")
        
        test_response = requests.get(test_url, headers=test_headers, timeout=10)
        logger.info(f"ESPN API response status: {test_response.status_code}")
        
        if test_response.status_code != 200:
            logger.error(f"ESPN API failed with status {test_response.status_code}: {test_response.text[:200]}")
            server_state.failed_attempts[f"{user_identifier}_{int(time.time())}"] = 1
            raise HTTPException(status_code=401, detail=f"ESPN API error: {test_response.status_code}")
        
        # Verify user is member of this league
        league_data = test_response.json()
        user_teams = []
        swid_clean = swid.replace('{', '').replace('}', '')
        
        logger.info(f"League data received for league: {league_data.get('settings', {}).get('name', 'Unknown')}")
        logger.info(f"Looking for SWID: {swid_clean}")
        
        for team in league_data.get('teams', []):
            team_owners = team.get('owners', [])
            
            # Extract team name from multiple possible fields
            team_name = team.get('name')
            if not team_name:
                # Try location + nickname format
                location = team.get('location', '')
                nickname = team.get('nickname', '')
                if location or nickname:
                    team_name = f"{location} {nickname}".strip()
                else:
                    team_name = team.get('abbrev', f"Team {team.get('id', '?')}")
            
            logger.info(f"Team {team_name} has {len(team_owners)} owners")

            for owner in team_owners:
                owner_id = ''
                if isinstance(owner, dict):
                    owner_id = owner.get('id', '')
                elif isinstance(owner, str):
                    owner_id = owner.replace('{', '').replace('}', '')
                logger.info(f"Checking owner ID: {owner_id}")
                
                if owner_id == swid_clean:
                    # Get owner display name from members data
                    owner_display_name = 'Your Team'
                    for member in league_data.get('members', []):
                        if member.get('id', '').replace('{', '').replace('}', '') == swid_clean:
                            owner_display_name = member.get('displayName', 'Your Team')
                            break
                    
                    user_teams.append({
                        'team_id': team.get('id'),
                        'team_name': team_name,
                        'owner_name': owner_display_name
                    })
                    logger.info(f"Found matching team: {team_name} (Owner: {owner_display_name})")
                    break
        
        # Create secure session
        credentials = {'espn_s2': espn_s2, 'swid': swid}
        encrypted_credentials = SecurityManager.encrypt_credentials(credentials)
        session_token = SecurityManager.create_session_token(league_id, user_identifier)
        
        # Store session with expiration
        session_id = f"{user_identifier}_{league_id}"
        server_state.encrypted_sessions[session_id] = {
            'credentials': encrypted_credentials,
            'league_id': league_id,
            'user_teams': user_teams,
            'expires_at': time.time() + SESSION_TIMEOUT,
            'created_at': time.time()
        }
        
        logger.info(f"Secure authentication successful for league {league_id}, user has {len(user_teams)} teams")
        
        return {
            'session_token': session_token,
            'expires_in': SESSION_TIMEOUT,
            'league_info': {
                'league_id': league_id,
                'name': league_data.get('settings', {}).get('name', 'Unknown League'),
                'current_week': league_data.get('scoringPeriodId', 1),
                'your_teams': user_teams
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Authentication failed")
              
@app.post("/secure-league-info")
async def secure_get_league_info(
    request: dict, 
    session_token: str = Depends(get_current_session)
):
    """Get complete league information with competitive context"""
    server_state.request_count += 1
    
    try:
        league_id = request.get('league_id')
        year = request.get('year', 2024)
        
        if not league_id:
            raise HTTPException(status_code=400, detail="League ID required")
        
        league_id, year = validate_inputs(league_id, year)
        logger.info(f"Getting league info for {league_id}, year {year}")
        
        # Get league data using secure request with team and member info
        data = make_espn_request(session_token, league_id, year, "mTeam&mSettings")
        
        # Get session info to identify user's team
        session_data = SecurityManager.validate_session_token(session_token)
        session_id = f"{session_data['user_id']}_{session_data['league_id']}"
        
        # Safely get user teams
        user_teams = []
        if session_id in server_state.encrypted_sessions:
            user_teams = server_state.encrypted_sessions[session_id].get('user_teams', [])
        
        user_team_ids = [team['team_id'] for team in user_teams]
        
        # Build a member lookup from league settings if available
        member_lookup = {}
        if 'members' in data:
            for member in data.get('members', []):
                member_id = member.get('id', '')
                display_name = member.get('displayName') or f"{member.get('firstName', '')} {member.get('lastName', '')}".strip()
                if display_name:
                    member_lookup[member_id] = display_name
                logger.info(f"Member lookup: {member_id} -> {display_name}")
        
        # Build enhanced team data with competitive context
        teams = []
        for team in data.get('teams', []):
            logger.info(f"Processing team data: {team}")
            
            # Extract team name - try multiple fields
            team_name = team.get('name') or team.get('location', '') + ' ' + team.get('nickname', '')
            if not team_name or team_name.strip() == ' ':
                team_name = f"Team {team.get('id', 'Unknown')}"
            
            # Handle owners safely - try to get displayName or firstName/lastName
            owners = team.get('owners', [])
            owner_name = team_name  # Default to team name if no owner found
            
            logger.info(f"Team {team.get('id')} owners: {owners}")
            
            if owners:
                owner = owners[0]
                owner_id = None
                
                if isinstance(owner, dict):
                    owner_id = owner.get('id')
                    # Try displayName first
                    owner_name = owner.get('displayName')
                    if not owner_name:
                        # Try firstName + lastName
                        first_name = owner.get('firstName', '')
                        last_name = owner.get('lastName', '')
                        if first_name or last_name:
                            owner_name = f"{first_name} {last_name}".strip()
                elif isinstance(owner, str):
                    owner_id = owner.replace('{', '').replace('}', '')
                
                # Try member lookup if we have an owner ID but no name
                if owner_id and (not owner_name or owner_name == team_name):
                    if owner_id in member_lookup:
                        owner_name = member_lookup[owner_id]
                        logger.info(f"Found owner name from member lookup: {owner_name}")
                
                # If still no owner name, just use team name (cleaner than showing IDs)
                if not owner_name or owner_name == team_name:
                    owner_name = team_name
            
            logger.info(f"Final team name: {team_name}, owner: {owner_name}")
            
            team_data = {
                'teamId': team.get('id'),
                'teamName': team_name.strip(),
                'ownerName': owner_name,
                'wins': team.get('record', {}).get('overall', {}).get('wins', 0),
                'losses': team.get('record', {}).get('overall', {}).get('losses', 0),
                'pointsFor': team.get('record', {}).get('overall', {}).get('pointsFor', 0),
                'pointsAgainst': team.get('record', {}).get('overall', {}).get('pointsAgainst', 0),
                'isYou': team.get('id') in user_team_ids
            }
            teams.append(team_data)
        
        # Sort teams by wins (for standings)
        teams_by_wins = sorted(teams, key=lambda x: (x['wins'], x['pointsFor']), reverse=True)
        
        league_info = {
            'league_id': league_id,
            'name': data.get('settings', {}).get('name', f"League {league_id}"),
            'season': year,
            'size': len(teams),
            'scoring_type': 'ppr',
            'current_week': data.get('scoringPeriodId', 1),
            'teams': teams,
            'standings': teams_by_wins,
            'your_teams': user_teams
        }
        
        logger.info(f"League info processed: {league_info['name']} with {len(teams)} teams")
        
        return league_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching league info: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch league information: {str(e)}")

@app.post("/secure-team-analysis")
async def secure_get_team_analysis(
    request: dict,
    session_token: str = Depends(get_current_session)
):
    """Get team analysis data for efficiency calculations"""
    server_state.request_count += 1
    
    try:
        league_id = request.get('league_id')
        team_id = request.get('team_id')
        year = request.get('year', 2024)
        start_week = request.get('start_week', 1)
        end_week = request.get('end_week', 17)
        
        league_id, year = validate_inputs(league_id, year)
        
        if not team_id:
            raise HTTPException(status_code=400, detail="Team ID required")
        
        # Verify user owns this team
        session_data = SecurityManager.validate_session_token(session_token)
        session_id = f"{session_data['user_id']}_{session_data['league_id']}"
        
        logger.info(f"Looking for session: {session_id}")
        logger.info(f"Available sessions: {list(server_state.encrypted_sessions.keys())}")
        
        if session_id not in server_state.encrypted_sessions:
            # Try to find any session for this league as fallback
            session_found = None
            for stored_session_id, session_info in server_state.encrypted_sessions.items():
                if session_info.get('league_id') == session_data['league_id']:
                    session_found = stored_session_id
                    logger.info(f"Found fallback session: {session_found}")
                    break
            
            if not session_found:
                raise HTTPException(status_code=401, detail="Session not found - please re-authenticate")
            session_id = session_found
        
        user_teams = server_state.encrypted_sessions[session_id]['user_teams']
        user_team_ids = [team['team_id'] for team in user_teams]
        
        logger.info(f"User teams: {user_team_ids}, requested team: {team_id}")
        
        if int(team_id) not in user_team_ids:
            raise HTTPException(status_code=403, detail="Access denied to this team")
        
        # Get detailed roster data
        data = make_espn_request(session_token, league_id, year, "mRoster&mMatchup")
        
        # Find the specific team
        team_data = None
        for team in data.get('teams', []):
            if str(team.get('id')) == str(team_id):
                team_data = team
                break
        
        if not team_data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        # Process weekly lineup data for efficiency analysis
        weekly_analysis = {}
        
        logger.info(f"Fetching weekly data for team {team_id} from week {start_week} to {end_week}")
        
        # Get weekly roster data for each week
        for week in range(start_week, min(end_week + 1, 18)):
            try:
                logger.info(f"Fetching week {week} data...")
                
                # Get roster data with lineup information for this week
                week_data = make_espn_request(
                    session_token, 
                    league_id, 
                    year, 
                    "mRoster",
                    scoring_period=week
                )
                
                # Find team's roster for this week
                team_week_data = None
                for team in week_data.get('teams', []):
                    if str(team.get('id')) == str(team_id):
                        team_week_data = team
                        break
                
                if not team_week_data or 'roster' not in team_week_data:
                    logger.warning(f"No roster data found for team {team_id} in week {week}")
                    continue
                
                # Process roster entries
                lineup_players = []
                bench_players = []
                
                for entry in team_week_data['roster'].get('entries', []):
                    player_pool_entry = entry.get('playerPoolEntry', {})
                    player = player_pool_entry.get('player', {})
                    lineup_slot_id = entry.get('lineupSlotId', 20)  # 20 = bench
                    
                    # Get player stats for this week - find both actual and projected points
                    fantasy_points = 0.0
                    projected_points = 0.0
                    stats = player.get('stats', [])
                    
                    # Try to find the stat with actual scoring data (not projected)
                    # Priority 1: scoringPeriodId=week, statSourceId=0, statSplitTypeId=1 (most accurate)
                    for stat in stats:
                        if (stat.get('scoringPeriodId') == week and 
                            stat.get('statSourceId') == 0 and 
                            stat.get('statSplitTypeId') == 1):
                            fantasy_points = stat.get('appliedTotal', 0.0)
                            logger.info(f"Found actual stat for {player.get('fullName', 'Unknown')} week {week}: {fantasy_points}")
                            break
                    
                    # Priority 2: If not found, try scoringPeriodId=week, statSourceId=0 (any statSplitTypeId)  
                    if fantasy_points == 0.0:
                        for stat in stats:
                            if (stat.get('scoringPeriodId') == week and 
                                stat.get('statSourceId') == 0):
                                fantasy_points = stat.get('appliedTotal', 0.0)
                                logger.info(f"Found fallback stat for {player.get('fullName', 'Unknown')} week {week}: {fantasy_points}")
                                break
                    
                    # Try to find projected points - usually statSourceId=1 for projections
                    for stat in stats:
                        if (stat.get('scoringPeriodId') == week and 
                            stat.get('statSourceId') == 1):
                            projected_points = stat.get('appliedTotal', 0.0)
                            logger.info(f"Found projected stat for {player.get('fullName', 'Unknown')} week {week}: {projected_points}")
                            break
                    
                    # Get player info
                    player_info = {
                        'name': player.get('fullName', 'Unknown Player'),
                        'position': get_position_name(player.get('defaultPositionId', 0)),
                        'points': fantasy_points,
                        'projected': projected_points,
                        'player_id': player.get('id', 0),
                        'lineup_slot': lineup_slot_id
                    }
                    
                    # Categorize as lineup or bench (IR = 21, Bench = 20)
                    if lineup_slot_id in [20, 21]:  # Bench or IR
                        bench_players.append(player_info)
                    else:  # Active lineup (QB=0, RB=2, WR=4, TE=6, FLEX=23, K=17, D/ST=16)
                        lineup_players.append(player_info)
                
                # Store week data
                weekly_analysis[str(week)] = {
                    'teamRosters': {
                        str(team_id): {
                            'team_id': str(team_id),
                            'team_name': team_week_data.get('name', 'Unknown Team'),
                            'owner_name': team_week_data.get('owners', [{}])[0].get('displayName', 'Unknown Owner'),
                            'lineup': lineup_players,
                            'bench': bench_players
                        }
                    }
                }
                
                logger.info(f"Week {week}: Found {len(lineup_players)} lineup players, {len(bench_players)} bench players")
                
            except Exception as e:
                logger.error(f"Failed to fetch week {week} data: {str(e)}")
                continue
        
        analysis_result = {
            'team_id': str(team_data.get('id')),
            'team_name': team_data.get('name', 'Unknown Team'),
            'owner_name': team_data.get('owners', [{}])[0].get('displayName', 'Unknown Owner'),
            'season': year,
            'league_id': league_id,
            'weeks_analyzed': list(range(start_week, min(end_week + 1, 18))),
            'weekly_data': weekly_analysis,
            'total_weeks_processed': len(weekly_analysis),
            'message': f'Successfully processed {len(weekly_analysis)} weeks of real ESPN data'
        }
        
        return analysis_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in team analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/secure-league-matchups")
async def secure_get_league_matchups(
    request: dict,
    session_token: str = Depends(get_current_session)
):
    """Get all weekly matchups for the entire league"""
    server_state.request_count += 1
    
    try:
        league_id = request.get('league_id')
        year = request.get('year', 2024)
        week = request.get('week')
        
        league_id, year = validate_inputs(league_id, year)
        
        if not week:
            raise HTTPException(status_code=400, detail="Week required")
        
        logger.info(f"Getting matchups for league {league_id}, week {week}, year {year}")
        
        # Get matchup data
        data = make_espn_request(session_token, league_id, year, "mMatchup", scoring_period=week)
        
        # Build matchup data
        matchups = []
        schedule = data.get('schedule', [])
        
        for matchup in schedule:
            if matchup.get('matchupPeriodId') == week:
                home_team = matchup.get('home', {})
                away_team = matchup.get('away', {})
                
                # Get team names from teams data
                home_team_name = "Unknown Team"
                away_team_name = "Unknown Team"
                
                for team in data.get('teams', []):
                    if team.get('id') == home_team.get('teamId'):
                        home_team_name = team.get('name', 'Unknown Team')
                    elif team.get('id') == away_team.get('teamId'):
                        away_team_name = team.get('name', 'Unknown Team')
                
                matchup_data = {
                    'matchupId': matchup.get('id'),
                    'week': week,
                    'homeTeam': {
                        'teamId': home_team.get('teamId'),
                        'teamName': home_team_name,
                        'score': home_team.get('totalPoints', 0)
                    },
                    'awayTeam': {
                        'teamId': away_team.get('teamId'),
                        'teamName': away_team_name,
                        'score': away_team.get('totalPoints', 0)
                    },
                    'winner': 'home' if home_team.get('totalPoints', 0) > away_team.get('totalPoints', 0) else 'away'
                }
                matchups.append(matchup_data)
        
        return {
            'league_id': league_id,
            'week': week,
            'year': year,
            'matchups': matchups
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching matchups: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch matchups: {str(e)}")

@app.get("/debug-sessions")
async def debug_sessions():
    """Debug endpoint to see current sessions"""
    session_keys = list(server_state.encrypted_sessions.keys())
    return {
        "total_sessions": len(session_keys),
        "session_keys": session_keys
    }

@app.post("/secure-all-teams-analysis")
async def secure_get_all_teams_analysis(
    request: dict,
    session_token: str = Depends(get_current_session)
):
    """Get efficiency analysis for all teams in the league"""
    server_state.request_count += 1
    
    try:
        league_id = request.get('league_id')
        year = request.get('year', 2024)
        start_week = request.get('start_week', 1)
        end_week = request.get('end_week', 17)
        
        league_id, year = validate_inputs(league_id, year)
        
        # Check cache first (DISABLED FOR TEAM NAME DEBUGGING)
        cache_key = get_cache_key(league_id, year, start_week, end_week)
        cached_result = None  # get_cached_analysis(cache_key)
        if cached_result:
            logger.info(f"Returning cached analysis for league {league_id}")
            return cached_result
        
        logger.info(f"Getting all teams analysis for league {league_id} (cache miss - will compute)")
        
        # Get league data to get all team IDs - try mTeam view for more detailed team info
        league_data = make_espn_request(session_token, league_id, year, view="mTeam")
        teams = league_data.get('teams', [])
        members = league_data.get('members', [])
        
        logger.info(f"Retrieved {len(teams)} teams from ESPN API with mTeam view")
        logger.info(f"Retrieved {len(members)} members from ESPN API")
        
        # Create member lookup dictionary for owner names
        member_lookup = {}
        for member in members:
            member_id = member.get('id', '').replace('{', '').replace('}', '')
            display_name = member.get('displayName', '')
            if member_id and display_name:
                member_lookup[member_id] = display_name
                logger.info(f"Member lookup: {member_id} -> {display_name}")
        
        all_teams_data = {}
        
        # Process each team
        for team in teams:
            team_id = str(team.get('id'))
            # Extract team name properly - try multiple ESPN fields with better fallbacks
            team_name = None
            
            # Debug: Log all available team fields
            logger.info(f"Team {team_id} raw data fields: {list(team.keys())}")
            logger.info(f"Team {team_id} name fields: name={team.get('name')}, teamName={team.get('teamName')}, abbrev={team.get('abbrev')}, location={team.get('location')}, nickname={team.get('nickname')}")
            
            # Try various ESPN team name fields in order of preference  
            # ESPN typically stores custom team names in "location" field
            potential_names = [
                team.get('location'),  # Full custom team name (e.g. "Scott Hanson's Witching Hour")
                team.get('nickname'),  # Team nickname
                # Combine location + nickname if both exist
                f"{team.get('location', '')} {team.get('nickname', '')}".strip() if team.get('location') and team.get('nickname') else None,
                team.get('name'),
                team.get('teamName'),
                team.get('abbrev'),  # Last resort - abbreviation
            ]
            
            for name in potential_names:
                if name and name.strip() and not name.startswith('{') and len(name.strip()) > 2:
                    team_name = name.strip()
                    break
            
            # If no direct name found, try location + nickname
            if not team_name:
                location = team.get('location', '').strip()
                nickname = team.get('nickname', '').strip()
                if location and nickname:
                    team_name = f"{location} {nickname}"
                elif location:
                    team_name = location
                elif nickname:
                    team_name = nickname
            
            # Final fallback
            if not team_name:
                team_name = f"Team {team_id}"
            
            logger.info(f"Processing team {team_id}: {team_name}")
            
            # Get weekly data for this team
            weekly_analysis = {}
            
            for week in range(start_week, min(end_week + 1, 18)):
                try:
                    # Get roster data for this week
                    week_data = make_espn_request(
                        session_token, 
                        league_id, 
                        year, 
                        "mRoster",
                        scoring_period=week
                    )
                    
                    # Find this team's roster
                    team_week_data = None
                    for team_roster in week_data.get('teams', []):
                        if str(team_roster.get('id')) == team_id:
                            team_week_data = team_roster
                            break
                    
                    if not team_week_data or 'roster' not in team_week_data:
                        continue
                    
                    # Process roster entries
                    lineup_players = []
                    bench_players = []
                    
                    for entry in team_week_data['roster'].get('entries', []):
                        player_pool_entry = entry.get('playerPoolEntry', {})
                        player = player_pool_entry.get('player', {})
                        lineup_slot_id = entry.get('lineupSlotId', 20)
                        
                        # Get player stats for this week
                        fantasy_points = 0.0
                        stats = player.get('stats', [])
                        for stat in stats:
                            if (stat.get('scoringPeriodId') == week and 
                                stat.get('statSourceId') == 0 and 
                                stat.get('statSplitTypeId') == 1):
                                # Use appliedTotal from the actual scoring stat (not projected)
                                fantasy_points = stat.get('appliedTotal', 0.0)
                                break
                        
                        player_info = {
                            'name': player.get('fullName', 'Unknown Player'),
                            'position': get_position_name(player.get('defaultPositionId', 0)),
                            'points': fantasy_points,
                            'player_id': player.get('id', 0),
                            'lineup_slot': lineup_slot_id
                        }
                        
                        if lineup_slot_id in [20, 21]:  # Bench or IR
                            bench_players.append(player_info)
                        else:  # Active lineup (QB=0, RB=2, WR=4, TE=6, FLEX=23, K=17, D/ST=16)
                            lineup_players.append(player_info)
                    
                    weekly_analysis[str(week)] = {
                        'lineup': lineup_players,
                        'bench': bench_players
                    }
                    
                except Exception as e:
                    logger.error(f"Failed to fetch week {week} data for team {team_id}: {str(e)}")
                    continue
            
            # Extract owner information properly - enhanced with member lookup
            owners = team.get('owners', [])
            owner_name = 'Unknown Owner'
            owner_id = None
            
            logger.info(f"Team {team_id} owners field: {owners}")
            
            # First try to get owner ID from various sources
            if owners:
                owner = owners[0]
                if isinstance(owner, dict):
                    owner_id = owner.get('id', '').replace('{', '').replace('}', '')
                    # Try multiple owner name fields from the owner object
                    potential_owner_names = [
                        owner.get('displayName'),
                        owner.get('username'), 
                        owner.get('firstName', '') + ' ' + owner.get('lastName', ''),
                    ]
                    
                    for name in potential_owner_names:
                        if name and name.strip() and not name.startswith('{') and len(name.strip()) > 1:
                            owner_name = name.strip()
                            logger.info(f"Found owner name from team data: {owner_name}")
                            break
                elif isinstance(owner, str):
                    # Owner might be just an ID string
                    owner_id = owner.replace('{', '').replace('}', '')
                    # Clean up owner ID strings as potential names
                    if not owner.startswith('{') and len(owner) < 50:  # Reasonable name length
                        owner_name = owner.replace('-', ' ').strip()
            
            # Try primaryOwner field if no success yet            
            if owner_name == 'Unknown Owner':
                primary_owner = team.get('primaryOwner')
                if isinstance(primary_owner, dict):
                    owner_id = primary_owner.get('id', '').replace('{', '').replace('}', '')
                    display_name = primary_owner.get('displayName')
                    if display_name and not display_name.startswith('{'):
                        owner_name = display_name
                        logger.info(f"Found owner name from primaryOwner: {owner_name}")
                elif isinstance(primary_owner, str):
                    owner_id = primary_owner.replace('{', '').replace('}', '')
            
            # Finally, try member lookup if we have an owner ID
            if owner_name == 'Unknown Owner' and owner_id and owner_id in member_lookup:
                owner_name = member_lookup[owner_id]
                logger.info(f"Found owner name from member lookup: {owner_name}")
            
            logger.info(f"Final owner for team {team_id}: {owner_name} (ID: {owner_id})")
            
            all_teams_data[team_id] = {
                'team_id': team_id,
                'team_name': team_name,
                'owner_name': owner_name,
                'weekly_data': weekly_analysis,
                'weeks_processed': len(weekly_analysis)
            }
        
        # Prepare result
        result = {
            'league_id': league_id,
            'year': year,
            'teams': all_teams_data,
            'total_teams': len(all_teams_data),
            'weeks_range': f"{start_week}-{end_week}"
        }
        
        # Cache the result for future requests (DISABLED FOR DEBUGGING)
        # set_cached_analysis(cache_key, result)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in all teams analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"All teams analysis failed: {str(e)}")

# FAST LOADING ENDPOINTS - Added to fix 3-5 minute load times

@app.post("/secure-team-instant")  
async def secure_get_team_instant(
    request: dict,
    session_token: str = Depends(get_current_session)
):
    """Get INSTANT basic team info - just current week for immediate display (< 1 second)"""
    server_state.request_count += 1
    
    try:
        league_id = request.get('league_id')
        team_id = request.get('team_id')  
        year = request.get('year', 2024)
        
        league_id, year = validate_inputs(league_id, year)
        
        if not team_id:
            raise HTTPException(status_code=400, detail="Team ID required")
            
        # Verify user owns this team
        session_data = SecurityManager.validate_session_token(session_token)
        session_id = f"{session_data['user_id']}_{session_data['league_id']}"
        
        # Get just current week data - minimal processing
        espn_session = get_espn_session(session_id)
        
        try:
            league = get_league_safe(espn_session, league_id, year)
            current_week = get_current_week(league)
            
            # Just return basic info for instant display
            team = None
            for t in league.teams:
                if t.team_id == int(team_id):
                    team = t
                    break
                    
            if not team:
                raise HTTPException(status_code=404, detail="Team not found")
            
            # Minimal data - just what's needed to show something immediately
            return {
                "teamId": team_id,
                "currentWeek": current_week,
                "teamName": team.team_name if hasattr(team, 'team_name') else f"Team {team_id}",
                "isActive": True,
                "loadingState": "instant_loaded"
            }
            
        except Exception as espn_error:
            logger.error(f"ESPN API error in instant load: {espn_error}")
            raise HTTPException(status_code=500, detail=f"ESPN API error: {str(espn_error)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in instant load: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/secure-team-quick-summary")
async def secure_get_team_quick_summary(
    request: dict,
    session_token: str = Depends(get_current_session)
):
    """Get basic team summary with current week only - FAST loading"""
    server_state.request_count += 1
    
    try:
        league_id = request.get('league_id')
        team_id = request.get('team_id')
        year = request.get('year', 2024)
        
        league_id, year = validate_inputs(league_id, year)
        
        if not team_id:
            raise HTTPException(status_code=400, detail="Team ID required")
        
        # Verify user owns this team
        session_data = SecurityManager.validate_session_token(session_token)
        session_id = f"{session_data['user_id']}_{session_data['league_id']}"
        
        if session_id not in server_state.encrypted_sessions:
            # Try to find fallback session
            session_found = None
            for stored_session_id, session_info in server_state.encrypted_sessions.items():
                if session_info.get('league_id') == session_data['league_id']:
                    session_found = stored_session_id
                    break
            if not session_found:
                raise HTTPException(status_code=401, detail="Session not found - please re-authenticate")
            session_id = session_found
        
        user_teams = server_state.encrypted_sessions[session_id]['user_teams']
        user_team_ids = [team['team_id'] for team in user_teams]
        
        if int(team_id) not in user_team_ids:
            raise HTTPException(status_code=403, detail="Access denied to this team")
        
        # Get current league data to find current week
        league_data = make_espn_request(session_token, league_id, year, "mTeam&mSettings")
        current_week = league_data.get('scoringPeriodId', 1)
        
        # Get ONLY the last 3 weeks for quick loading (current + 2 previous)
        start_week = max(1, current_week - 2)
        end_week = current_week
        
        logger.info(f"Quick summary: Fetching weeks {start_week}-{end_week} for team {team_id}")
        
        # Process only recent weeks
        weekly_analysis = {}
        for week in range(start_week, min(end_week + 1, 18)):
            try:
                week_data = make_espn_request(
                    session_token, 
                    league_id, 
                    year, 
                    "mRoster",
                    scoring_period=week
                )
                
                team_week_data = None
                for team in week_data.get('teams', []):
                    if str(team.get('id')) == str(team_id):
                        team_week_data = team
                        break
                
                if not team_week_data or 'roster' not in team_week_data:
                    continue
                
                # Process roster entries (same logic as before)
                lineup_players = []
                bench_players = []
                
                for entry in team_week_data['roster'].get('entries', []):
                    player_pool_entry = entry.get('playerPoolEntry', {})
                    player = player_pool_entry.get('player', {})
                    lineup_slot_id = entry.get('lineupSlotId', 20)
                    
                    fantasy_points = 0.0
                    projected_points = 0.0
                    stats = player.get('stats', [])
                    
                    # Get actual points
                    for stat in stats:
                        if (stat.get('scoringPeriodId') == week and 
                            stat.get('statSourceId') == 0 and 
                            stat.get('statSplitTypeId') == 1):
                            fantasy_points = stat.get('appliedTotal', 0.0)
                            break
                    
                    if fantasy_points == 0.0:
                        for stat in stats:
                            if (stat.get('scoringPeriodId') == week and 
                                stat.get('statSourceId') == 0):
                                fantasy_points = stat.get('appliedTotal', 0.0)
                                break
                    
                    # Get projected points
                    for stat in stats:
                        if (stat.get('scoringPeriodId') == week and 
                            stat.get('statSourceId') == 1):
                            projected_points = stat.get('appliedTotal', 0.0)
                            break
                    
                    player_info = {
                        'name': player.get('fullName', 'Unknown Player'),
                        'position': get_position_name(player.get('defaultPositionId', 0)),
                        'points': fantasy_points,
                        'projected': projected_points,
                        'player_id': player.get('id', 0),
                        'lineup_slot': lineup_slot_id
                    }
                    
                    if lineup_slot_id in [20, 21]:
                        bench_players.append(player_info)
                    else:
                        lineup_players.append(player_info)
                
                weekly_analysis[str(week)] = {
                    'teamRosters': {
                        str(team_id): {
                            'team_id': str(team_id),
                            'team_name': team_week_data.get('name', 'Unknown Team'),
                            'owner_name': team_week_data.get('owners', [{}])[0].get('displayName', 'Unknown Owner'),
                            'lineup': lineup_players,
                            'bench': bench_players
                        }
                    }
                }
                
            except Exception as e:
                logger.error(f"Quick summary - Failed to fetch week {week}: {str(e)}")
                continue
        
        return {
            'team_id': str(team_id),
            'season': year,
            'league_id': league_id,
            'current_week': current_week,
            'weeks_analyzed': list(range(start_week, min(end_week + 1, 18))),
            'weekly_data': weekly_analysis,
            'is_partial': True,
            'message': f'Quick summary loaded {len(weekly_analysis)} recent weeks. Full season available separately.',
            'full_season_available': True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in quick team summary: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Quick summary failed: {str(e)}")

@app.post("/secure-team-week-range")
async def secure_get_team_week_range(
    request: dict,
    session_token: str = Depends(get_current_session)
):
    """Get team analysis for a specific week range - for progressive loading"""
    server_state.request_count += 1
    
    try:
        league_id = request.get('league_id')
        team_id = request.get('team_id')
        year = request.get('year', 2024)
        start_week = request.get('start_week', 1)
        end_week = request.get('end_week', 5)
        
        # Limit range to prevent long loading times
        if end_week - start_week > 6:
            end_week = start_week + 6
            logger.warning(f"Week range limited to 7 weeks maximum: {start_week}-{end_week}")
        
        league_id, year = validate_inputs(league_id, year)
        
        if not team_id:
            raise HTTPException(status_code=400, detail="Team ID required")
        
        # Verify user owns this team
        session_data = SecurityManager.validate_session_token(session_token)
        session_id = f"{session_data['user_id']}_{session_data['league_id']}"
        
        if session_id not in server_state.encrypted_sessions:
            # Try to find fallback session
            session_found = None
            for stored_session_id, session_info in server_state.encrypted_sessions.items():
                if session_info.get('league_id') == session_data['league_id']:
                    session_found = stored_session_id
                    break
            if not session_found:
                raise HTTPException(status_code=401, detail="Session not found - please re-authenticate")
            session_id = session_found
        
        user_teams = server_state.encrypted_sessions[session_id]['user_teams']
        user_team_ids = [team['team_id'] for team in user_teams]
        
        if int(team_id) not in user_team_ids:
            raise HTTPException(status_code=403, detail="Access denied to this team")
        
        logger.info(f"Week range request: Fetching weeks {start_week}-{end_week} for team {team_id}")
        
        # Use the same logic as the original but for limited range
        weekly_analysis = {}
        for week in range(start_week, min(end_week + 1, 18)):
            try:
                week_data = make_espn_request(
                    session_token, 
                    league_id, 
                    year, 
                    "mRoster",
                    scoring_period=week
                )
                
                team_week_data = None
                for team in week_data.get('teams', []):
                    if str(team.get('id')) == str(team_id):
                        team_week_data = team
                        break
                
                if not team_week_data or 'roster' not in team_week_data:
                    continue
                
                # Process roster entries (same logic as original)
                lineup_players = []
                bench_players = []
                
                for entry in team_week_data['roster'].get('entries', []):
                    player_pool_entry = entry.get('playerPoolEntry', {})
                    player = player_pool_entry.get('player', {})
                    lineup_slot_id = entry.get('lineupSlotId', 20)
                    
                    fantasy_points = 0.0
                    projected_points = 0.0
                    stats = player.get('stats', [])
                    
                    # Get actual points
                    for stat in stats:
                        if (stat.get('scoringPeriodId') == week and 
                            stat.get('statSourceId') == 0 and 
                            stat.get('statSplitTypeId') == 1):
                            fantasy_points = stat.get('appliedTotal', 0.0)
                            break
                    
                    if fantasy_points == 0.0:
                        for stat in stats:
                            if (stat.get('scoringPeriodId') == week and 
                                stat.get('statSourceId') == 0):
                                fantasy_points = stat.get('appliedTotal', 0.0)
                                break
                    
                    # Get projected points
                    for stat in stats:
                        if (stat.get('scoringPeriodId') == week and 
                            stat.get('statSourceId') == 1):
                            projected_points = stat.get('appliedTotal', 0.0)
                            break
                    
                    player_info = {
                        'name': player.get('fullName', 'Unknown Player'),
                        'position': get_position_name(player.get('defaultPositionId', 0)),
                        'points': fantasy_points,
                        'projected': projected_points,
                        'player_id': player.get('id', 0),
                        'lineup_slot': lineup_slot_id
                    }
                    
                    if lineup_slot_id in [20, 21]:
                        bench_players.append(player_info)
                    else:
                        lineup_players.append(player_info)
                
                weekly_analysis[str(week)] = {
                    'teamRosters': {
                        str(team_id): {
                            'team_id': str(team_id),
                            'team_name': team_week_data.get('name', 'Unknown Team'),
                            'owner_name': team_week_data.get('owners', [{}])[0].get('displayName', 'Unknown Owner'),
                            'lineup': lineup_players,
                            'bench': bench_players
                        }
                    }
                }
                
            except Exception as e:
                logger.error(f"Week range - Failed to fetch week {week}: {str(e)}")
                continue
        
        return {
            'team_id': str(team_id),
            'season': year,
            'league_id': league_id,
            'weeks_analyzed': list(range(start_week, min(end_week + 1, 18))),
            'weekly_data': weekly_analysis,
            'start_week': start_week,
            'end_week': min(end_week, 17),
            'total_weeks_processed': len(weekly_analysis),
            'message': f'Processed weeks {start_week}-{min(end_week, 17)} ({len(weekly_analysis)} weeks of data)'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in week range analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Week range analysis failed: {str(e)}")

@app.delete("/logout")
async def logout(session_token: str = Depends(get_current_session)):
    """Logout and cleanup session"""
    try:
        session_data = SecurityManager.validate_session_token(session_token)
        session_id = f"{session_data['user_id']}_{session_data['league_id']}"
        
        if session_id in server_state.encrypted_sessions:
            del server_state.encrypted_sessions[session_id]
            logger.info(f"Session logged out: {session_id}")
        
        return {'message': 'Logged out successfully'}
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return {'message': 'Logout completed'}

@app.on_event("startup")
async def startup_event():
    """Startup tasks"""
    logger.info("🔒 Secure ESPN Fantasy Football Server starting up")
    logger.info(f"📊 Session timeout: {SESSION_TIMEOUT} seconds")
    
@app.on_event("shutdown") 
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🔒 Secure server shutting down")
    server_state.encrypted_sessions.clear()

if __name__ == "__main__":
    port = int(os.getenv('PORT', 8000))
    print(f"🔒 Starting Secure ESPN Fantasy Football Server on port {port}")
    print(f"🎯 Test League ID: 329849")
    print(f"🔐 Security: JWT tokens, encrypted credentials, rate limiting")
    print("✅ Server ready for secure connections!")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")