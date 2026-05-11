export const LEVEL_THRESHOLDS = [0, 26, 101, 251] as const;
export type Level = 1 | 2 | 3 | 4;

export function levelFor(successes: number): Level {
  if (successes >= 251) return 4;
  if (successes >= 101) return 3;
  if (successes >= 26) return 2;
  return 1;
}

export function nextLevelThreshold(successes: number): number {
  if (successes >= 251) return 251;
  if (successes >= 101) return 251;
  if (successes >= 26) return 101;
  return 26;
}

export function accuracy(successes: number, attempted: number): number {
  return attempted === 0 ? 0 : successes / attempted;
}
