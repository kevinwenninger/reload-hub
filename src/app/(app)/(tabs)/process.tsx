import { EmptyState } from '@/components/EmptyState';
import { t } from '@/lib/i18n';

export default function ProcessScreen() {
  return <EmptyState title={t.tabs.process} body={t.empty.process} />;
}
