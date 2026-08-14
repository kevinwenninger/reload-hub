import type { ComponentType } from '@/lib/componentCatalog';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type InventoryLot = Tables<'inventory_lots'>;
export type LotUnit = 'pieces' | 'g';

/** Purely local low-stock hints (no push in the MVP). */
export const LOW_STOCK_PIECES = 100;
export const LOW_STOCK_POWDER_G = 100;

export function lotUnitForType(type: ComponentType): LotUnit {
  return type === 'powder' ? 'g' : 'pieces';
}

export interface Stock {
  remaining: number;
  unit: LotUnit;
  low: boolean;
}

/** Aggregates non-archived lots of one component. */
export function stockForComponent(
  lots: InventoryLot[],
  componentId: string,
  type: ComponentType,
): Stock {
  const unit = lotUnitForType(type);
  const remaining = lots
    .filter((lot) => lot.component_id === componentId && !lot.archived)
    .reduce((sum, lot) => sum + lot.qty_remaining, 0);
  const threshold = unit === 'g' ? LOW_STOCK_POWDER_G : LOW_STOCK_PIECES;
  return { remaining, unit, low: remaining < threshold };
}

export async function listLots(): Promise<InventoryLot[]> {
  const { data, error } = await supabase
    .from('inventory_lots')
    .select('*')
    .order('purchase_date', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function listLotsForComponent(
  componentId: string,
): Promise<InventoryLot[]> {
  const { data, error } = await supabase
    .from('inventory_lots')
    .select('*')
    .eq('component_id', componentId)
    .order('purchase_date', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function insertLot(row: TablesInsert<'inventory_lots'>): Promise<void> {
  const { error } = await supabase.from('inventory_lots').insert(row);
  if (error) throw error;
}

export async function updateLot(
  id: string,
  patch: TablesUpdate<'inventory_lots'>,
): Promise<void> {
  const { error } = await supabase
    .from('inventory_lots')
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteLot(id: string): Promise<void> {
  const { error } = await supabase.from('inventory_lots').delete().eq('id', id);
  if (error) throw error;
}
