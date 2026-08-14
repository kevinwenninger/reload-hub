import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Firearm = Tables<'firearms'>;
export type FirearmType = 'rifle' | 'pistol' | 'revolver';

export async function listFirearms(): Promise<Firearm[]> {
  const { data, error } = await supabase
    .from('firearms')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertFirearm(row: TablesInsert<'firearms'>): Promise<void> {
  // Client-generated id: safe to retry as an idempotent write.
  const { error } = await supabase.from('firearms').insert(row);
  if (error) throw error;
}

export async function updateFirearm(
  id: string,
  patch: TablesUpdate<'firearms'>,
): Promise<void> {
  const { error } = await supabase.from('firearms').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteFirearm(id: string): Promise<void> {
  const { error } = await supabase.from('firearms').delete().eq('id', id);
  if (error) throw error;
}
