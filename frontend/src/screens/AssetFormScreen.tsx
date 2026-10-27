import * as React from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import SelectInput from '../components/inputs/SelectInput';
import ConfirmSheet from '../components/modals/ConfirmSheet';
import SelectSheet from '../components/modals/SelectSheet';
import {
  BackButton,
  FieldGroup,
  FieldRow,
  NavBar,
  NavLink,
  SectionLabel,
} from '../components/ui';
import {
  ASSET_QUERY,
  ASSETS_QUERY,
  CREATE_ASSET_MUTATION,
  DELETE_ASSET_MUTATION,
  UPDATE_ASSET_MUTATION,
} from '../graphql/operations';
import { colorsLight, fontFamily } from '../theme/theme';
import {
  Asset,
  Realm,
  blockedParentIds,
  isRealm,
  parentLabels,
  realmLabel,
} from '../utils/asset';

const REALM_CHOICES = ['Home', 'Vehicle', 'Trailer'] as const;
type RealmChoice = (typeof REALM_CHOICES)[number];
const NONE = 'None';

type AssetFields = {
  id: string;
  name: string;
  realm: string;
  parentId?: string | null;
  note?: string | null;
  favorite?: boolean | null;
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

function choiceForRealm(realm: Realm): RealmChoice {
  switch (realm) {
    case 'home':
      return 'Home';
    case 'vehicle':
      return 'Vehicle';
    case 'trailer':
      return 'Trailer';
    default: {
      const _exhaustive: never = realm;
      return _exhaustive;
    }
  }
}

function realmFromChoice(choice: RealmChoice): Realm {
  switch (choice) {
    case 'Home':
      return 'home';
    case 'Vehicle':
      return 'vehicle';
    case 'Trailer':
      return 'trailer';
    default: {
      const _exhaustive: never = choice;
      return _exhaustive;
    }
  }
}

function isRealmChoice(value: string): value is RealmChoice {
  switch (value) {
    case 'Home':
    case 'Vehicle':
    case 'Trailer':
      return true;
    default:
      return false;
  }
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function AssetFormScreen({ navigation }: any) {
  const route = useRoute() as any;
  const assetId: string | undefined = route.params?.id;
  const presetParentId: string | undefined = route.params?.parentId;
  const isEdit = Boolean(assetId);

  const { data, loading, error } = useQuery(ASSET_QUERY, {
    variables: { id: assetId! },
    skip: !isEdit,
    fetchPolicy: 'cache-and-network',
  });
  const { data: listData, loading: listLoading } = useQuery(ASSETS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const assets = React.useMemo(() => {
    const raw: AssetFields[] = listData?.assets ?? [];
    return raw.map(toAsset).filter((item): item is Asset => item !== null);
  }, [listData]);
  const client = useApolloClient();
  const [createAsset, { error: createError }] = useMutation(CREATE_ASSET_MUTATION);
  const [updateAsset, { error: updateError }] = useMutation(UPDATE_ASSET_MUTATION);
  const [deleteAsset] = useMutation(DELETE_ASSET_MUTATION);

  const asset = data?.asset as AssetFields | null | undefined;

  const [name, setName] = React.useState('');
  const [parentId, setParentId] = React.useState(isEdit ? '' : (presetParentId ?? ''));
  const [realm, setRealm] = React.useState<Realm>('home');
  const [note, setNote] = React.useState('');
  const [favorite, setFavorite] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [parentSheetVisible, setParentSheetVisible] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(!isEdit);

  React.useEffect(() => {
    if (!asset || !isRealm(asset.realm)) return;
    setName(asset.name ?? '');
    setParentId(asset.parentId ?? '');
    setRealm(asset.realm);
    setNote(asset.note ?? '');
    setFavorite(Boolean(asset.favorite));
    setHydrated(true);
  }, [asset]);

  React.useEffect(() => {
    if (isEdit || !parentId) return;
    const parent = assets.find((item) => item.id === parentId);
    if (parent) setRealm(parent.realm);
  }, [isEdit, parentId, assets]);

  const blocked = React.useMemo(() => blockedParentIds(assetId, assets), [assetId, assets]);
  const parentChoices = assets.filter((item) => !blocked.has(item.id));
  const labels = React.useMemo(() => parentLabels(parentChoices), [parentChoices]);
  const selectedParent = parentId ? assets.find((item) => item.id === parentId) : undefined;
  const parentMissing = Boolean(parentId) && Boolean(listData) && !selectedParent;
  const parentValue = !parentId
    ? NONE
    : (labels.get(parentId) ?? (listLoading ? 'Loading…' : NONE));
  const parentOptions = [NONE, ...parentChoices.map((item) => labels.get(item.id) ?? item.name)];

  const canSubmit = name.trim().length > 0 && !parentMissing && !submitting;

  function onPickParent(label: string) {
    setParentSheetVisible(false);
    if (label === NONE) {
      if (selectedParent) setRealm(selectedParent.realm);
      setParentId('');
      return;
    }
    const match = parentChoices.find((item) => labels.get(item.id) === label);
    if (!match) return;
    setParentId(match.id);
    setRealm(match.realm);
  }

  async function onSave() {
    if (!canSubmit) return;
    const input: {
      name: string;
      realm?: Realm;
      parentId?: string | null;
      note: string | null;
      favorite: boolean;
    } = {
      name: name.trim(),
      note: note.trim() ? note.trim() : null,
      favorite,
    };
    if (parentId) {
      input.parentId = parentId;
    } else {
      input.parentId = null;
      input.realm = realm;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateAsset({ variables: { id: assetId, input }, refetchQueries: ['Assets'] });
      } else {
        await createAsset({ variables: { input }, refetchQueries: ['Assets'] });
      }
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  }

  function openDeleteConfirm() {
    if (!isEdit || !assetId || submitting || deleting) return;
    setDeleteError(null);
    setConfirmVisible(true);
  }

  async function onConfirmDelete() {
    if (!assetId || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { data: result } = await deleteAsset({
        variables: { id: assetId },
        refetchQueries: ['Assets'],
      });
      if (!result?.deleteAsset) {
        throw new Error('Failed to delete asset');
      }
      client.cache.evict({
        id: client.cache.identify({ __typename: 'Asset', id: assetId }),
      });
      client.cache.gc();
      setConfirmVisible(false);
      const routes = navigation.getState?.()?.routes ?? [];
      const previous = routes[routes.length - 2];
      if (previous?.name === 'AssetHub') {
        navigation.pop(2);
      } else {
        navigation.goBack();
      }
    } catch (e) {
      setConfirmVisible(false);
      setDeleteError(errorMessage(e, 'Failed to delete asset'));
    } finally {
      setDeleting(false);
    }
  }

  if (isEdit && error) {
    return (
      <View style={styles.screen}>
        <NavBar title="Edit" leading={<BackButton onPress={() => navigation.goBack()} />} />
        <View style={[styles.center, { padding: 16 }]}>
          <Text style={styles.errorTitle}>Failed to load asset</Text>
          <Text style={styles.muted}>{String((error as any).message)}</Text>
        </View>
      </View>
    );
  }

  if (isEdit && !hydrated) {
    return (
      <View style={styles.screen}>
        <NavBar
          title="Edit"
          leading={<BackButton onPress={() => navigation.goBack()} />}
          trailing={<NavLink label="Save" disabled />}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colorsLight.primary} />
          <Text style={styles.muted}>Loading…</Text>
        </View>
      </View>
    );
  }

  const saveError = createError ?? updateError;
  const inheritedRealm = selectedParent?.realm ?? realm;

  return (
    <View style={styles.screen}>
      <NavBar
        title={isEdit ? 'Edit' : 'New asset'}
        leading={
          isEdit ? (
            <BackButton onPress={() => navigation.goBack()} />
          ) : (
            <NavLink label="Cancel" onPress={() => navigation.goBack()} />
          )
        }
        trailing={
          <NavLink label="Save" onPress={onSave} disabled={!canSubmit} loading={submitting} bold />
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SectionLabel>Name</SectionLabel>
        <FieldGroup>
          <FieldRow
            label="Name"
            value={name}
            onChangeText={setName}
            required
            placeholder="Required"
            textInputProps={{ autoCapitalize: 'words' }}
          />
        </FieldGroup>

        <SectionLabel>Where it lives</SectionLabel>
        <FieldGroup>
          <FieldRow
            label="Parent"
            value={parentValue}
            placeholder="None"
            variant="select"
            onPress={() => {
              Keyboard.dismiss();
              setParentSheetVisible(true);
            }}
          />
          {parentId ? (
            <FieldRow label="Realm" value={realmLabel(inheritedRealm)} variant="display" />
          ) : (
            <SelectInput
              label="Realm"
              value={choiceForRealm(realm)}
              options={REALM_CHOICES}
              required
              onChange={(value) => {
                if (isRealmChoice(value)) setRealm(realmFromChoice(value));
              }}
            />
          )}
          <FieldRow
            label="Favorite"
            value={favorite ? 'Yes' : 'No'}
            variant="display"
            onPress={() => setFavorite((current) => !current)}
            rightSlot={
              <Icon
                source={favorite ? 'star' : 'star-outline'}
                size={18}
                color={favorite ? colorsLight.primary : colorsLight.textFaint}
              />
            }
          />
        </FieldGroup>
        {parentMissing ? (
          <Text style={styles.errorBody}>That parent is no longer in the cabinet.</Text>
        ) : null}

        <SectionLabel>Note</SectionLabel>
        <FieldGroup>
          <FieldRow
            label="Note"
            value={note}
            onChangeText={setNote}
            multiline
            minLines={4}
            placeholder="Inventory, gotchas, what a previous owner changed…"
            textInputProps={{ autoCapitalize: 'sentences', maxLength: 4000 }}
          />
        </FieldGroup>

        {saveError ? <Text style={styles.errorBody}>{errorMessage(saveError, 'Failed to save asset')}</Text> : null}
        {deleteError ? <Text style={styles.errorBody}>{deleteError}</Text> : null}

        <View style={styles.footer}>
          {isEdit ? (
            <Pressable
              onPress={openDeleteConfirm}
              hitSlop={6}
              style={styles.deleteWrap}
              disabled={submitting || deleting}
            >
              <Text style={styles.deleteText}>Delete asset</Text>
            </Pressable>
          ) : (
            <Text style={styles.tipText}>
              A parent passes its realm down. Leave the parent empty for a home, vehicle, or trailer of its own.
            </Text>
          )}
        </View>
      </ScrollView>

      <SelectSheet
        visible={parentSheetVisible}
        title="Parent"
        options={parentOptions}
        value={parentValue}
        onSelect={onPickParent}
        onDismiss={() => setParentSheetVisible(false)}
      />

      <ConfirmSheet
        visible={confirmVisible}
        title="Delete asset?"
        message={
          name.trim()
            ? `Delete ${name.trim()}? This can't be undone.`
            : "Delete this asset? This can't be undone."
        }
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={onConfirmDelete}
        onDismiss={() => setConfirmVisible(false)}
      />
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
  },
  errorTitle: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: colorsLight.text,
  },
  errorBody: {
    marginTop: 12,
    marginHorizontal: 16,
    textAlign: 'center',
    fontFamily: fontFamily.regular,
    color: colorsLight.danger,
  },
  footer: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  deleteWrap: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  deleteText: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 15,
    color: colorsLight.danger,
    includeFontPadding: false,
  },
  tipText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colorsLight.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
});
