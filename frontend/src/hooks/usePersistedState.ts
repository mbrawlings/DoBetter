import * as React from 'react';
import { getPref, setPref } from '../providers/prefsStorage';

export function usePersistedState<T extends string>(
  key: string,
  defaultValue: T,
  allowed: readonly T[],
): [T, (next: T) => void] {
  const [value, setValue] = React.useState<T>(defaultValue);

  React.useEffect(() => {
    let active = true;
    getPref(key).then((stored) => {
      if (active && stored && (allowed as readonly string[]).includes(stored)) {
        setValue(stored as T);
      }
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

  return [value, set];
}
