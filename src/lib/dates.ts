import { DateKey } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');

export const toDateKey = (d: Date): DateKey =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parses at local noon so DST shifts never change the calendar day. */
export const parseDateKey = (key: DateKey): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

export const isDateKey = (v: unknown): v is DateKey =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(parseDateKey(v).getTime());

export const isTime = (v: unknown): v is string =>
  typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

export const todayKey = (): DateKey => toDateKey(new Date());

export const addDays = (key: DateKey, n: number): DateKey => {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
};

export const daysBetween = (from: DateKey, to: DateKey): number =>
  Math.round((parseDateKey(to).getTime() - parseDateKey(from).getTime()) / 86_400_000);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Hoje" / "Amanhã" / "Ontem" / "Quarta" + "24 de outubro". */
export function describeDate(key: DateKey, today: DateKey = todayKey()) {
  const d = parseDateKey(key);
  const diff = daysBetween(today, key);
  const weekday = cap(d.toLocaleDateString('pt-BR', { weekday: 'long' }));
  const primary = diff === 0 ? 'Hoje' : diff === 1 ? 'Amanhã' : diff === -1 ? 'Ontem' : weekday;
  const secondary = `${weekday.split('-')[0]}, ${d.getDate()} de ${d.toLocaleDateString('pt-BR', { month: 'long' })}`;
  return { primary, secondary, isToday: diff === 0 };
}

export const hourToTime = (h: number) => `${pad(h)}:00`;
export const timeToHour = (t: string) => parseInt(t.slice(0, 2), 10);

/** 6 rows x 7 cols starting on Sunday, with keys for every cell. */
export function monthGrid(year: number, month: number): { key: DateKey; inMonth: boolean }[] {
  const first = new Date(year, month, 1, 12);
  const start = new Date(year, month, 1 - first.getDay(), 12);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { key: toDateKey(d), inMonth: d.getMonth() === month };
  });
}

export const monthTitle = (year: number, month: number) =>
  cap(new Date(year, month, 1, 12).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
