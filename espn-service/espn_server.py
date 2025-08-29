async def get_league_info(league_id: str, year: int = 2024):
    """Get basic league information using direct API"""
    try:
        league_cache = get_league(league_id, year)
        league_data = league_cache['data']
        
        teams = []
        for team in league_data.get('teams', []):
            teams.append({
                'teamId': team.get('id'),
                'teamName': team.get('name', 'Unknown Team'),
                'ownerName': team.get('owners', [{}])[0].get('displayName', 'Unknown Owner'),
                'wins': team.get('record', {}).get('overall', {}).get('wins', 0),
                'losses': team.get('record', {}).get('overall', {}).get('losses', 0),
                'pointsFor': team.get('record', {}).get('overall', {}).get('pointsFor', 0),
                'pointsAgainst': team.get('record', {}).get('overall', {}).get('pointsAgainst', 0)
            })
        
        league_info = {
            'league_id': league_id,
            'name': league_data.get('settings', {}).get('name', f"League {league_id}"),
            'season': year,
            'size': len(teams),
            'scoring_type': 'ppr',  # Most common
            'current_week': league_data.get('scoringPeriodId', 1),
            'teams': teams
        }
        
        logger.info(f"League info retrieved via direct API: {league_info['name']} ({len(teams)} teams)")
        return json.dumps(league_info, indent=2)
        
    except Exception as e:
        error_msg = f"Error fetching league info: {str(e)}"
        logger.error(error_msg)
        return error_msg