import { useSyncExternalStore } from 'react';

// Web only: whether the visitor has chosen to enter the app from the marketing
// site. Kept in memory on purpose, so opening the site URL always lands on the
// website first. Firebase keeps the user signed in independently of this flag.
let entered = false;
const listeners = new Set<() => void>();

function set(value: boolean) {
  if (entered === value) return;
  entered = value;
  listeners.forEach((l) => l());
}

export const enterApp = () => set(true);
export const leaveApp = () => set(false);

export function useAppEntered() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => entered,
    () => false,
  );
}
