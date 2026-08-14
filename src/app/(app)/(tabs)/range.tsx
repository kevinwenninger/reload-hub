import { EmptyState } from '@/components/EmptyState';
import { t } from '@/lib/i18n';

export default function RangeScreen() {
  return <EmptyState title={t.tabs.range} body={t.empty.range} />;
}
