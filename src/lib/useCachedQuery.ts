import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useIsOnline } from '@/lib/useIsOnline';

interface CachedQueryResult<T> {
  /** Cached or fresh data; null when nothing is available (render ErrorState). */
  data: T | null;
  /** True only while loading with no cached data to show. */
  loading: boolean;
  /** Set when the last fetch failed and no cache exists. */
  error: unknown;
  /** True while showing cached data that could not be revalidated yet. */
  isStale: boolean;
  refetch: () => Promise<void>;
}

/**
 * Cache-first read with stale-while-revalidate: serve AsyncStorage immediately,
 * refetch when online, never fetch while offline (isOnline guard). All reads
 * that back a screen go through this hook so the UI works offline.
 */
export function useCachedQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
): CachedQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(key !== null);
  const [error, setError] = useState<unknown>(null);
  const [isStale, setIsStale] = useState(false);
  const isOnline = useIsOnline();
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const cacheKey = key === null ? null : `cache:${key}`;

  const refetch = useCallback(async () => {
    if (cacheKey === null) return;
    try {
      const fresh = await fetcherRef.current();
      setData(fresh);
      setIsStale(false);
      setError(null);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(fresh));
    } catch (e) {
      // Keep stale data on screen; only surface the error when we have nothing.
      setError(e);
      setIsStale(true);
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cacheKey === null) {
        await Promise.resolve();
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
        return;
      }
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cancelled) return;
      setError(null);
      if (cached !== null) {
        setData(JSON.parse(cached) as T);
        setIsStale(true);
        setLoading(false);
      }
      if (isOnline) {
        await refetch();
      } else {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // isOnline is intentionally a dependency: coming back online revalidates.
  }, [cacheKey, isOnline, refetch]);

  return { data, loading, error, isStale, refetch };
}
