// Stable per-team accent, drawn from the HEIDI palette.
const PALETTE = ['#207C84', '#BB724E', '#374759', '#0DB0A0', '#52616F', '#C99A3F', '#8A5A44'];

export function teamColor(index: number): string {
  return PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length];
}
