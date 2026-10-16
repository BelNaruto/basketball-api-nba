#!/usr/bin/env python3
"""
Championship & playoff odds from the season simulation (Python 3.8+, needs `requests`)

API:     https://rapidapi.com/belchiorarkad-FqvHs2EDOtP/api/api-basketball-nba
Support: Telegram @pintoflow

Usage:
    pip install requests
    export RAPIDAPI_KEY=your_key
    python3 title_odds.py --league nba --sims 5000 --csv title_odds.csv
"""
import argparse
import csv
import os
import sys

import requests

HOST = "api-basketball-nba.p.rapidapi.com"
KEY = os.environ.get("RAPIDAPI_KEY")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--league", default="nba", help="nba, wnba or gleague")
    ap.add_argument("--sims", type=int, default=2000, help="100-10000")
    ap.add_argument("--season", help="e.g. 2026 (the year the season ends)")
    ap.add_argument("--csv", default="title_odds.csv")
    a = ap.parse_args()
    if not KEY:
        sys.exit("Set RAPIDAPI_KEY first: export RAPIDAPI_KEY=your_key")

    params = {"league": a.league, "sims": a.sims}
    if a.season:
        params["season"] = a.season
    r = requests.get(f"https://{HOST}/v2/predictions/season", params=params,
                     headers={"x-rapidapi-host": HOST, "x-rapidapi-key": KEY}, timeout=60)
    body = r.json()
    if not r.ok or "error" in body:
        sys.exit(body.get("error", {}).get("message", f"HTTP {r.status_code}"))

    data = body["data"]
    teams = [t for t in data["teams"] if t.get("conference")]  # regular-season teams only
    teams.sort(key=lambda t: (-(t["probabilities"].get("champion") or 0), -t["projectedWins"]))

    print(f"Season {data['season']} · {data['simulations']} simulations\n")
    print(f"{'Team':<26}{'Proj W-L':>9}{'Playoffs':>10}{'Conf F':>8}{'Finals':>8}{'Title':>8}")
    rows = []
    for t in teams:
        p = t["probabilities"]
        f = lambda k: f"{(p.get(k) or 0) * 100:.1f}%"
        print(f"{t['team']['name']:<26}{t['projectedWins']:>4}-{t['projectedLosses']:<4}{f('makePlayoffs'):>10}{f('conferenceFinals'):>8}{f('finals'):>8}{f('champion'):>8}")
        rows.append({"team": t["team"]["name"], "conference": t["conference"], "record": t["currentRecord"],
                     "projectedWins": t["projectedWins"], "projectedLosses": t["projectedLosses"], **p})

    with open(a.csv, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"\nSaved {len(rows)} teams to {a.csv}")


if __name__ == "__main__":
    main()
