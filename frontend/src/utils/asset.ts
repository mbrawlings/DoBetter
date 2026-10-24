export const REALMS = ['home', 'vehicle', 'trailer'] as const;
export type Realm = (typeof REALMS)[number];

export type Asset = {
  id: string;
  name: string;
  realm: Realm;
  parentId?: string | null;
  note?: string | null;
  favorite: boolean;
};

export function isRealm(value: string): value is Realm {
  return (REALMS as readonly string[]).includes(value);
}

export function realmLabel(realm: Realm): string {
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

export function blockedParentIds(assetId: string | undefined, assets: Asset[]): Set<string> {
  const blocked = new Set<string>();
  if (!assetId) return blocked;
  blocked.add(assetId);
  const children = new Map<string, string[]>();
  for (const asset of assets) {
    if (!asset.parentId) continue;
    const list = children.get(asset.parentId) ?? [];
    list.push(asset.id);
    children.set(asset.parentId, list);
  }
  const stack = [...(children.get(assetId) ?? [])];
  while (stack.length) {
    const id = stack.pop();
    if (!id || blocked.has(id)) continue;
    blocked.add(id);
    stack.push(...(children.get(id) ?? []));
  }
  return blocked;
}

export function parentLabels(assets: Asset[]): Map<string, string> {
  const counts = new Map<string, number>();
  for (const asset of assets) {
    counts.set(asset.name, (counts.get(asset.name) ?? 0) + 1);
  }
  const labels = new Map<string, string>();
  const used = new Map<string, number>();
  const ordered = [...assets].sort((a, b) => a.name.localeCompare(b.name));
  for (const asset of ordered) {
    let label = asset.name;
    if ((counts.get(asset.name) ?? 0) > 1) {
      const parent = assets.find((other) => other.id === asset.parentId);
      const suffix = parent ? parent.name : realmLabel(asset.realm);
      label = `${asset.name} · ${suffix}`;
    }
    const seen = used.get(label) ?? 0;
    used.set(label, seen + 1);
    if (seen > 0) label = `${label} · ${asset.id.slice(-4)}`;
    labels.set(asset.id, label);
  }
  return labels;
}

export type DisplayRow = {
  asset: Asset;
  depth: number;
  parentName: string;
};

export function groupAssets(assets: Asset[], visibleIds: Set<string>): DisplayRow[] {
  const byId = new Map(assets.map((asset) => [asset.id, asset]));
  const children = new Map<string, Asset[]>();
  for (const asset of assets) {
    if (!asset.parentId) continue;
    const list = children.get(asset.parentId) ?? [];
    list.push(asset);
    children.set(asset.parentId, list);
  }
  for (const list of children.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const tops = assets
    .filter((asset) => {
      if (!visibleIds.has(asset.id)) return false;
      if (!asset.parentId) return true;
      return !visibleIds.has(asset.parentId);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const rows: DisplayRow[] = [];
  const seen = new Set<string>();
  function walk(asset: Asset, depth: number) {
    if (seen.has(asset.id)) return;
    seen.add(asset.id);
    const parent = asset.parentId ? byId.get(asset.parentId) : undefined;
    rows.push({
      asset,
      depth,
      parentName: depth === 0 && parent ? parent.name : '',
    });
    for (const child of children.get(asset.id) ?? []) {
      if (!visibleIds.has(child.id)) continue;
      walk(child, depth + 1);
    }
  }
  for (const top of tops) walk(top, 0);
  return rows;
}
