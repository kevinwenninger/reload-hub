import { Alert } from 'react-native';

import { t } from '@/lib/i18n';

/**
 * Network failures must never be presented as domain errors
 * (e.g. "wrong credentials") — always classify first.
 */
export function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /network|fetch/i.test(message);
}

/** Offline-aware error alert — use instead of ad-hoc Alert.alert calls. */
export function showErrorAlert(error: unknown, title?: string): void {
  const body = isNetworkError(error) ? t.errors.networkAlert : t.errors.genericAlert;
  Alert.alert(title ?? t.errors.failedTitle, body);
}
