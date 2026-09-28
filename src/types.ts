export type RpgIconId =
  | 'sword' | 'potion' | 'book' | 'scroll' | 'campfire'
  | 'meat' | 'shield' | 'torch' | 'chest' | 'gem';

/** "YYYY-MM-DD" in the user's local timezone. The one real identity of a day. */
export type DateKey = string;

/**
 * The single source of truth. Timeline, Checklist and Calendar are only
 * different views over `Activity[]`.
 *
 * Future fields (description, location, photo, notes, reminders, recurrence)
 * can be added as optional properties; storage migrates via `normalize`.
 */
export interface Activity {
  id: string;
  title: string;
  date: DateKey;
  time: string; // "HH:MM"
  icon: RpgIconId;
  completed: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type ActivityDraft = Pick<Activity, 'title' | 'date' | 'time' | 'icon'>;

export type ViewMode = 'timeline' | 'checklist' | 'calendar';
