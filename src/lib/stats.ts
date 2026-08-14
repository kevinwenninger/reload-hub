/**
 * Chrono string statistics. Velocities are canonical m/s; conversion for
 * display happens via units.ts. avg/ES/SD are always computed, never stored
 * (docs/DATA_MODEL.md — mirrored server-side by the shot_string_stats view).
 */

export interface StringStats {
  n: number;
  avg: number | null;
  /** Extreme spread: max − min. */
  es: number | null;
  /** Sample standard deviation (n−1); null below two shots. */
  sd: number | null;
  min: number | null;
  max: number | null;
}

export function stringStats(velocities: number[]): StringStats {
  const n = velocities.length;
  if (n === 0) {
    return { n: 0, avg: null, es: null, sd: null, min: null, max: null };
  }
  const min = Math.min(...velocities);
  const max = Math.max(...velocities);
  const avg = velocities.reduce((sum, v) => sum + v, 0) / n;
  let sd: number | null = null;
  if (n >= 2) {
    const sumSquares = velocities.reduce((sum, v) => sum + (v - avg) ** 2, 0);
    sd = Math.sqrt(sumSquares / (n - 1));
  }
  return { n, avg, es: max - min, sd, min, max };
}

/**
 * Typo guard for the string-entry screen (non-blocking "Check value?" hint):
 * flags a new value deviating more than ±10% from the running average.
 */
export function isOutlier(value: number, runningAvg: number | null): boolean {
  if (runningAvg === null || runningAvg <= 0) return false;
  return Math.abs(value - runningAvg) / runningAvg > 0.1;
}
