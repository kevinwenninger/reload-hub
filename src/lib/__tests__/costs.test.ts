import { describe, expect, it } from '@jest/globals';

import { costPerRound, formatEur, lotUnitCost } from '../costs';
import { massToMg } from '../units';

describe('costs', () => {
  it('computes lot unit cost', () => {
    expect(lotUnitCost({ price_total: 150, qty_initial: 500 })).toBeCloseTo(0.3);
    expect(lotUnitCost({ price_total: null, qty_initial: 500 })).toBeNull();
    expect(lotUnitCost({ price_total: 150, qty_initial: 0 })).toBeNull();
    expect(lotUnitCost(null)).toBeNull();
  });

  it('computes a full cost breakdown', () => {
    // Bullets: €150 / 500 pcs; powder: €80 / 1000 g; primers: €90 / 1000;
    // cases: €60 / 100, amortized over 10 firings. Charge uses XX.X-style
    // placeholder mass converted through units.ts (43 gr is NOT load data —
    // it is a math fixture only).
    const chargeMg = massToMg(43, 'gr'); // 2786.35313 mg
    const result = costPerRound({
      bulletLot: { price_total: 150, qty_initial: 500 },
      powderLot: { price_total: 80, qty_initial: 1000 },
      primerLot: { price_total: 90, qty_initial: 1000 },
      caseLot: { price_total: 60, qty_initial: 100 },
      chargeMg,
      caseAmortizationFirings: 10,
    });
    expect(result.bullet).toBeCloseTo(0.3, 5);
    expect(result.powder).toBeCloseTo((chargeMg / 1000) * 0.08, 5);
    expect(result.primer).toBeCloseTo(0.09, 5);
    expect(result.case).toBeCloseTo(0.06, 5);
    expect(result.total).toBeCloseTo(0.3 + (chargeMg / 1000) * 0.08 + 0.09 + 0.06, 5);
    expect(result.missing).toEqual([]);
  });

  it('reports missing parts and sums the rest', () => {
    const result = costPerRound({
      bulletLot: { price_total: 150, qty_initial: 500 },
      powderLot: { price_total: 80, qty_initial: 1000 },
      chargeMg: null, // powder price known but no charge → powder missing
      caseAmortizationFirings: 10,
    });
    expect(result.bullet).toBeCloseTo(0.3);
    expect(result.powder).toBeNull();
    expect(result.missing).toEqual(['powder', 'primer', 'case']);
    expect(result.total).toBeCloseTo(0.3);
  });

  it('returns null total when nothing is priced', () => {
    const result = costPerRound({ caseAmortizationFirings: 10 });
    expect(result.total).toBeNull();
    expect(result.missing).toHaveLength(4);
  });

  it('formats EUR with sub-euro precision', () => {
    expect(formatEur(0.523)).toBe('€0.523');
    expect(formatEur(1.5)).toBe('€1.50');
    expect(formatEur(null)).toBe('—');
  });
});
