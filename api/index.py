"""Gauntlet Tracker API — single self-contained FastAPI function.

Deliberately one file with an inlined seed and standard-library-only I/O so
Vercel's Python runtime bundles it with no sibling-import or data-file surprises.
Vercel serves the ASGI `app` object below; locally: `uvicorn index:app`.

Routes are declared WITHOUT the /api prefix and mounted twice (at "" and "/api")
so the same handlers serve dev (Vite strips /api) and Vercel prod (keeps /api).
"""
import json
import os
import urllib.request
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Seed ─────────────────────────────────────────────────────────────────────
TEAMS: List[Dict[str, str]] = [
    {"id": "approve", "name": "Approve"},
    {"id": "disposition", "name": "Disposition"},
    {"id": "it", "name": "IT"},
    {"id": "mtt", "name": "MTT"},
    {"id": "new-biz", "name": "New Biz"},
    {"id": "repair-management", "name": "Repair Management"},
    {"id": "purchase", "name": "Purchase"},
    {"id": "engineering-managers", "name": "Engineering Managers"},
]


def _seed() -> Dict[str, Any]:
    def played(sec: int) -> Dict[str, Any]:
        return {"seconds": sec, "dnp": False}

    dnp = {"seconds": None, "dnp": True}
    return {
        "teams": [dict(t) for t in TEAMS],
        "weeks": [
            {
                "id": "w1", "label": "Week 1", "date": "2026-07-13", "status": "final",
                "winner": "IT",
                "slack": {"posted": False, "channel": "test-gauntlet-notification"},
                "entries": {
                    "Approve": played(762), "Disposition": played(745), "IT": played(700),
                    "MTT": played(820), "New Biz": played(758), "Repair Management": played(845),
                    "Purchase": played(705), "Engineering Managers": played(772),
                },
            },
            {
                "id": "w2", "label": "Week 2", "date": "2026-07-20", "status": "final",
                "winner": "Disposition",
                "slack": {"posted": False, "channel": "test-gauntlet-notification"},
                "entries": {
                    "Approve": played(740), "Disposition": played(690), "IT": played(731),
                    "MTT": played(798), "New Biz": played(775), "Repair Management": dict(dnp),
                    "Purchase": played(741), "Engineering Managers": played(760),
                },
            },
            {
                "id": "w3", "label": "Week 3", "date": "2026-07-27", "status": "open",
                "winner": None, "entries": {},
            },
        ],
    }


# ── Storage: Vercel KV / Upstash Redis, with a local-file fallback ───────────
STATE_KEY = "gauntlet:state"
# Local dev writes a gitignored file next to the code. On Vercel that dir is
# read-only, so fall back to /tmp (per-instance, NOT persistent across cold starts —
# set KV_REST_API_URL/TOKEN for real shared state).
LOCAL_PATH = (
    "/tmp/gauntlet_state.json"
    if os.environ.get("VERCEL")
    else os.path.join(os.path.dirname(os.path.abspath(__file__)), ".local_state.json")
)


def _kv_env() -> "tuple[Optional[str], Optional[str]]":
    url = os.environ.get("KV_REST_API_URL") or os.environ.get("UPSTASH_REDIS_REST_URL")
    token = os.environ.get("KV_REST_API_TOKEN") or os.environ.get("UPSTASH_REDIS_REST_TOKEN")
    return url, token


