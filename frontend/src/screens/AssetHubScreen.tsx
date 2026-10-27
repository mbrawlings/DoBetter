import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { formatHumanDate } from '../components/inputs/DateInput';
import { BackButton, NavBar, NavLink, SectionLabel } from '../components/ui';
import { ASSET_LOGS_QUERY, ASSET_QUERY, ASSETS_QUERY, PROCEDURES_QUERY } from '../graphql/operations';
import { colorsLight, fontFamily, radius } from '../theme/theme';
import { Asset, descendantIds, isRealm, realmLabel } from '../utils/asset';
import { dayOfMonth, formatCost, formatMeter, groupLogsByMonth } from '../utils/log';

const NOTE_PREVIEW_LINES = 4;

type AssetFields = {
  id: string;
  name: string;
  realm: string;
  parentId?: string | null;
  note?: string | null;
  favorite?: boolean | null;
};

type ProcedureRow = {
  id: string;
  assetId: string;
  title: string;
};

type LogRow = {
  id: string;
  assetId: string;
  procedureId: string;
  date?: string | null;
  cost?: number | null;
  note?: string | null;
  title: string;
  meter?: { unit: string; value: number } | null;
};

function toAsset(raw: AssetFields): Asset | null {
  if (!isRealm(raw.realm)) return null;
  return {
    id: raw.id,
    name: raw.name,
    realm: raw.realm,
    parentId: raw.parentId,
    note: raw.note,
    favorite: Boolean(raw.favorite),
  };
}

function lastDoneLabel(log: LogRow | undefined): string {
  if (!log) return '';
  return [formatCost(log.cost), formatMeter(log.meter)].filter(Boolean).join(' · ');
}

