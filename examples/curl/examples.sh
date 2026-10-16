#!/usr/bin/env bash
# Basketball API (NBA, WNBA, G League, NCAA) – cURL examples
# Get your key: https://rapidapi.com/belchiorarkad-FqvHs2EDOtP/api/api-basketball-nba
# Support (fastest reply): Telegram @pintoflow
#
# Usage: RAPIDAPI_KEY=your_key bash examples.sh

set -euo pipefail
: "${RAPIDAPI_KEY:?Set RAPIDAPI_KEY first: export RAPIDAPI_KEY=your_key}"

HOST="api-basketball-nba.p.rapidapi.com"

call() {
  echo -e "\n=== GET $1 ==="
  curl -sS --get "https://${HOST}$1" "${@:2}" \
    -H "x-rapidapi-host: ${HOST}" \
    -H "x-rapidapi-key: ${RAPIDAPI_KEY}" | head -c 1200
  echo
}

call /v2/games                                                  # today's games
call /v2/games/live                                             # games in progress
call /v2/games --data-urlencode "date=20260410"                 # games on a date
call /v2/predictions                                            # today's predictions
call /v2/predictions/matchup --data-urlencode "home=13" --data-urlencode "away=2"   # Lakers vs Celtics
call /v2/predictions/season --data-urlencode "sims=2000"        # title & playoff odds
call /v2/power-rankings
call /v2/standings --data-urlencode "group=conference"
call /v2/players/search --data-urlencode "q=curry"
call /v2/players/3975/trends --data-urlencode "stat=PTS" --data-urlencode "line=26.5"
call /v2/players/3975/projection --data-urlencode "lines=PTS:26.5,3PM:4.5"
call /v2/teams/13/roster
call /v2/injuries
call /v2/games --data-urlencode "league=wnba"                   # WNBA
call /v2/games --data-urlencode "league=ncaam"                  # NCAA men
