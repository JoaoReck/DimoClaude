import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityDraft, DateKey, ViewMode } from './types';
import { addDays, hourToTime, todayKey } from './lib/dates';
import { forDate, nextStep, progress } from './lib/selectors';
import { useActivities } from './hooks/useActivities';
import { useNow } from './hooks/useNow';
import { useHorizontalSwipe } from './hooks/useHorizontalSwipe';
import { useMobilePWA } from './utils/useMobilePWA';
import { inferRpgIcon } from './components/RpgIcon';
import { Header } from './components/Header';
import { DaySelector } from './components/DaySelector';
import { TimelineView } from './components/TimelineView';
import { ChecklistView } from './components/ChecklistView';
import { CalendarView } from './components/CalendarView';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { ActivitySheet, SheetState } from './components/ActivitySheet';
import { FooterBar } from './components/FooterBar';
import { InstallBanner } from './components/InstallBanner';
import { InstallGuideModal } from './components/InstallGuideModal';

export default function App() {
  const { activities, add, update, toggle, remove } = useActivities();
  const pwa = useMobilePWA();
  const now = useNow();
  const today = todayKey();

  // Core UI state. Everything else is derived.
  const [view, setView] = useState<ViewMode>('timeline');
  const [selectedDate, setSelectedDate] = useState<DateKey>(today);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [centerKey, setCenterKey] = useState(0);

  const isToday = selectedDate === today;
  const day = useMemo(() => forDate(activities, selectedDate), [activities, selectedDate]);
  const next = useMemo(() => nextStep(day), [day]);
  const { done, total } = useMemo(() => progress(day), [day]);
  const detail = useMemo(() => activities.find((a) => a.id === detailId) ?? null, [activities, detailId]);

  // Date navigation: the ONLY place the date changes (arrows, swipe, keys, calendar).
  const goPrev = useCallback(() => { setSelectedDate((d) => addDays(d, -1)); setSelectedHour(null); }, []);
  const goNext = useCallback(() => { setSelectedDate((d) => addDays(d, 1)); setSelectedHour(null); }, []);
  const goToday = useCallback(() => {
    setSelectedDate(todayKey());
    setSelectedHour(null);
    setCenterKey((k) => k + 1);
  }, []);
  const pickDate = useCallback((d: DateKey) => { setSelectedDate(d); setSelectedHour(null); }, []);

  const swipe = useHorizontalSwipe(goNext, goPrev); // swipe left = next day

  // Creation
  const openCreate = useCallback(
    (hour: number) => {
      setSelectedHour(hour);
      setSheet({ initial: { title: '', date: selectedDate, time: hourToTime(hour), icon: inferRpgIcon('', '') } });
    },
    [selectedDate]
  );

  const save = useCallback(
    (draft: ActivityDraft, editingId?: string) => {
      if (editingId) update(editingId, draft);
      else add(draft);
      setSheet(null);
    },
    [add, update]
  );

  const openEdit = useCallback((id: string) => {
    const a = activities.find((x) => x.id === id);
    if (!a) return;
    setDetailId(null);
    setSheet({ editingId: a.id, initial: { title: a.title, date: a.date, time: a.time, icon: a.icon } });
  }, [activities]);

  // Keyboard (desktop): arrows change day, 1/2/3 switch view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (sheet || detailId || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === '1') setView('timeline');
      else if (e.key === '2') setView('checklist');
      else if (e.key === '3') setView('calendar');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet, detailId, goPrev, goNext]);

  // The page itself never scrolls; only view containers do.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  const scroller = 'w-full flex-1 min-h-0 overflow-y-auto overscroll-contain pb-6';

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#EDE8D0] text-[#141410] flex flex-col font-sans">
      <header className="shrink-0 z-30 bg-[#EDE8D0] border-b border-[#C4C0AB] select-none toolbar-container">
        <Header currentView={view} onViewChange={setView} />
        <DaySelector date={selectedDate} today={today} onPrev={goPrev} onNext={goNext} onToday={goToday} />
      </header>

<main {...swipe} className="w-full flex-1 min-h-0 relative flex flex-col touch-pan-y">
  {view === 'timeline' && (
    <TimelineView
      activities={day}
      date={selectedDate}
      isToday={isToday}
      now={now}
      selectedHour={selectedHour ?? (isToday && !day.some((a) => new Date(`${a.date}T${a.time}`).getHours() === now.getHours()) ? now.getHours() : null)}
      nextId={next?.id}
      centerKey={centerKey}
      onSelectEmptyHour={openCreate}
      onOpenDetail={setDetailId}
      onToggle={toggle}
    />
  )}
  {view === 'checklist' && (
    <div className={scroller}>
      <ChecklistView activities={day} nextId={next?.id} onToggle={toggle} onOpenDetail={setDetailId} onGoTimeline={() => setView('timeline')} />
    </div>
  )}
  {view === 'calendar' && (
    <div className={scroller}>
      <CalendarView all={activities} day={day} date={selectedDate} today={today} nextId={next?.id} onSelectDate={pickDate} onToggle={toggle} onOpenDetail={setDetailId} onCreateAt={openCreate} />
    </div>
  )}
</main>

      <FooterBar done={done} total={total} />

      <ActivityDetailModal
        activity={detail}
        today={today}
        onClose={() => setDetailId(null)}
        onToggle={toggle}
        onEdit={(a) => openEdit(a.id)}
        onDelete={(id) => { remove(id); setDetailId(null); }}
      />
      <ActivitySheet state={sheet} onClose={() => setSheet(null)} onSave={save} />

      {pwa.isMobile && !pwa.isStandalone && !pwa.hasDismissedBanner && (
        <InstallBanner isIOS={pwa.isIOS} canInstallNative={pwa.canInstallNative} onOpenGuide={pwa.openGuide} onNativeInstall={pwa.triggerNativeInstall} onDismiss={pwa.dismissBanner} />
      )}
      <InstallGuideModal isOpen={pwa.isGuideOpen} onClose={pwa.closeGuide} onConfirmAdded={pwa.confirmGuideCompleted} isIOS={pwa.isIOS} />
    </div>
  );
}
