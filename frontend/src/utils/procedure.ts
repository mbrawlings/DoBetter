export type MoveDirection = 'up' | 'down';

export function moveItem<T>(items: readonly T[], index: number, direction: MoveDirection): T[] {
  let delta: number;
  switch (direction) {
    case 'up':
      delta = -1;
      break;
    case 'down':
      delta = 1;
      break;
    default: {
      const _exhaustive: never = direction;
      return _exhaustive;
    }
  }
  const target = index + delta;
  if (index < 0 || target < 0 || index >= items.length || target >= items.length) return [...items];
  const next = items.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}
