import { describe, expect, it } from '@jest/globals';

import { isOutlier, stringStats } from '../stats';

describe('stringStats', () => {
  it('matches a hand-calculated fixed case (acceptance test 5)', () => {
    // Hand calculation: n=5, sum=4100 → avg=820; min=800, max=840 → ES=40;
    // deviations −20,−10,0,10,20 → squares 400+100+0+100+400=1000;
    // sample variance 1000/4=250 → SD=√250≈15.8114.
    const stats = stringStats([800, 810, 820, 830, 840]);
    expect(stats.n).toBe(5);
    expect(stats.avg).toBe(820);
    expect(stats.es).toBe(40);
    expect(stats.sd).toBeCloseTo(15.8114, 4);
    expect(stats.min).toBe(800);
    expect(stats.max).toBe(840);
  });

  it('handles empty and single-shot strings', () => {
    expect(stringStats([])).toEqual({
      n: 0,
      avg: null,
      es: null,
      sd: null,
      min: null,
      max: null,
    });
    const single = stringStats([850]);
    expect(single.n).toBe(1);
    expect(single.avg).toBe(850);
    expect(single.es).toBe(0);
    expect(single.sd).toBeNull();
  });

  it('is order-independent', () => {
    expect(stringStats([840, 800, 820, 830, 810])).toEqual(
      stringStats([800, 810, 820, 830, 840]),
    );
  });
});

describe('isOutlier', () => {
  it('flags deviations beyond ±10% of the running average', () => {
    expect(isOutlier(900, 800)).toBe(true); // +12.5%
    expect(isOutlier(700, 800)).toBe(true); // -12.5%
    expect(isOutlier(850, 800)).toBe(false); // +6.25%
    expect(isOutlier(800, null)).toBe(false); // first shot: no baseline
  });
});
