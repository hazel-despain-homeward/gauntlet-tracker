/** Parse "mm:ss", "m:ss", "h:mm:ss", or plain seconds -> total seconds. */
export function parseTime(input: string): number | null {
  const str = input.trim();
  if (!str) return null;
  const parts = str.split(':').map((p) => p.trim());
  if (parts.some((p) => p === '' || isNaN(Number(p)))) return null;
  const nums = parts.map(Number);
  let seconds: number;
  if (nums.length === 1) seconds = nums[0];
  else if (nums.length === 2) seconds = nums[0] * 60 + nums[1];
  else if (nums.length === 3) seconds = nums[0] * 3600 + nums[1] * 60 + nums[2];
  else return null;
  return Number.isFinite(seconds) && seconds >= 0 ? Math.round(seconds) : null;
}

/** Total seconds -> "mm:ss" (or "h:mm:ss" past an hour). */
export function formatTime(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '—';
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
