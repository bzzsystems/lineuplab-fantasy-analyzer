#!/usr/bin/env python3
"""
Quick test to verify ESPN credentials work directly
"""
import requests
import sys

# Test credentials - enter your actual values here
ESPN_S2 = input("Enter ESPN_S2 cookie: ").strip()
SWID = input("Enter SWID cookie: ").strip()
LEAGUE_ID = "329849"

print(f"Testing ESPN API access...")
print(f"League ID: {LEAGUE_ID}")
print(f"SWID: {SWID}")
print(f"ESPN_S2 length: {len(ESPN_S2)}")

cookies = {
    'espn_s2': ESPN_S2,
    'SWID': SWID
}

url = f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/{LEAGUE_ID}"

try:
    response = requests.get(url, cookies=cookies, timeout=10)
    print(f"\n📡 Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        league_name = data.get('settings', {}).get('name', 'Unknown')
        print(f"✅ SUCCESS! League: {league_name}")
        print(f"Teams found: {len(data.get('teams', []))}")
    elif response.status_code == 401:
        print("❌ FAILED: 401 Unauthorized")
        print("Either cookies are expired or you don't have access to this league")
    else:
        print(f"❌ FAILED: HTTP {response.status_code}")
        print(response.text[:200])
        
except Exception as e:
    print(f"💥 ERROR: {e}")