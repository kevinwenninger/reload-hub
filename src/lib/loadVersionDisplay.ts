/** Display + cost helpers shared by version detail and compare screens. */
import type { CatalogComponent } from '@/lib/componentCatalog';
import { costPerRound, type CostBreakdown } from '@/lib/costs';
import { t } from '@/lib/i18n';
import type { InventoryLot } from '@/lib/inventory';
import type { CrimpType, LoadVersion } from '@/lib/loads';

const CRIMP_LABELS: Record<CrimpType, string> = {
  none: t.loads.crimpNone,
  roll: t.loads.crimpRoll,
  taper: t.loads.crimpTaper,
};

function componentLabel(
  components: CatalogComponent[],
  componentId: string | null,
  lots: InventoryLot[],
  lotId: string | null,
): string {
  if (componentId === null) return '—';
  const component = components.find((c) => c.id === componentId);
  if (component === undefined) return '—';
  const base = `${component.manufacturer} ${component.name}`;
  const lot = lotId === null ? undefined : lots.find((l) => l.id === lotId);
  if (lot === undefined) return base;
  return `${base} (${t.loads.lot} ${lot.lot_number ?? lot.purchase_date ?? lot.id.slice(0, 8)})`;
}

export interface VersionRow {
  label: string;
  value: string;
}

export function versionRows(
  version: LoadVersion,
  components: CatalogComponent[],
  lots: InventoryLot[],
): VersionRow[] {
  return [
    {
      label: t.loads.bullet,
      value: componentLabel(components, version.bullet_component_id, lots, version.bullet_lot_id),
    },
    {
      label: t.loads.powder,
      value: componentLabel(components, version.powder_component_id, lots, version.powder_lot_id),
    },
    {
      label: t.loads.primer,
      value: componentLabel(components, version.primer_component_id, lots, version.primer_lot_id),
    },
    {
      label: t.loads.case,
      value: componentLabel(components, version.case_component_id, lots, version.case_lot_id),
    },
    { label: t.loads.charge, value: version.charge_input ?? '—' },
    { label: t.loads.coal, value: version.coal_input ?? '—' },
    { label: t.loads.cbto, value: version.cbto_input ?? '—' },
    { label: t.loads.crimp, value: CRIMP_LABELS[version.crimp as CrimpType] },
    { label: t.loads.neckBushing, value: version.neck_bushing_input ?? '—' },
    { label: t.loads.shoulderBump, value: version.shoulder_bump_input ?? '—' },
    { label: t.loads.notes, value: version.notes ?? '—' },
  ];
}

export function costForVersion(
  version: LoadVersion,
  lots: InventoryLot[],
  caseAmortizationFirings: number,
): CostBreakdown {
  const lot = (id: string | null) =>
    id === null ? null : (lots.find((l) => l.id === id) ?? null);
  return costPerRound({
    bulletLot: lot(version.bullet_lot_id),
    powderLot: lot(version.powder_lot_id),
    primerLot: lot(version.primer_lot_id),
    caseLot: lot(version.case_lot_id),
    chargeMg: version.charge_mg,
    caseAmortizationFirings,
  });
}
