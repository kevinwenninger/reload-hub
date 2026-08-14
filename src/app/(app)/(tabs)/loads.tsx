import { EmptyState } from '@/components/EmptyState';
import { t } from '@/lib/i18n';

export default function LoadsScreen() {
  return <EmptyState title={t.tabs.loads} body={t.empty.loads} />;
}
