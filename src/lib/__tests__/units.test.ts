import { describe, expect, it } from '@jest/globals';

import {
  MG_PER_GRAIN,
  UNIT_PRESETS,
  cToTemperature,
  distanceToM,
  formatMass,
  formatVelocity,
  lengthToMm,
  makeInput,
  massToMg,
  mgToMass,
  mmToLength,
  mpsToVelocity,
  mToDistance,
  parseDecimal,
  temperatureToC,
  velocityToMps,
} from '../units';

describe('units', () => {
  it('converts grains to mg with the exact constant', () => {
    expect(massToMg(1, 'gr')).toBeCloseTo(64.79891, 5);
    expect(massToMg(42.5, 'gr')).toBeCloseTo(42.5 * MG_PER_GRAIN, 5);
  });

  it('roundtrips grains ↔ mg without drift', () => {
    for (const gr of [0.1, 2.8, 24.7, 42.5, 168, 250]) {
      expect(mgToMass(massToMg(gr, 'gr'), 'gr')).toBeCloseTo(gr, 10);
    }
  });

  it('roundtrips grams ↔ mg', () => {
    expect(mgToMass(massToMg(3.24, 'g'), 'g')).toBeCloseTo(3.24, 10);
  });

  it('converts inches ↔ mm', () => {
    expect(lengthToMm(1, 'in')).toBeCloseTo(25.4, 10);
    expect(mmToLength(71.12, 'in')).toBeCloseTo(2.8, 10);
    expect(lengthToMm(71.12, 'mm')).toBe(71.12);
  });

  it('converts fps ↔ m/s', () => {
    expect(velocityToMps(1000, 'fps')).toBeCloseTo(304.8, 10);
    expect(mpsToVelocity(304.8, 'fps')).toBeCloseTo(1000, 10);
    expect(velocityToMps(800, 'mps')).toBe(800);
  });

  it('converts yards ↔ m', () => {
    expect(distanceToM(100, 'yd')).toBeCloseTo(91.44, 10);
    expect(mToDistance(91.44, 'yd')).toBeCloseTo(100, 10);
  });

  it('converts °F ↔ °C', () => {
    expect(temperatureToC(32, 'f')).toBeCloseTo(0, 10);
    expect(temperatureToC(212, 'f')).toBeCloseTo(100, 10);
    expect(cToTemperature(20, 'f')).toBeCloseTo(68, 10);
    expect(cToTemperature(20, 'c')).toBe(20);
  });

  it('formats via canonical values', () => {
    expect(formatMass(massToMg(42.5, 'gr'), 'gr')).toBe('42.5 gr');
    expect(formatVelocity(304.8, 'fps')).toBe('1000 fps');
  });

  it('parses decimals with comma or dot', () => {
    expect(parseDecimal('42,5')).toBe(42.5);
    expect(parseDecimal('42.5')).toBe(42.5);
    expect(parseDecimal(' 168 ')).toBe(168);
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('1.2.3')).toBeNull();
  });

  it('builds raw input strings', () => {
    expect(makeInput(42.5, 'gr')).toBe('42.5 gr');
    expect(makeInput('2.800', 'in')).toBe('2.800 in');
  });

  it('presets are complete', () => {
    expect(UNIT_PRESETS.metric_mixed.mass).toBe('gr');
    expect(UNIT_PRESETS.us.length).toBe('in');
    expect(UNIT_PRESETS.metric.mass).toBe('g');
  });
});