export default function AssetHubScreen({ navigation }: any) {
  const route = useRoute() as any;
  const assetId: string | undefined = route.params?.id;

  const { data, loading, error, refetch } = useQuery(ASSET_QUERY, {
    variables: { id: assetId! },
    skip: !assetId,
    fetchPolicy: 'cache-and-network',
  });
  const { data: listData, refetch: refetchAssets } = useQuery(ASSETS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const assets = React.useMemo(() => {
    const raw: AssetFields[] = listData?.assets ?? [];
    return raw.map(toAsset).filter((item): item is Asset => item !== null);
  }, [listData]);
  const procedureAssetIds = React.useMemo(() => {
    if (!assetId) return [];
    const ids = assets.filter((item) => item.parentId === assetId).map((item) => item.id);
    ids.unshift(assetId);
    return ids;
  }, [assets, assetId]);
  const { data: proceduresData, refetch: refetchProcedures } = useQuery(PROCEDURES_QUERY, {
    variables: { assetIds: procedureAssetIds },
    skip: !assetId,
    fetchPolicy: 'cache-and-network',
  });
  const timelineAssetIds = React.useMemo(
    () => (assetId ? descendantIds(assetId, assets) : []),
    [assetId, assets],
  );
  const { data: logsData, refetch: refetchLogs } = useQuery(ASSET_LOGS_QUERY, {
    variables: { assetIds: timelineAssetIds },
    skip: !assetId || timelineAssetIds.length === 0,
    fetchPolicy: 'cache-and-network',
  });

  useFocusEffect(
    React.useCallback(() => {
      if (!assetId) return;
      refetch();
      refetchAssets();
      refetchProcedures();
      if (timelineAssetIds.length > 0) refetchLogs();
    }, [assetId, refetch, refetchAssets, refetchProcedures, timelineAssetIds, refetchLogs]),
  );

  const raw = data?.asset as AssetFields | null | undefined;
  const asset = raw && isRealm(raw.realm) ? toAsset(raw) : null;
  const procedures: ProcedureRow[] = proceduresData?.proceduresForAssets ?? [];
  const logs: LogRow[] = logsData?.logsForAssets ?? [];
  const latestByProcedure = React.useMemo(() => {
    const map = new Map<string, LogRow>();
    for (const log of logs) {
      if (!map.has(log.procedureId)) map.set(log.procedureId, log);
    }
    return map;
  }, [logs]);

  if (!assetId) {
    return (
      <View style={styles.screen}>
        <NavBar title="" leading={<BackButton label="Cabinet" onPress={() => navigation.goBack()} />} />
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Asset not found</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <NavBar title="" leading={<BackButton label="Cabinet" onPress={() => navigation.goBack()} />} />
        <View style={[styles.center, { padding: 16 }]}>
          <Text style={styles.errorTitle}>Failed to load asset</Text>
          <Text style={styles.muted}>{String((error as any).message)}</Text>
        </View>
      </View>
    );
  }

  if (loading && !asset) {
    return (
      <View style={styles.screen}>
        <NavBar title="" leading={<BackButton label="Cabinet" onPress={() => navigation.goBack()} />} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colorsLight.primary} />
        </View>
      </View>
    );
  }

  if (!asset) {
    return (
      <View style={styles.screen}>
        <NavBar title="" leading={<BackButton label="Cabinet" onPress={() => navigation.goBack()} />} />
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Asset not found</Text>
        </View>
      </View>
    );
  }

  const parent = asset.parentId ? assets.find((item) => item.id === asset.parentId) : undefined;
  const isPlace = !asset.parentId;
  const backLabel = isPlace ? 'Cabinet' : (parent?.name ?? 'Back');
  const subtitle = isPlace ? realmLabel(asset.realm) : [parent?.name, realmLabel(asset.realm)].filter(Boolean).join(' · ');
  const children = assets
    .filter((item) => item.parentId === asset.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const ownProcedures = procedures.filter((procedure) => procedure.assetId === asset.id);
  const months = groupLogsByMonth(logs);
  const note = asset.note?.trim() ?? '';

  function openEdit() {
    navigation.push('Asset', { id: assetId });
  }

  return (
    <View style={styles.screen}>
      <NavBar
        title={asset.name}
        leading={<BackButton label={backLabel} onPress={() => navigation.goBack()} />}
        trailing={<NavLink label="Edit" onPress={openEdit} bold />}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerBody}>
            <Text style={styles.name}>{asset.name}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {asset.favorite ? <Icon source="star" size={18} color={colorsLight.primary} /> : null}
        </View>

        {note ? (
          <>
            <SectionLabel>Note</SectionLabel>
            <Pressable onPress={openEdit} style={styles.noteCard}>
              <Text style={styles.noteText} numberOfLines={NOTE_PREVIEW_LINES}>
                {note}
              </Text>
            </Pressable>
          </>
        ) : null}

        <SectionLabel
          action={{ label: 'Add', onPress: () => navigation.push('Procedure', { assetId: asset.id }) }}
        >
          Procedures
        </SectionLabel>
        {ownProcedures.length === 0 ? (
          <Text style={styles.empty}>None yet.</Text>
        ) : (
          <View style={styles.group}>
            {ownProcedures.map((procedure, index) => {
              const last = index === ownProcedures.length - 1;
              const done = latestByProcedure.get(procedure.id);
              const doneLabel = [done ? formatHumanDate(done.date ?? '') : '', lastDoneLabel(done)]
                .filter(Boolean)
                .join(' · ');
              return (
                <Pressable
                  key={procedure.id}
                  onPress={() => navigation.push('Procedure', { assetId: asset.id, id: procedure.id })}
                  style={[styles.row, last ? null : styles.rowDivider]}
                >
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{procedure.title}</Text>
                    {doneLabel ? <Text style={styles.rowMeta}>{doneLabel}</Text> : null}
                  </View>
                  <Icon source="chevron-right" size={18} color={colorsLight.textFaint} />
                </Pressable>
              );
            })}
          </View>
        )}

        {isPlace ? (
          <>
            <SectionLabel>Timeline</SectionLabel>
            {months.length === 0 ? (
              <Text style={styles.empty}>Nothing logged yet.</Text>
            ) : (
              months.map((month) => (
                <View key={month.key} style={styles.monthBlock}>
                  <Text style={styles.monthLabel}>{month.label}</Text>
                  {month.logs.map((entry, index) => {
                    const last = index === month.logs.length - 1;
                    const componentName =
                      entry.assetId !== asset.id ? assets.find((item) => item.id === entry.assetId)?.name : '';
                    const detail = [formatCost(entry.cost), formatMeter(entry.meter), entry.note, componentName]
                      .filter(Boolean)
                      .join(' · ');
                    return (
                      <Pressable
                        key={entry.id}
                        onPress={() => navigation.push('Log', { procedureId: entry.procedureId, id: entry.id })}
                        style={[styles.timelineRow, last ? null : styles.timelineDivider]}
                      >
                        <Text style={styles.day}>{dayOfMonth(entry.date)}</Text>
                        <View style={styles.timelineBody}>
                          <Text style={styles.timelineTitle}>{entry.title}</Text>
                          {detail ? (
                            <Text style={styles.timelineDetail} numberOfLines={2}>
                              {detail}
                            </Text>
                          ) : null}
                        </View>
                        <Icon source="chevron-right" size={18} color={colorsLight.textFaint} />
                      </Pressable>
                    );
                  })}
                </View>
              ))
            )}
          </>
        ) : null}

        <SectionLabel
          action={{ label: 'Add', onPress: () => navigation.push('Asset', { parentId: asset.id }) }}
        >
          Components
        </SectionLabel>
        {children.length === 0 ? (
          <Text style={styles.empty}>
            {isPlace ? 'None yet.' : 'None yet. A component inherits this realm.'}
          </Text>
        ) : (
          children.map((child) => {
            const childProcedures = procedures.filter((procedure) => procedure.assetId === child.id);
            return (
              <View key={child.id} style={styles.group}>
                <Pressable
                  onPress={() => navigation.push('AssetHub', { id: child.id })}
                  style={[styles.row, styles.rowDivider]}
                >
                  <Text style={[styles.rowTitle, styles.rowTitleFlex]}>{child.name}</Text>
                  {child.favorite ? <Icon source="star" size={16} color={colorsLight.primary} /> : null}
                  <Icon source="chevron-right" size={18} color={colorsLight.textFaint} />
                </Pressable>
                {childProcedures.map((procedure) => (
                  <Pressable
                    key={procedure.id}
                    onPress={() => navigation.push('Procedure', { assetId: child.id, id: procedure.id })}
                    style={[styles.row, styles.procedureRow, styles.rowDivider]}
                  >
                    <Text style={styles.procedureName}>{procedure.title}</Text>
                    <Icon source="chevron-right" size={18} color={colorsLight.textFaint} />
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => navigation.push('Procedure', { assetId: child.id })}
                  style={styles.addProcedure}
                >
                  <Text style={styles.addProcedureLabel}>Add procedure</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorsLight.bg,
  },
  scroll: {
    paddingBottom: 60,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    fontFamily: fontFamily.regular,
    color: colorsLight.textMuted,
    marginTop: 12,
    textAlign: 'center',
  },
  errorTitle: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: colorsLight.text,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  headerBody: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: -0.6,
    color: colorsLight.text,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    color: colorsLight.textMuted,
    marginTop: 3,
  },
  noteCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colorsLight.raised,
    borderWidth: 1,
    borderColor: colorsLight.borderStrong,
  },
  noteText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colorsLight.text,
  },
  empty: {
    marginHorizontal: 24,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colorsLight.textMuted,
  },
  monthBlock: {
    marginBottom: 8,
  },
  monthLabel: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 2,
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 13,
    color: colorsLight.textMuted,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    paddingRight: 16,
    paddingLeft: 12,
  },
  timelineDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colorsLight.border,
    marginLeft: 52,
  },
  day: {
    width: 28,
    paddingTop: 1,
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: colorsLight.textMuted,
    textAlign: 'right',
  },
  timelineBody: {
    flex: 1,
    gap: 2,
  },
  timelineTitle: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: colorsLight.text,
  },
  timelineDetail: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colorsLight.textMuted,
  },
  group: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colorsLight.border,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 15,
    color: colorsLight.text,
  },
  rowTitleFlex: {
    flex: 1,
  },
  rowMeta: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colorsLight.textMuted,
  },
  procedureRow: {
    paddingLeft: 28,
  },
  procedureName: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colorsLight.text,
  },
  addProcedure: {
    paddingVertical: 12,
    paddingLeft: 28,
    paddingRight: 16,
  },
  addProcedureLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    color: colorsLight.primary,
  },
});
