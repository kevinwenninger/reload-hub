import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * Connectivity hook backed by a NetInfo listener. `null` while unknown
 * (first frame) — treat as online to avoid flashing offline UI on launch.
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    return unsubscribe;
  }, []);

  return isOnline !== false;
}
