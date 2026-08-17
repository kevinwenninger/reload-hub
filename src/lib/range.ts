/**
 * Range-log data layer. Offline is the normal case (docs/RANGE_FLOWS.md):
 * every write goes cache-first (AsyncStorage echo for instant offline reads)
 * and then through the write queue — one codepath, online or offline.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { enqueue } from '@/lib/writeQueue';

export type RangeSession = Tables<'range_sessions'>;
export type ShotString = Tables<'shot_strings'>;
export type Shot = Tables<'shots'>;

export const PRESSURE_FLAGS = [
  'heavy_bolt_lift',
  'flattened_primer',
  'ejector_mark',
  'sticky_extraction',
  'case_head_expansion',
] as const;

const SESSION_KEY = (id: string) => `range:session:${id}`;
const STRINGS_KEY = (sessionId: string) => `range:strings:${sessionId}`;
const SHOTS_KEY = (stringId: string) => `range:shots:${stringId}`;
const LOCAL_SESSIONS_KEY = 'range:localSessionIds';
const LAST_SETUP_KEY = 'range:lastSetup';

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw === null ? null : (JSON.parse(raw) as T);
}

// ------------------------------------------------------------------ sessions

export interface LastSetup {
  firearm_id: string;
  load_version_id: string | null;
  ammo_note: string | null;
  location: string | null;
  distance_m: number | null;
  distance_input: string | null;
}

export async function getLastSetup(): Promise<LastSetup | null> {
  return readJson<LastSetup>(LAST_SETUP_KEY);
}

/** Cache-first session save + queue upsert (itemId = row id → collapses). */
export async function saveSession(session: RangeSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY(session.id), JSON.stringify(session));
  const ids = (await readJson<string[]>(LOCAL_SESSIONS_KEY)) ?? [];
  if (!ids.includes(session.id)) {
    await AsyncStorage.setItem(
      LOCAL_SESSIONS_KEY,
      JSON.stringify([session.id, ...ids].slice(0, 50)),
    );
  }
  await AsyncStorage.setItem(
    LAST_SETUP_KEY,
    JSON.stringify({
      firearm_id: session.firearm_id,
      load_version_id: session.load_version_id,
      ammo_note: session.ammo_note,
      location: session.location,
      distance_m: session.distance_m,
      distance_input: session.distance_input,
    } satisfies LastSetup),
  );
  // Strip null-ish server-managed fields is unnecessary — upsert sends all.
  await enqueue(
    { kind: 'upsert', table: 'range_sessions', payload: session },
    `session-${session.id}`,
  );
}

export async function getSessionLocal(id: string): Promise<RangeSession | null> {
  const cached = await readJson<RangeSession>(SESSION_KEY(id));
  if (cached !== null) return cached;
  const { data, error } = await supabase
    .from('range_sessions')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  await AsyncStorage.setItem(SESSION_KEY(id), JSON.stringify(data));
  return data;
}

/** Server sessions merged with locally created ones the server may lack. */
export async function listSessionsMerged(): Promise<RangeSession[]> {
  let server: RangeSession[] = [];
  try {
    const { data, error } = await supabase
      .from('range_sessions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    server = data;
  } catch {
    // offline — fall back to local echoes only
  }
  const localIds = (await readJson<string[]>(LOCAL_SESSIONS_KEY)) ?? [];
  const serverIds = new Set(server.map((s) => s.id));
  const localOnly: RangeSession[] = [];
  for (const id of localIds) {
    if (serverIds.has(id)) continue;
    const cached = await readJson<RangeSession>(SESSION_KEY(id));
    if (cached !== null) localOnly.push(cached);
  }
  return [...localOnly, ...server];
}

/** Sessions that tested a given load version (server; used for range results). */
export async function listSessionsForVersion(
  loadVersionId: string,
): Promise<RangeSession[]> {
  const { data, error } = await supabase
    .from('range_sessions')
    .select('*')
    .eq('load_version_id', loadVersionId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

/** Signed URLs for a session's target photos (private bucket, 1h). */
export async function signedPhotoUrls(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];
  const { data, error } = await supabase.storage
    .from('targets')
    .createSignedUrls(paths, 60 * 60);
  if (error) throw error;
  return data
    .map((entry) => entry.signedUrl)
    .filter((url): url is string => typeof url === 'string' && url.length > 0);
}

/** A session counts as finished once it has been rated (R5 was completed). */
export function isSessionFinished(session: RangeSession): boolean {
  return session.rating !== null;
}

// ------------------------------------------------------------------- strings

export async function listStringsLocal(sessionId: string): Promise<ShotString[]> {
  const cached = await readJson<ShotString[]>(STRINGS_KEY(sessionId));
  if (cached !== null) return cached;
  try {
    const { data, error } = await supabase
      .from('shot_strings')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    await AsyncStorage.setItem(STRINGS_KEY(sessionId), JSON.stringify(data));
    return data;
  } catch {
    return [];
  }
}

export async function saveString(string: ShotString): Promise<void> {
  const existing = await listStringsLocal(string.session_id);
  const merged = [
    ...existing.filter((entry) => entry.id !== string.id),
    string,
  ].sort((a, b) => a.created_at.localeCompare(b.created_at));
  await AsyncStorage.setItem(STRINGS_KEY(string.session_id), JSON.stringify(merged));
  await enqueue(
    { kind: 'upsert', table: 'shot_strings', payload: string },
    `string-${string.id}`,
  );
}

// --------------------------------------------------------------------- shots

export async function listShotsLocal(stringId: string): Promise<Shot[]> {
  const cached = await readJson<Shot[]>(SHOTS_KEY(stringId));
  if (cached !== null) return cached;
  try {
    const { data, error } = await supabase
      .from('shots')
      .select('*')
      .eq('string_id', stringId)
      .order('seq', { ascending: true });
    if (error) throw error;
    await AsyncStorage.setItem(SHOTS_KEY(stringId), JSON.stringify(data));
    return data;
  } catch {
    return [];
  }
}

export async function saveShot(shot: Shot): Promise<void> {
  const existing = await listShotsLocal(shot.string_id);
  const merged = [...existing.filter((entry) => entry.id !== shot.id), shot].sort(
    (a, b) => a.seq - b.seq,
  );
  await AsyncStorage.setItem(SHOTS_KEY(shot.string_id), JSON.stringify(merged));
  await enqueue({ kind: 'upsert', table: 'shots', payload: shot }, `shot-${shot.id}`);
}

export async function deleteShot(shot: Shot): Promise<void> {
  const existing = await listShotsLocal(shot.string_id);
  await AsyncStorage.setItem(
    SHOTS_KEY(shot.string_id),
    JSON.stringify(existing.filter((entry) => entry.id !== shot.id)),
  );
  await enqueue(
    { kind: 'delete', table: 'shots', rowId: shot.id },
    `del-shot-${shot.id}`,
  );
}
