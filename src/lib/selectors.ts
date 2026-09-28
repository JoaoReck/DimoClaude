import { Activity, DateKey } from '../types';

export const forDate = (list: Activity[], date: DateKey): Activity[] =>
  list
    .filter((a) => a.date === date)
    .sort((a, b) => a.time.localeCompare(b.time) || a.createdAt.localeCompare(b.createdAt));

/** Derived on demand: never stored, so it can never drift out of sync. */
export const progress = (day: Activity[]) => ({
  done: day.filter((a) => a.completed).length,
  total: day.length,
});

export const nextStep = (day: Activity[]): Activity | undefined => day.find((a) => !a.completed);
