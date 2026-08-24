import type { Team, Week } from '../types';

// Weekly placement points: 1st..5th. 6th+ and DNF/DNP score 0.
export const WEEK_POINTS = [5, 4, 3, 2, 1];

export interface MonthStanding {
  team: string;
  points: number;
  gold: number; // 1st-place finishes
  silver: number; // 2nd
  bronze: number; // 3rd
  weeks: number; // weeks finished (logged a valid time) this month
}

export interface MonthData {
  key: string; // "2026-08"
  label: string; // "August 2026"
  weekCount: number; // finalized weeks in the month
  standings: MonthStanding[]; // participants only, best first
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

/** Group finalized weeks by calendar month and total placement points per team. */
export function computeMonthly(weeks: Week[], teams: Team[]): MonthData[] {
  const byMonth = new Map<string, Week[]>();
  for (const w of weeks) {
    if (w.status !== 'final' || !w.date) continue;
    const key = w.date.slice(0, 7);
    const list = byMonth.get(key);
    if (list) list.push(w);
    else byMonth.set(key, [w]);
  }

  const months: MonthData[] = [];
  for (const [key, mweeks] of byMonth) {
    const acc = new Map<string, MonthStanding>();
    teams.forEach((t) =>
      acc.set(t.name, { team: t.name, points: 0, gold: 0, silver: 0, bronze: 0, weeks: 0 }),
    );

    for (const w of mweeks) {
      const ranked = teams
        .map((t, idx) => ({ name: t.name, idx, e: w.entries[t.name] }))
        .filter((r) => r.e && !r.e.dnp && !r.e.dnf && r.e.seconds != null)
        .sort((a, b) => a.e!.seconds! - b.e!.seconds! || a.idx - b.idx);

      ranked.forEach((r, place) => {
        const s = acc.get(r.name)!;
        s.points += WEEK_POINTS[place] ?? 0;
        s.weeks += 1;
        if (place === 0) s.gold += 1;
        else if (place === 1) s.silver += 1;
        else if (place === 2) s.bronze += 1;
      });
    }

    const standings = [...acc.values()]
      .filter((s) => s.weeks > 0)
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.gold - a.gold ||
          b.silver - a.silver ||
          b.bronze - a.bronze ||
          a.team.localeCompare(b.team),
      );

    months.push({ key, label: monthLabel(key), weekCount: mweeks.length, standings });
  }

  months.sort((a, b) => b.key.localeCompare(a.key)); // newest month first
  return months;
}

/** Season-to-date: total points across every month. */
export function computeCumulative(months: MonthData[], teams: Team[]): MonthStanding[] {
  const acc = new Map<string, MonthStanding>();
  teams.forEach((t) =>
    acc.set(t.name, { team: t.name, points: 0, gold: 0, silver: 0, bronze: 0, weeks: 0 }),
  );
  for (const m of months) {
    for (const s of m.standings) {
      const a = acc.get(s.team);
      if (!a) continue;
      a.points += s.points;
      a.gold += s.gold;
      a.silver += s.silver;
      a.bronze += s.bronze;
      a.weeks += s.weeks;
    }
  }
  return [...acc.values()]
    .filter((s) => s.weeks > 0)
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.gold - a.gold ||
        b.silver - a.silver ||
        b.bronze - a.bronze ||
        a.team.localeCompare(b.team),
    );
}
