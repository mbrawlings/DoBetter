const MAX_TAG_LENGTH = 32;
const MAX_TAGS = 20;

/**
 * Normalize a single tag (mirrors backend/utils/normalizeTags.js).
 * Returns null when the result is empty.
 */
export function normalizeTag(raw: string): string | null {
  let tag = raw.trim().toLowerCase();
  tag = tag.replace(/[\s_]+/g, '-');
  tag = tag.replace(/[^a-z0-9-]/g, '');
  tag = tag.replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!tag) return null;
  if (tag.length > MAX_TAG_LENGTH) tag = tag.slice(0, MAX_TAG_LENGTH).replace(/-$/, '');
  return tag || null;
}

/**
 * Normalize a list of tags: drop empties, dedupe (order preserved), cap at 20.
 */
export function normalizeTags(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const tag = normalizeTag(raw);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}
