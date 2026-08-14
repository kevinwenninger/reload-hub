import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { SelectField } from '@/components/SelectField';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { listComponents } from '@/lib/componentCatalog';
import { formatEur } from '@/lib/costs';
import { t } from '@/lib/i18n';
import { listLots } from '@/lib/inventory';
import { listVersions } from '@/lib/loads';
import { costForVersion, versionRows } from '@/lib/loadVersionDisplay';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

export default function CompareVersions() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const isOnline = useIsOnline();

  const versions = useCachedQuery(`versions:${id}`, () => listVersions(id));
  const components = useCachedQuery('components', listComponents);
  const lots = useCachedQuery('lots', listLots);

  const [leftId, setLeftId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);

  if (versions.loading || components.loading || lots.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const versionList = versions.data ?? [];
  if (versionList.length < 2) {
    return (
      <ErrorState
        variant={isOnline ? 'failed' : 'offline'}
        onRetry={versions.refetch}
      />
    );
  }

  // Default: the two most recent versions (list is ordered v-desc).
  const left = versionList.find((v) => v.id === leftId) ?? versionList[1];
  const right = versionList.find((v) => v.id === rightId) ?? versionList[0];

  const options = versionList.map((v) => ({
    id: v.id,
    label: `v${v.version_no}`,
    sublabel: v.changelog ?? undefined,
  }));

  const componentList = components.data ?? [];
  const lotList = lots.data ?? [];
  const leftRows = versionRows(left, componentList, lotList);
  const rightRows = versionRows(right, componentList, lotList);
  const amortization = profile?.case_amortization_firings ?? 10;
  const leftCost = costForVersion(left, lotList, amortization);
  const rightCost = costForVersion(right, lotList, amortization);

  return (
    <ScrollView contentContainerClassName="gap-5 p-6">
      <LoadDataDisclaimer />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <SelectField
            label={t.loads.version}
            placeholder={t.loads.version}
            options={options}
            value={left.id}
            onChange={setLeftId}
          />
        </View>
        <View className="flex-1">
          <SelectField
            label={t.loads.compareWith}
            placeholder={t.loads.version}
            options={options}
            value={right.id}
            onChange={setRightId}
          />
        </View>
      </View>

      <View className="rounded-xl border border-border bg-surface">
        <View className="flex-row border-b border-border p-3">
          <Text className="flex-1 text-xs font-semibold uppercase text-text-muted">
            {t.loads.parameter}
          </Text>
          <Text className="flex-1 text-right text-xs font-semibold text-text">
            v{left.version_no}
          </Text>
          <Text className="flex-1 text-right text-xs font-semibold text-text">
            v{right.version_no}
          </Text>
        </View>
        {leftRows.map((row, index) => {
          const changed = row.value !== rightRows[index].value;
          return (
            <View
              key={row.label}
              className={`flex-row items-start p-3 ${changed ? 'bg-surface-raised' : ''}`}
            >
              <Text className="flex-1 pr-2 text-sm text-text-muted">
                {row.label}
              </Text>
              <Text
                className={`flex-1 text-right text-sm ${changed ? 'font-semibold text-primary' : 'text-text'}`}
              >
                {row.value}
              </Text>
              <Text
                className={`flex-1 text-right text-sm ${changed ? 'font-semibold text-primary' : 'text-text'}`}
              >
                {rightRows[index].value}
              </Text>
            </View>
          );
        })}
        <View className="flex-row border-t border-border p-3">
          <Text className="flex-1 pr-2 text-sm font-semibold text-text">
            {t.loads.costPerRound}
          </Text>
          <Text className="flex-1 text-right text-sm font-semibold text-text">
            {formatEur(leftCost.total)}
          </Text>
          <Text className="flex-1 text-right text-sm font-semibold text-text">
            {formatEur(rightCost.total)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
