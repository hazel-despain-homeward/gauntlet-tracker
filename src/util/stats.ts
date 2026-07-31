import type { Team, Week } from '../types';

export interface TeamStat {
  team: string;
  wins: number;
  played: number;
  avg: number | null;
  best: number | null;
}

export interface RecordHolder {
  team: string;
  seconds: number;
  week: string;
}

export interface Stats {
  teams: TeamStat[];
  best: RecordHolder | null;
  worst: RecordHolder | null;
  weeksCompleted: number;
}

/** Per-team wins & average time, plus best/worst single times — from finalized weeks.
 *  Teams sorted by most wins, then lowest average time. */
export function computeStats(weeks: Week[], teams: Team[]): Stats {
  type Acc = TeamStat & { sum: number };
  const map = new Map<string, Acc>();
  teams.forEach((t) => map.set(t.name, { team: t.name, wins: 0, played: 0, avg: null, best: null, sum: 0 }));

  let best: RecordHolder | null = null;
  let worst: RecordHolder | null = null;
  let weeksCompleted = 0;

  for (const w of weeks) {
    if (w.status !== 'final') continue;
    weeksCompleted++;
    for (const t of teams) {
      const e = w.entries[t.name];
      if (!e || e.dnp || e.seconds == null) continue;
      const s = map.get(t.name)!;
      s.played++;
      s.sum += e.seconds;
      if (s.best == null || e.seconds < s.best) s.best = e.seconds;
      if (!best || e.seconds < best.seconds) best = { team: t.name, seconds: e.seconds, week: w.label };
      if (!worst || e.seconds > worst.seconds) worst = { team: t.name, seconds: e.seconds, week: w.label };
    }
    if (w.winner) {
      const s = map.get(w.winner);
      if (s) s.wins++;
    }
  }

  const teamStats: TeamStat[] = [...map.values()].map((s) => ({
    team: s.team,
    wins: s.wins,
    played: s.played,
    best: s.best,
    avg: s.played ? s.sum / s.played : null,
  }));

  teamStats.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const av = a.avg == null ? Infinity : a.avg;
    const bv = b.avg == null ? Infinity : b.avg;
    return av - bv;
  });

  return { teams: teamStats, best, worst, weeksCompleted };
}
