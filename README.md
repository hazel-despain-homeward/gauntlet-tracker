# Gauntlet Tracker

A Homebase-branded POC for Homeward's weekly team **Gauntlet**. Each week the seven
teams log a time (or mark *Did not play*); once everyone has reported, the app picks
the winner (**lowest time wins**), locks the week, and posts a congratulations to Slack.

Built to the Homebase prototype runbook: Vite + React + TS + styled-components (v6)
frontend, a FastAPI backend under `/api`, deployable to Vercel. Branding tokens are
mirrored from the HEIDI design system in `src/design/tokens.ts`.

## Stack

- **Frontend** — Vite + React + TypeScript + styled-components v6 (transient props `$…`)
- **Backend** — FastAPI (`api/index.py`), standard-library only for Slack + storage
- **Storage** — Vercel KV / Upstash Redis (one JSON blob); falls back to a local JSON
  file when no KV env vars are set, so it runs with zero setup
- **Branding** — navy header (`BRAND_COLOR.PRIMARY`) + white Homebase logo, TAN body,
  teal CTAs, Montserrat body / Playfair Display headings

## Run locally

Two processes — the API on `:8000` and Vite on `:5173` (Vite proxies `/api` → `:8000`).

```bash
# 1. Frontend deps
npm install

# 2. Backend deps (once)
python3 -m venv .venv && . .venv/bin/activate && pip install -r api/requirements.txt

# 3. Start the API (terminal 1)
. .venv/bin/activate && cd api && uvicorn index:app --reload --port 8000

# 4. Start the web app (terminal 2)
npm run dev
```

Open http://localhost:5173. With no Slack env vars set, finalizing a week shows the
Slack message as a **preview** (nothing is posted). State persists to
`api/.local_state.json`.

## Configure Slack + storage

Copy `.env.example` → `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `SLACK_BOT_TOKEN` | Slack app token with `chat:write` (invite the bot to the channel) |
| `SLACK_CHANNEL` | Where winners are announced. Starts on `test-gauntlet-notification`; swap to the PT channel here. |
| `SLACK_WEBHOOK_URL` | Alternative to a bot token (channel fixed by the webhook) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Vercel KV / Upstash Redis. Provided automatically when you add a KV store in Vercel. |

## Deploy to Vercel

1. Push to a Git repo and import it into Vercel.
2. **Storage → Create → KV** (Upstash Redis). This injects `KV_REST_API_URL` /
   `KV_REST_API_TOKEN`. Without it, serverless state won't persist.
3. Add `SLACK_BOT_TOKEN` + `SLACK_CHANNEL` (and later, swap the channel to the real PT
   channel — one value).
4. Deploy. `vercel.json` routes `/api/*` to the FastAPI function and sends everything
   else to the SPA.

## Data model

```
state = { teams: [{id,name}], weeks: [Week] }
Week  = { id, label, date, status: 'open'|'final', winner, entries: { [teamName]: {seconds, dnp} } }
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/state` | teams, weeks, active week id, progress |
| POST | `/api/entry` | `{team, seconds, dnp}` — set a team's time for the open week |
| POST | `/api/finalize` | pick winner, post to Slack, lock the week |
| POST | `/api/week/next` | open the next week |

## Roadmap

- **v1 (this)** — enter times → auto-pick winner → post to Slack.
- **v2** — dashboard: win counts, average times, best/worst records, participation.
