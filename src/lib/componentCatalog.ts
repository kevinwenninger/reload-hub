import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export type CatalogComponent = Tables<'components'>;
export type ComponentType = 'bullet' | 'powder' | 'primer' | 'case';

/** Typed views over the attrs jsonb column (docs/DATA_MODEL.md). */
export interface BulletAttrs {
  caliber?: string;
  weight_mg?: number;
  weight_input?: string;
  diameter_mm?: number;
  diameter_input?: string;
  bullet_type?: string;
}
export interface PowderAttrs {
  burn_class?: string;
}
export interface PrimerAttrs {
  size?: string;
}
export interface CaseAttrs {
  caliber?: string;
}

export const BULLET_TYPES = [
  'fmj',
  'hp',
  'hpbt',
  'sp',
  'cast',
  'plated',
  'solid',
] as const;

export const PRIMER_SIZES = [
  'small_pistol',
  'small_pistol_magnum',
  'large_pistol',
  'large_pistol_magnum',
  'small_rifle',
  'small_rifle_magnum',
  'large_rifle',
  'large_rifle_magnum',
] as const;

export const PRIMER_SIZE_LABELS: Record<string, string> = {
  small_pistol: 'Small Pistol',
  small_pistol_magnum: 'Small Pistol Magnum',
  large_pistol: 'Large Pistol',
  large_pistol_magnum: 'Large Pistol Magnum',
  small_rifle: 'Small Rifle',
  small_rifle_magnum: 'Small Rifle Magnum',
  large_rifle: 'Large Rifle',
  large_rifle_magnum: 'Large Rifle Magnum',
};

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  bullet: t.catalog.typeBullet,
  powder: t.catalog.typePowder,
  primer: t.catalog.typePrimer,
  case: t.catalog.typeCase,
};

export const COMPONENT_TYPE_PLURALS: Record<ComponentType, string> = {
  bullet: t.catalog.typeBulletPlural,
  powder: t.catalog.typePowderPlural,
  primer: t.catalog.typePrimerPlural,
  case: t.catalog.typeCasePlural,
};

/** One-line attrs summary for list rows. */
export function componentSummary(component: CatalogComponent): string {
  const attrs = component.attrs as BulletAttrs &
    PowderAttrs &
    PrimerAttrs &
    CaseAttrs;
  switch (component.type as ComponentType) {
    case 'bullet':
      return [attrs.caliber, attrs.weight_input, attrs.bullet_type?.toUpperCase()]
        .filter(Boolean)
        .join(' · ');
    case 'powder':
      return attrs.burn_class ?? '';
    case 'primer':
      return attrs.size === undefined ? '' : (PRIMER_SIZE_LABELS[attrs.size] ?? '');
    case 'case':
      return attrs.caliber ?? '';
  }
}

export async function listComponents(): Promise<CatalogComponent[]> {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .order('type', { ascending: true })
    .order('manufacturer', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertComponent(
  row: TablesInsert<'components'>,
): Promise<void> {
  const { error } = await supabase.from('components').insert(row);
  if (error) throw error;
}

export async function updateComponent(
  id: string,
  patch: TablesUpdate<'components'>,
): Promise<void> {
  const { error } = await supabase.from('components').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteComponent(id: string): Promise<void> {
  const { error } = await supabase.from('components').delete().eq('id', id);
  if (error) throw error;
}
