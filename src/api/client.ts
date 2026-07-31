import type { StateView, FinalizeResult, EntryResponse } from '../types';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getState: () => request<StateView>('/state'),
  setEntry: (team: string, seconds: number | null, dnp: boolean) =>
    request<EntryResponse>('/entry', {
      method: 'POST',
      body: JSON.stringify({ team, seconds, dnp }),
    }),
  finalize: () => request<FinalizeResult>('/finalize', { method: 'POST' }),
  nextWeek: () => request<StateView>('/week/next', { method: 'POST' }),
};
