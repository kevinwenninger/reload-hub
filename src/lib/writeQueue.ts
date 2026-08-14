/**
 * Offline write queue for the range log (docs/RANGE_FLOWS.md). ONE codepath
 * for online AND offline: every range write goes through the queue; a flush
 * worker syncs whenever connectivity allows.
 *
 * - Entries persist in AsyncStorage after every mutation (crash-safe).
 * - All rows carry client-generated UUIDs → flushes are idempotent upserts;
 *   a double flush is harmless.
 * - FIFO order (parent before child: session → strings → shots). A network
 *   failure stops the flush (retry with backoff); non-retryable errors
 *   (4xx/RLS) move the entry to a visible "failed" list — never silently.
 * - Photos live in Paths.document/pending-uploads/ until uploaded to the
 *   `targets` bucket, then the session's photos array is patched.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Directory, File, Paths } from 'expo-file-system';

import type { SupabaseClient } from '@supabase/supabase-js';

import { isNetworkError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

// The queue ships opaque payloads for whatever table the entry names — the
// static Database schema adds nothing here, so use an untyped client view.
const db = supabase as unknown as SupabaseClient;

export type QueueTable = 'range_sessions' | 'shot_strings' | 'shots';

interface BaseItem {
  id: string;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export type QueueItem = BaseItem &
  (
    | { kind: 'upsert'; table: QueueTable; payload: Record<string, unknown> }
    | { kind: 'delete'; table: QueueTable; rowId: string }
    | { kind: 'photo'; sessionId: string; fileName: string; storagePath: string }
  );

const PENDING_KEY = 'writeQueue:pending:v1';
const FAILED_KEY = 'writeQueue:failed:v1';
const LAST_SYNC_KEY = 'writeQueue:lastSyncAt:v1';

export interface SyncSnapshot {
  pending: QueueItem[];
  failed: QueueItem[];
  lastSyncAt: string | null;
  flushing: boolean;
}

let pending: QueueItem[] = [];
let failed: QueueItem[] = [];
let lastSyncAt: string | null = null;
let flushing = false;
let initialized = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let snapshot: SyncSnapshot = { pending, failed, lastSyncAt, flushing };

const listeners = new Set<() => void>();

function notify() {
  snapshot = { pending: [...pending], failed: [...failed], lastSyncAt, flushing };
  for (const listener of listeners) listener();
}

async function persist() {
  await AsyncStorage.multiSet([
    [PENDING_KEY, JSON.stringify(pending)],
    [FAILED_KEY, JSON.stringify(failed)],
    [LAST_SYNC_KEY, JSON.stringify(lastSyncAt)],
  ]);
}

export async function initWriteQueue(): Promise<void> {
  if (initialized) return;
  initialized = true;
  const entries = await AsyncStorage.multiGet([PENDING_KEY, FAILED_KEY, LAST_SYNC_KEY]);
  pending = entries[0][1] ? (JSON.parse(entries[0][1]) as QueueItem[]) : [];
  failed = entries[1][1] ? (JSON.parse(entries[1][1]) as QueueItem[]) : [];
  lastSyncAt = entries[2][1] ? (JSON.parse(entries[2][1]) as string | null) : null;
  notify();
  NetInfo.addEventListener((state) => {
    if (state.isConnected === true) void flush();
  });
  void flush();
}

export function subscribeSync(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSyncSnapshot(): SyncSnapshot {
  return snapshot;
}

export function pendingUploadsDir(): Directory {
  const dir = new Directory(Paths.document, 'pending-uploads');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

export async function enqueue(
  item:
    | { kind: 'upsert'; table: QueueTable; payload: Record<string, unknown> }
    | { kind: 'delete'; table: QueueTable; rowId: string }
    | { kind: 'photo'; sessionId: string; fileName: string; storagePath: string },
  itemId: string,
): Promise<void> {
  // Re-enqueueing the same logical write (same id) replaces the older entry —
  // e.g. repeated saves of one session keep a single queue slot.
  pending = [...pending.filter((existing) => existing.id !== itemId), {
    ...item,
    id: itemId,
    createdAt: new Date().toISOString(),
    attempts: 0,
  }];
  await persist();
  notify();
  void flush();
}

async function processItem(item: QueueItem): Promise<void> {
  if (item.kind === 'upsert') {
    const { error } = await db
      .from(item.table)
      .upsert(item.payload, { onConflict: 'id' });
    if (error) throw error;
    return;
  }
  if (item.kind === 'delete') {
    const { error } = await db.from(item.table).delete().eq('id', item.rowId);
    if (error) throw error;
    return;
  }
  // photo upload
  const file = new File(pendingUploadsDir(), item.fileName);
  if (!file.exists) return; // nothing to upload (already gone) — treat as done
  const bytes = await file.bytes();
  const { error: uploadError } = await supabase.storage
    .from('targets')
    .upload(item.storagePath, bytes, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) throw uploadError;
  // Patch the session's photos array (idempotent append).
  const { data: session, error: readError } = await db
    .from('range_sessions')
    .select('photos')
    .eq('id', item.sessionId)
    .single<{ photos: string[] }>();
  if (readError) throw readError;
  if (!session.photos.includes(item.storagePath)) {
    const { error: patchError } = await db
      .from('range_sessions')
      .update({ photos: [...session.photos, item.storagePath] })
      .eq('id', item.sessionId);
    if (patchError) throw patchError;
  }
  file.delete();
}

function scheduleRetry(attempts: number) {
  if (retryTimer !== null) clearTimeout(retryTimer);
  const delay = Math.min(5000 * 2 ** attempts, 5 * 60 * 1000);
  retryTimer = setTimeout(() => void flush(), delay);
}

export async function flush(): Promise<void> {
  if (flushing || pending.length === 0) return;
  flushing = true;
  notify();
  try {
    while (pending.length > 0) {
      const item = pending[0];
      try {
        await processItem(item);
        pending = pending.slice(1);
        lastSyncAt = new Date().toISOString();
        await persist();
        notify();
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (isNetworkError(e)) {
          // Offline / flaky: keep FIFO order, back off, try again later.
          pending = [
            { ...item, attempts: item.attempts + 1, lastError: message },
            ...pending.slice(1),
          ];
          await persist();
          notify();
          scheduleRetry(item.attempts + 1);
          return;
        }
        // Non-retryable (4xx/RLS/constraint): visible in failed, never silent.
        failed = [...failed, { ...item, lastError: message }];
        pending = pending.slice(1);
        await persist();
        notify();
      }
    }
  } finally {
    flushing = false;
    notify();
  }
}

export async function retryFailed(itemId: string): Promise<void> {
  const item = failed.find((entry) => entry.id === itemId);
  if (item === undefined) return;
  failed = failed.filter((entry) => entry.id !== itemId);
  pending = [...pending, { ...item, attempts: 0, lastError: undefined }];
  await persist();
  notify();
  void flush();
}

export async function discardFailed(itemId: string): Promise<void> {
  failed = failed.filter((entry) => entry.id !== itemId);
  await persist();
  notify();
}
