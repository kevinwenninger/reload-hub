/**
 * Cost-per-round calculation from inventory lot prices (docs/MVP_SPEC.md →
 * Phase 2). Pure functions — no I/O. All costs in the lot currency (EUR-only
 * UI in the MVP). Missing prices yield null parts; the total sums whatever is
 * known and reports which parts are missing.
 */
import { MG_PER_GRAM } from '@/lib/units';

export interface PricedLot {
  price_total: number | null;
  qty_initial: number;
}

/** Price per piece (bullet/primer/case) or per gram (powder); null if unknown. */
export function lotUnitCost(lot: PricedLot | null | undefined): number | null {
  if (!lot || lot.price_total === null || lot.qty_initial <= 0) return null;
  return lot.price_total / lot.qty_initial;
}

export interface CostInput {
  bulletLot?: PricedLot | null;
  powderLot?: PricedLot | null;
  primerLot?: PricedLot | null;
  caseLot?: PricedLot | null;
  /** Canonical charge in mg (powder lots are priced per gram). */
  chargeMg?: number | null;
  /** profiles.case_amortization_firings — case cost is spread over this. */
  caseAmortizationFirings: number;
}

export interface CostBreakdown {
  bullet: number | null;
  powder: number | null;
  primer: number | null;
  case: number | null;
  /** Sum of the known parts; null when nothing is known. */
  total: number | null;
  /** Parts without a price (missing lot, price, or charge). */
  missing: ('bullet' | 'powder' | 'primer' | 'case')[];
}

export function costPerRound(input: CostInput): CostBreakdown {
  const bullet = lotUnitCost(input.bulletLot);
  const primer = lotUnitCost(input.primerLot);

  const powderPerGram = lotUnitCost(input.powderLot);
  const powder =
    powderPerGram === null || input.chargeMg == null || input.chargeMg <= 0
      ? null
      : (input.chargeMg / MG_PER_GRAM) * powderPerGram;

  const casePerPiece = lotUnitCost(input.caseLot);
  const caseCost =
    casePerPiece === null || input.caseAmortizationFirings <= 0
      ? null
      : casePerPiece / input.caseAmortizationFirings;

  const parts = { bullet, powder, primer, case: caseCost };
  const known = Object.values(parts).filter((v): v is number => v !== null);
  return {
    ...parts,
    total: known.length === 0 ? null : known.reduce((sum, v) => sum + v, 0),
    missing: (Object.keys(parts) as (keyof typeof parts)[]).filter(
      (key) => parts[key] === null,
    ),
  };
}

/** EUR display helper (MVP shows EUR only). */
export function formatEur(value: number | null): string {
  if (value === null) return '—';
  return `€${value.toFixed(value < 1 ? 3 : 2)}`;
}