def _kv_command(args: List[str]) -> Dict[str, Any]:
    url, token = _kv_env()
    req = urllib.request.Request(
        url,
        data=json.dumps(args).encode("utf-8"),
        headers={"Authorization": "Bearer " + (token or ""), "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def load_state() -> Optional[Dict[str, Any]]:
    url, token = _kv_env()
    if url and token:
        raw = _kv_command(["GET", STATE_KEY]).get("result")
        return json.loads(raw) if raw else None
    if os.path.exists(LOCAL_PATH):
        with open(LOCAL_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


def save_state(state: Dict[str, Any]) -> None:
    url, token = _kv_env()
    if url and token:
        _kv_command(["SET", STATE_KEY, json.dumps(state)])
        return
    with open(LOCAL_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def get_or_seed() -> Dict[str, Any]:
    state = load_state()
    if state is None:
        state = _seed()
        save_state(state)
    return state


# ── Gauntlet rules (lowest time wins) ────────────────────────────────────────
def format_time(seconds: Optional[int]) -> str:
    if seconds is None:
        return "—"
    seconds = int(round(seconds))
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    return "{}:{:02d}:{:02d}".format(h, m, s) if h > 0 else "{}:{:02d}".format(m, s)


def entry_reported(week: Dict[str, Any], team_name: str) -> bool:
    e = week.get("entries", {}).get(team_name)
    return bool(e) and (bool(e.get("dnp")) or e.get("seconds") is not None)


def progress(week: Dict[str, Any], teams: List[Dict[str, Any]]) -> Dict[str, int]:
    reported = sum(1 for t in teams if entry_reported(week, t["name"]))
    return {"reported": reported, "total": len(teams)}


def all_reported(week: Dict[str, Any], teams: List[Dict[str, Any]]) -> bool:
    p = progress(week, teams)
    return p["total"] > 0 and p["reported"] == p["total"]


def _ranked_players(week: Dict[str, Any], teams: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    players = []
    for idx, t in enumerate(teams):
        e = week.get("entries", {}).get(t["name"])
        if e and not e.get("dnp") and e.get("seconds") is not None:
            players.append({"team": t["name"], "seconds": int(e["seconds"]), "order": idx})
    players.sort(key=lambda r: (r["seconds"], r["order"]))
    return players


def compute_winner(week: Dict[str, Any], teams: List[Dict[str, Any]]) -> Optional[str]:
    ranked = _ranked_players(week, teams)
    return ranked[0]["team"] if ranked else None


def build_slack_message(week: Dict[str, Any], teams: List[Dict[str, Any]], winner: str) -> str:
    ranked = _ranked_players(week, teams)
    medals = ["🥇", "🥈", "🥉"]
    lines = [
        "{} {}: {}".format(medals[i] if i < len(medals) else "  •", r["team"], format_time(r["seconds"]))
        for i, r in enumerate(ranked)
    ]
    for t in teams:
        if (week.get("entries", {}).get(t["name"]) or {}).get("dnp"):
            lines.append("  • {}: Did not play".format(t["name"]))
    win_time = format_time(week["entries"][winner]["seconds"])
    return (
        "🏆 *Gauntlet {label} results are in!*\n\n"
        "Congratulations to *{winner}* for the fastest time of the week at *{time}*! 👏\n\n"
        "{board}"
    ).format(label=week["label"], winner=winner, time=win_time, board="\n".join(lines))


# ── Slack posting (stdlib only) ──────────────────────────────────────────────
def slack_post(text: str) -> Dict[str, Any]:
    token = os.environ.get("SLACK_BOT_TOKEN")
    channel = os.environ.get("SLACK_CHANNEL", "test-gauntlet-notification")
    webhook = os.environ.get("SLACK_WEBHOOK_URL")

    if token:
        try:
            req = urllib.request.Request(
                "https://slack.com/api/chat.postMessage",
                data=json.dumps({"channel": channel, "text": text}).encode("utf-8"),
                headers={"Authorization": "Bearer " + token, "Content-Type": "application/json; charset=utf-8"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                res = json.loads(resp.read().decode("utf-8"))
            return {"posted": bool(res.get("ok")), "channel": channel, "detail": res.get("error"), "message": text}
        except Exception as exc:
            return {"posted": False, "channel": channel, "detail": str(exc), "message": text}

    if webhook:
        try:
            req = urllib.request.Request(
                webhook, data=json.dumps({"text": text}).encode("utf-8"),
                headers={"Content-Type": "application/json"}, method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp.read()
            return {"posted": True, "channel": channel, "detail": None, "message": text}
        except Exception as exc:
            return {"posted": False, "channel": channel, "detail": str(exc), "message": text}

    return {"posted": False, "channel": channel, "detail": "no_slack_credentials", "message": text}


# ── API ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="Gauntlet Tracker")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
router = APIRouter()


class EntryIn(BaseModel):
    team: str
    seconds: Optional[int] = None
    dnp: bool = False


def _active_week(state: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    for w in state["weeks"]:
        if w["status"] == "open":
            return w
    return None


def _view(state: Dict[str, Any]) -> Dict[str, Any]:
    active = _active_week(state)
    return {
        "teams": state["teams"],
        "weeks": state["weeks"],
        "activeWeekId": active["id"] if active else None,
        "progress": progress(active, state["teams"]) if active else None,
    }


def _finalize_week(state: Dict[str, Any], week: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    winner = compute_winner(week, state["teams"])
    if winner is None:
        return None
    week["winner"] = winner
    week["status"] = "final"
    message = build_slack_message(week, state["teams"], winner)
    result = slack_post(message)
    week["slack"] = {
        "posted": result["posted"], "channel": result["channel"],
        "message": message, "detail": result.get("detail"),
    }
    return {"week": week, "slack": result}


@router.get("/health")
def health() -> Dict[str, bool]:
    return {"ok": True}


@router.get("/state")
def get_state() -> Dict[str, Any]:
    return _view(get_or_seed())


@router.post("/entry")
def set_entry(body: EntryIn) -> Dict[str, Any]:
    state = get_or_seed()
    week = _active_week(state)
    if week is None:
        raise HTTPException(status_code=409, detail="No open week. Start a new week first.")
    if not any(t["name"] == body.team for t in state["teams"]):
        raise HTTPException(status_code=404, detail="Unknown team: " + body.team)

    if body.dnp:
        week["entries"][body.team] = {"seconds": None, "dnp": True}
    elif body.seconds is not None and body.seconds >= 0:
        week["entries"][body.team] = {"seconds": int(body.seconds), "dnp": False}
    else:
        week["entries"].pop(body.team, None)

    finalized = _finalize_week(state, week) if all_reported(week, state["teams"]) else None
    save_state(state)
    return {"view": _view(state), "finalized": finalized}


@router.post("/finalize")
def finalize() -> Dict[str, Any]:
    state = get_or_seed()
    week = _active_week(state)
    if week is None:
        raise HTTPException(status_code=409, detail="No open week to finalize.")
    if not all_reported(week, state["teams"]):
        raise HTTPException(status_code=409, detail="Not every team has reported yet.")
    finalized = _finalize_week(state, week)
    if finalized is None:
        raise HTTPException(status_code=409, detail="No team logged a time — nobody to crown.")
    save_state(state)
    return {**finalized, "view": _view(state)}


@router.get("/cron/auto-finalize")
def cron_auto_finalize() -> Dict[str, Any]:
    """Ran by Vercel Cron. At/after 1 PM America/Chicago, mark any team that hasn't
    reported as DNP, then finalize the open week (crowning a winner + posting to Slack).
    Scheduled at both 18:00 and 19:00 UTC so it lands at 1 PM Central in CDT and CST;
    the guard below ensures it only acts at/after 1 PM local either way."""
    try:
        from datetime import datetime
        from zoneinfo import ZoneInfo

        central = datetime.now(ZoneInfo("America/Chicago"))
        if central.hour < 13:
            return {"status": "skipped", "reason": "before 1pm central", "central_hour": central.hour}
    except Exception:
        pass  # if tz data is unavailable, don't block the finalize

    state = get_or_seed()
    week = _active_week(state)
    if week is None:
        return {"status": "skipped", "reason": "no open week"}

    teams = state["teams"]
    has_real_time = any(
        (week["entries"].get(t["name"]) or {}).get("seconds") is not None
        and not (week["entries"].get(t["name"]) or {}).get("dnp")
        for t in teams
    )
    if not has_real_time:
        return {"status": "skipped", "reason": "no times logged — nobody to crown"}

    auto_dnp = []
    for t in teams:
        if not entry_reported(week, t["name"]):
            week["entries"][t["name"]] = {"seconds": None, "dnp": True}
            auto_dnp.append(t["name"])

    finalized = _finalize_week(state, week)
    save_state(state)
    return {
        "status": "finalized",
        "week": week["label"],
        "winner": week["winner"],
        "auto_dnp": auto_dnp,
        "slack_posted": bool(finalized and finalized["slack"]["posted"]),
    }


@router.post("/reset")
def reset_season() -> Dict[str, Any]:
    """Wipe all weeks/times/winners and start over at a fresh, empty Week 1."""
    from datetime import date

    state = {
        "teams": [dict(t) for t in TEAMS],
        "weeks": [
            {
                "id": "w1",
                "label": "Week 1",
                "date": date.today().isoformat(),
                "status": "open",
                "winner": None,
                "entries": {},
            }
        ],
    }
    save_state(state)
    return _view(state)


@router.post("/week/next")
def next_week() -> Dict[str, Any]:
    state = get_or_seed()
    if _active_week(state) is not None:
        return _view(state)
    finals = [w for w in state["weeks"] if w["status"] == "final"]
    n = len(state["weeks"]) + 1
    state["weeks"].append({
        "id": "w{}".format(n), "label": "Week {}".format(n),
        "date": _next_date(finals[-1]["date"]) if finals else None,
        "status": "open", "winner": None, "entries": {},
    })
    save_state(state)
    return _view(state)


def _next_date(prev: Optional[str]) -> Optional[str]:
    if not prev:
        return None
    try:
        from datetime import date, timedelta
        y, m, d = (int(x) for x in prev.split("-"))
        return (date(y, m, d) + timedelta(days=7)).isoformat()
    except Exception:
        return None


# Serve the same routes with and without the /api prefix.
app.include_router(router)
app.include_router(router, prefix="/api")
