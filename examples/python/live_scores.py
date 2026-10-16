#!/usr/bin/env python3
"""
Live basketball scoreboard in your terminal (Python 3.8+, needs `requests`)

API:     https://rapidapi.com/belchiorarkad-FqvHs2EDOtP/api/api-basketball-nba
Support: Telegram @pintoflow

Usage:
    pip install requests
    export RAPIDAPI_KEY=your_key
    python3 live_scores.py [league]      # nba (default), wnba, gleague, ncaam, ncaaw
"""
import os
import sys
import time
from datetime import datetime

import requests

HOST = "api-basketball-nba.p.rapidapi.com"
KEY = os.environ.get("RAPIDAPI_KEY")
LEAGUE = sys.argv[1] if len(sys.argv) > 1 else "nba"


def get(route, **params):
    r = requests.get(
        f"https://{HOST}{route}",
        params={"league": LEAGUE, **params},
        headers={"x-rapidapi-host": HOST, "x-rapidapi-key": KEY},
        timeout=20,
    )
    body = r.json()
    if not r.ok or "error" in body:
        raise RuntimeError(body.get("error", {}).get("message", f"HTTP {r.status_code}"))
    return body


def main():
    if not KEY:
        sys.exit("Set RAPIDAPI_KEY first: export RAPIDAPI_KEY=your_key")
    while True:
        try:
            games = get("/v2/games")["data"]  # today's games, live ones included
            os.system("cls" if os.name == "nt" else "clear")
            print(f"{LEAGUE.upper()} scoreboard · {datetime.now():%H:%M:%S}  (Ctrl+C to quit)\n")
            if not games:
                print("No games today.")
            for g in games:
                st = g["status"]
                live = "●" if st["state"] == "in" else " "
                away, home = g["away"], g["home"]
                sa = "" if away.get("score") is None else away["score"]
                sh = "" if home.get("score") is None else home["score"]
                print(f"{live} {away['abbreviation']:>5} {str(sa):>4}  @  {home['abbreviation']:<5} {str(sh):<4}  {st['shortDetail']}")
        except Exception as e:  # keep the board running through brief outages
            print(f"\n{e} – retrying…")
        time.sleep(15)  # live data refreshes about every 10 s


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
