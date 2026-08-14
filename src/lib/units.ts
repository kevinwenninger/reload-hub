/**
 * Central unit conversion. All measurable values are stored canonically:
 * mass in mg, length in mm, velocity in m/s, distance in m, temperature in °C.
 * Alongside each canonical column the raw user input is stored as text
 * (e.g. "42.5 gr") so display never drifts through conversion rounding.
 *
 * Never convert or format units anywhere else in the app.
 */

export const MG_PER_GRAIN = 64.79891;
export const MG_PER_GRAM = 1000;
export const MM_PER_INCH = 25.4;
export const MPS_PER_FPS = 0.3048;
export const M_PER_YARD = 0.9144;

export type MassUnit = 'gr' | 'g';
export type LengthUnit = 'mm' | 'in';
export type VelocityUnit = 'mps' | 'fps';
export type DistanceUnit = 'm' | 'yd';
export type TemperatureUnit = 'c' | 'f';

export interface UnitPrefs {
  mass: MassUnit;
  length: LengthUnit;
  velocity: VelocityUnit;
  distance: DistanceUnit;
  temperature: TemperatureUnit;
}

export const UNIT_PRESETS: Record<'metric_mixed' | 'us' | 'metric', UnitPrefs> =
  {
    // Common European handloader mix: charge in grains, OAL in mm, chrono in m/s.
    metric_mixed: {
      mass: 'gr',
      length: 'mm',
      velocity: 'mps',
      distance: 'm',
      temperature: 'c',
    },
    us: {
      mass: 'gr',
      length: 'in',
      velocity: 'fps',
      distance: 'yd',
      temperature: 'f',
    },
    metric: {
      mass: 'g',
      length: 'mm',
      velocity: 'mps',
      distance: 'm',
      temperature: 'c',
    },
  };

// --- to canonical ---

export function massToMg(value: number, unit: MassUnit): number {
  return unit === 'gr' ? value * MG_PER_GRAIN : value * MG_PER_GRAM;
}

export function lengthToMm(value: number, unit: LengthUnit): number {
  return unit === 'in' ? value * MM_PER_INCH : value;
}

export function velocityToMps(value: number, unit: VelocityUnit): number {
  return unit === 'fps' ? value * MPS_PER_FPS : value;
}

export function distanceToM(value: number, unit: DistanceUnit): number {
  return unit === 'yd' ? value * M_PER_YARD : value;
}

export function temperatureToC(value: number, unit: TemperatureUnit): number {
  return unit === 'f' ? ((value - 32) * 5) / 9 : value;
}

// --- from canonical ---

export function mgToMass(mg: number, unit: MassUnit): number {
  return unit === 'gr' ? mg / MG_PER_GRAIN : mg / MG_PER_GRAM;
}

export function mmToLength(mm: number, unit: LengthUnit): number {
  return unit === 'in' ? mm / MM_PER_INCH : mm;
}

export function mpsToVelocity(mps: number, unit: VelocityUnit): number {
  return unit === 'fps' ? mps / MPS_PER_FPS : mps;
}

export function mToDistance(m: number, unit: DistanceUnit): number {
  return unit === 'yd' ? m / M_PER_YARD : m;
}

export function cToTemperature(c: number, unit: TemperatureUnit): number {
  return unit === 'f' ? (c * 9) / 5 + 32 : c;
}

// --- display ---

export const UNIT_LABELS: Record<
  MassUnit | LengthUnit | VelocityUnit | DistanceUnit | TemperatureUnit,
  string
> = {
  gr: 'gr',
  g: 'g',
  mm: 'mm',
  in: 'in',
  mps: 'm/s',
  fps: 'fps',
  m: 'm',
  yd: 'yd',
  c: '°C',
  f: '°F',
};

const DEFAULT_DECIMALS: Record<string, number> = {
  gr: 1,
  g: 3,
  mm: 2,
  in: 3,
  mps: 0,
  fps: 0,
  m: 0,
  yd: 0,
  c: 0,
  f: 0,
};

function formatValue(value: number, unit: string, decimals?: number): string {
  const d = decimals ?? DEFAULT_DECIMALS[unit] ?? 1;
  return `${value.toFixed(d)} ${UNIT_LABELS[unit as keyof typeof UNIT_LABELS]}`;
}

export function formatMass(
  mg: number,
  unit: MassUnit,
  decimals?: number,
): string {
  return formatValue(mgToMass(mg, unit), unit, decimals);
}

export function formatLength(
  mm: number,
  unit: LengthUnit,
  decimals?: number,
): string {
  return formatValue(mmToLength(mm, unit), unit, decimals);
}

export function formatVelocity(
  mps: number,
  unit: VelocityUnit,
  decimals?: number,
): string {
  return formatValue(mpsToVelocity(mps, unit), unit, decimals);
}

export function formatDistance(
  m: number,
  unit: DistanceUnit,
  decimals?: number,
): string {
  return formatValue(mToDistance(m, unit), unit, decimals);
}

export function formatTemperature(
  c: number,
  unit: TemperatureUnit,
  decimals?: number,
): string {
  return formatValue(cToTemperature(c, unit), unit, decimals);
}

/**
 * Parses user-typed decimal input; accepts both comma and dot separators
 * ("42,5" and "42.5"). Returns null for empty/invalid input.
 */
export function parseDecimal(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '') return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/**
 * Builds the raw-input sister value stored next to every canonical column,
 * e.g. makeInput(42.5, 'gr') → "42.5 gr".
 */
export function makeInput(value: number | string, unit: keyof typeof UNIT_LABELS): string {
  return `${value} ${UNIT_LABELS[unit]}`;
}
