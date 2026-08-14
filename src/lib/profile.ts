import type { TablesUpdate } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export async function updateProfile(
  id: string,
  patch: TablesUpdate<'profiles'>,
): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) throw error;
}
