import { useSyncExternalStore } from 'react';

import {
  getSyncSnapshot,
  subscribeSync,
  type SyncSnapshot,
} from '@/lib/writeQueue';

/** Live queue state for sync badges and the sync-status screen. */
export function useSyncStatus(): SyncSnapshot {
  return useSyncExternalStore(subscribeSync, getSyncSnapshot);
}
