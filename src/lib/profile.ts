import type { TablesUpdate } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

/** Irreversible: deletes the auth user (cascades) and their storage objects. */
export async function deleteOwnAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_own_account');
  if (error) throw error;
  await supabase.auth.signOut();
}

export async function updateProfile(
  id: string,
  patch: TablesUpdate<'profiles'>,
): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) throw error;
}
