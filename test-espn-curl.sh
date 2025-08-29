#!/bin/bash
echo "🔧 ESPN API Direct Test"
echo "======================"
echo "Enter your ESPN credentials:"
read -p "ESPN_S2 cookie: " ESPN_S2
read -p "SWID cookie: " SWID

LEAGUE_ID="329849"
URL="https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${LEAGUE_ID}"

echo ""
echo "📡 Testing ESPN API..."
echo "League ID: $LEAGUE_ID"
echo "SWID: $SWID"
echo "ESPN_S2 length: ${#ESPN_S2}"
echo ""

# Test the API call
response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -H "Cookie: espn_s2=${ESPN_S2}; SWID=${SWID}" \
  "$URL")

# Extract HTTP status and body
http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo $response | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')

echo "📊 Response Status: $http_code"

if [ "$http_code" = "200" ]; then
    echo "✅ SUCCESS! ESPN API responded successfully"
    echo "League data preview:"
    echo "$body" | head -c 200
    echo "..."
elif [ "$http_code" = "401" ]; then
    echo "❌ FAILED: 401 Unauthorized"
    echo "Your ESPN cookies are either expired or you don't have access to this league"
    echo "Response: $body"
else
    echo "❌ FAILED: HTTP $http_code"
    echo "Response: $body"
fi