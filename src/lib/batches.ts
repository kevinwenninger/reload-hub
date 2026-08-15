import type { Tables, TablesInsert } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type LoadedBatch = Tables<'loaded_batches'>;

export async function listBatchesForVersion(
  loadVersionId: string,
): Promise<LoadedBatch[]> {
  const { data, error } = await supabase
    .from('loaded_batches')
    .select('*')
    .eq('load_version_id', loadVersionId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertBatch(row: TablesInsert<'loaded_batches'>): Promise<void> {
  const { error } = await supabase.from('loaded_batches').insert(row);
  if (error) throw error;
}

export async function deleteBatch(id: string): Promise<void> {
  const { error } = await supabase.from('loaded_batches').delete().eq('id', id);
  if (error) throw error;
}
