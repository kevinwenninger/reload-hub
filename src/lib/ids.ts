import * as Crypto from 'expo-crypto';

/**
 * Client-generated UUIDs (offline-first convention): every insert carries its
 * id from the client so queued writes stay idempotent upserts.
 */
export function newId(): string {
  return Crypto.randomUUID();
}
