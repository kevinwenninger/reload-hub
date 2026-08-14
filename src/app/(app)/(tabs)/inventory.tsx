import { EmptyState } from '@/components/EmptyState';
import { t } from '@/lib/i18n';

export default function InventoryScreen() {
  return <EmptyState title={t.tabs.inventory} body={t.empty.inventory} />;
}
