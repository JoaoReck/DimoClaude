import { useCallback, useEffect, useState } from 'react';
import { Activity, ActivityDraft } from '../types';
import { activityRepository, newId } from '../lib/activityRepository';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>(() => activityRepository.load());

  useEffect(() => {
    activityRepository.save(activities);
  }, [activities]);

  // Keep several open tabs / the PWA window consistent.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === activityRepository.key) setActivities(activityRepository.load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((draft: ActivityDraft) => {
    const now = new Date().toISOString();
    setActivities((prev) => [
      ...prev,
      { ...draft, id: newId(), completed: false, createdAt: now, updatedAt: now },
    ]);
  }, []);

  const update = useCallback((id: string, patch: Partial<ActivityDraft>) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  const toggle = useCallback((id: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, completed: !a.completed, updatedAt: new Date().toISOString() } : a
      )
    );
  }, []);

  const remove = useCallback((id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { activities, add, update, toggle, remove };
}
