/** Recursively omit Apollo `__typename` fields from a value. */
export function stripTypename<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripTypename(item)) as T;
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key === '__typename') continue;
      out[key] = stripTypename(nested);
    }
    return out as T;
  }
  return value;
}
