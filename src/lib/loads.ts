import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Load = Tables<'loads'>;
export type LoadVersion = Tables<'load_versions'>;
export type LoadStatus = 'development' | 'proven' | 'retired';
export type CrimpType = 'none' | 'roll' | 'taper';

export async function listLoads(): Promise<Load[]> {
  const { data, error } = await supabase
    .from('loads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertLoad(row: TablesInsert<'loads'>): Promise<void> {
  const { error } = await supabase.from('loads').insert(row);
  if (error) throw error;
}

export async function updateLoad(
  id: string,
  patch: TablesUpdate<'loads'>,
): Promise<void> {
  const { error } = await supabase.from('loads').update(patch).eq('id', id);
  if (error) throw error;
}

/** Favorite = the sweet spot; setting one also marks the load as proven. */
export async function setFavoriteVersion(
  loadId: string,
  versionId: string | null,
): Promise<void> {
  const patch: TablesUpdate<'loads'> = { favorite_version_id: versionId };
  if (versionId !== null) patch.status = 'proven';
  const { error } = await supabase.from('loads').update(patch).eq('id', loadId);
  if (error) throw error;
}

export async function deleteLoad(id: string): Promise<void> {
  const { error } = await supabase.from('loads').delete().eq('id', id);
  if (error) throw error;
}

export async function listAllVersions(): Promise<LoadVersion[]> {
  const { data, error } = await supabase
    .from('load_versions')
    .select('*')
    .order('version_no', { ascending: false });
  if (error) throw error;
  return data;
}

/** Versions referencing a component in any of the four component slots. */
export async function listVersionsUsingComponent(
  componentId: string,
): Promise<LoadVersion[]> {
  const { data, error } = await supabase
    .from('load_versions')
    .select('*')
    .or(
      [
        `bullet_component_id.eq.${componentId}`,
        `powder_component_id.eq.${componentId}`,
        `primer_component_id.eq.${componentId}`,
        `case_component_id.eq.${componentId}`,
      ].join(','),
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function listVersions(loadId: string): Promise<LoadVersion[]> {
  const { data, error } = await supabase
    .from('load_versions')
    .select('*')
    .eq('load_id', loadId)
    .order('version_no', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertVersion(
  row: TablesInsert<'load_versions'>,
): Promise<void> {
  const { error } = await supabase.from('load_versions').insert(row);
  if (error) throw error;
}

export async function updateVersion(
  id: string,
  patch: TablesUpdate<'load_versions'>,
): Promise<void> {
  const { error } = await supabase
    .from('load_versions')
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteVersion(id: string): Promise<void> {
  const { error } = await supabase.from('load_versions').delete().eq('id', id);
  if (error) throw error;
}
