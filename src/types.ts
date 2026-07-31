export interface Team {
  id: string;
  name: string;
}

export interface Entry {
  seconds: number | null;
  dnp: boolean;
}

export type WeekStatus = 'open' | 'final';

export interface Week {
  id: string;
  label: string;
  date: string | null;
  status: WeekStatus;
  winner: string | null;
  entries: Record<string, Entry>;
  slack?: { posted: boolean; channel: string; message?: string; detail?: string | null };
}

export interface Progress {
  reported: number;
  total: number;
}

export interface StateView {
  teams: Team[];
  weeks: Week[];
  activeWeekId: string | null;
  progress: Progress | null;
}

export interface SlackResult {
  posted: boolean;
  channel: string;
  detail?: string | null;
  message: string;
}

export interface Finalized {
  week: Week;
  slack: SlackResult;
}

export interface FinalizeResult extends Finalized {
  view: StateView;
}

export interface EntryResponse {
  view: StateView;
  finalized: Finalized | null;
}
