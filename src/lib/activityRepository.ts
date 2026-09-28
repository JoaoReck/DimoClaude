import { Activity, RpgIconId } from '../types';
import { addDays, isDateKey, isTime, todayKey } from './dates';
import { inferRpgIcon, RPG_ICON_OPTIONS } from '../components/RpgIcon';

/**
 * Persistence boundary. V1 uses localStorage; replace this object with an
 * IndexedDB / API implementation later without touching any component.
 */
const KEY = 'dimo:activities:v3';
const LEGACY_KEY = 'dimo_activities_data_v2'; // { [dayOffset]: LegacyActivity[] }, kept as backup

const ICONS = new Set<string>(RPG_ICON_OPTIONS.map((o) => o.id));

function normalize(raw: any, fallbackDate?: string): Activity | null {
  if (!raw || typeof raw !== 'object') return null;
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const time = raw.time ?? raw.startTime;
  const date = raw.date ?? fallbackDate;
  if (!title || !isTime(time) || !isDateKey(date)) return null;
  const now = new Date().toISOString();
  return {
    id: typeof raw.id === 'string' ? raw.id : newId(),
    title,
    date,
    time,
    icon: (ICONS.has(raw.icon) ? raw.icon : inferRpgIcon(title, raw.category ?? '')) as RpgIconId,
    completed: Boolean(raw.completed),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
  };
}

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function migrateLegacy(): Activity[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown[]>;
    const today = todayKey();
    // The legacy format only knew "offset from today"; best effort is to anchor it to today.
    return Object.entries(parsed).flatMap(([offset, list]) =>
      Array.isArray(list)
        ? list.map((a) => normalize(a, addDays(today, Number(offset)))).filter((a): a is Activity => !!a)
        : []
    );
  } catch {
    return [];
  }
}

export const activityRepository = {
  key: KEY,
  load(): Activity[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === null) return migrateLegacy();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((a) => normalize(a)).filter((a): a is Activity => !!a) : [];
    } catch {
      return [];
    }
  },
  save(list: Activity[]): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (err) {
      console.error('Dimo: failed to persist activities', err);
    }
  },
};
