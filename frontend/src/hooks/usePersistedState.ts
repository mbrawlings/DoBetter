import * as React from 'react';
import { getPref, setPref } from '../providers/prefsStorage';

export function usePersistedState<T extends string>(
  key: string,
  defaultValue: T,
  allowed: readonly T[],
): [T, (next: T) => void, boolean] {
  const [value, setValue] = React.useState<T>(defaultValue);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setReady(false);
    getPref(key)
      .then((stored) => {
        if (!active) return;
        if (stored && (allowed as readonly string[]).includes(stored)) {
          setValue(stored as T);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [key]);

  const set = React.useCallback(
    (next: T) => {
      setValue(next);
      void setPref(key, next);
    },
    [key],
  );

  return [value, set, ready];
}
